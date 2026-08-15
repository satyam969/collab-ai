"use client";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom } from "@liveblocks/react/suspense";
import { useEffect, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";

// Module-level lock to prevent double-initialization in React Strict Mode
// or when switching files rapidly.
const initializingFiles = new Set();

export default function CollaborativeEditor({ fileId, language, theme = "vs-dark", onChange, initialContent, externalUpdateCount }) {
    const room = useRoom();
    const [provider, setProvider] = useState(null);
    const [editor, setEditor] = useState(null);
    const [doc, setDoc] = useState(null);
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
    // Track whether Liveblocks has fully synced the remote document.
    // Apply Updates is BLOCKED until this is true to prevent the race condition
    // where the user clicks the button while yText is still empty (not yet loaded
    // from the server), causing our insert to collide with the incoming server sync.
    const [isSynced, setIsSynced] = useState(false);

    // Initialize Y.Doc and Provider once per room
    useEffect(() => {
        const yDoc = new Y.Doc();
        const yProvider = new LiveblocksYjsProvider(room, yDoc);
        setDoc(yDoc);
        setProvider(yProvider);
        setIsSynced(false); // Reset sync state on new connection

        const onSynced = () => setIsSynced(true);

        if (yProvider.synced) {
            setIsSynced(true);
        } else {
            yProvider.on("synced", onSynced);
        }

        return () => {
            yProvider.off("synced", onSynced);
            yDoc.destroy();
            yProvider.destroy();
        };
    }, [room]);

    const handleEditorDidMount = (editor, monaco) => {
        setEditor(editor);
        // Show initialContent immediately to prevent the blank flicker while
        // Liveblocks connects. Once provider syncs, the Yjs binding will take over.
        if (typeof initialContent === 'string') {
            editor.setValue(initialContent);
        }
        editor.onDidChangeModelContent(() => {
            if (onChange) {
                onChange(editor.getValue());
            }
        });
    };

    // Bind Yjs to Monaco when editor/doc/provider/fileId changes
    useEffect(() => {
        if (!editor || !doc || !provider || !fileId) return;

        const yText = doc.getText(fileId);
        const model = editor.getModel();

        if (!model) return;

        // Create binding
        const binding = new MonacoBinding(
            yText,
            model,
            new Set([editor]),
            provider.awareness
        );

        // Handle initial content synchronization
        const handleSync = () => {
            const currentContent = yText.toString();
            const initMap = doc.getMap('initialization');
            const isInitialized = initMap.get(fileId);
            const isLocallyLocked = initializingFiles.has(fileId);

            console.log(`[CollaborativeEditor] Synced. Len: ${currentContent.length}, Init: ${isInitialized}, Lock: ${isLocallyLocked}`);

            // Check 1: Is it already initialized on server?
            if (isInitialized) {
                console.log("[CollaborativeEditor] SKIP: Already initialized on server.");
                return;
            }

            // Check 2: Is it locked locally? (Strict Mode protection)
            if (isLocallyLocked) {
                console.log("[CollaborativeEditor] SKIP: Local initialization lock active.");
                return;
            }

            // Check 3: Is content truly empty?
            if (currentContent !== "") {
                console.log(`[CollaborativeEditor] SKIP: Content not empty.`);
                return;
            }

            if (initialContent) {
                console.log("[CollaborativeEditor] INSERTING initial content...");

                // Apply Local Lock
                initializingFiles.add(fileId);

                doc.transact(() => {
                    // Apply Server Flag
                    initMap.set(fileId, true);
                    yText.insert(0, initialContent);
                });

                // Release Local Lock after delay
                setTimeout(() => {
                    initializingFiles.delete(fileId);
                }, 5000);
            }
        };

        if (provider.synced) {
            handleSync();
        } else {
            provider.once("synced", handleSync);
        }

        return () => {
            binding.destroy();
            provider.off("synced", handleSync);
        };
    }, [editor, doc, provider, fileId]); // Removed initialContent dependency to prevent re-runs loop

    useEffect(() => {
        if (externalUpdateCount && externalUpdateCount > 0) {
            setShowUpdatePrompt(true);
        }
    }, [externalUpdateCount]);

    // Generate a unique path suffix to ensure Monaco creates a fresh model.
    // This prevents the editor from loading cached content causing duplication
    // when merging with Yjs remote content.
    const [uniqueId] = useState(Date.now());
    const editorPath = `${fileId}-${uniqueId}`;

    // Apply AI/External updates via direct Yjs transaction — this is the ONLY
    // safe way to replace content for ALL connected peers atomically.
    // CRITICAL: We MUST wait for isSynced before running this. If yText is still
    // empty (Liveblocks not yet synced), inserting new content and then having
    // Liveblocks sync the old content on top causes DUPLICATION.
    const applyExternalUpdate = () => {
        if (!isSynced) {
            alert("Please wait — the Live Room is still connecting. Try again in a moment.");
            return;
        }
        if (doc && fileId && typeof initialContent === 'string') {
            const confirmReset = window.confirm("This will apply the new updates to the Live Room for everyone. Continue?");
            if (!confirmReset) return;

            console.log("Applying external update via Yjs for", fileId);

            const yText = doc.getText(fileId);
            doc.transact(() => {
                // Atomically wipe and replace — Yjs broadcasts this to ALL peers
                if (yText.length > 0) {
                    yText.delete(0, yText.length);
                }
                yText.insert(0, initialContent);
                doc.getMap('initialization').set(fileId, true);
            });

            setShowUpdatePrompt(false);
        }
    };

    return (
        <div className="h-full w-full overflow-hidden relative group">
            {/* Sync loading indicator — shown while Liveblocks is connecting */}
            {!isSynced && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#1e1e1e]/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <svg className="animate-spin h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span className="text-xs">Connecting to Live Room…</span>
                    </div>
                </div>
            )}

            {/* Update Prompt Toast */}
            {showUpdatePrompt && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-4 animate-fade-in-down">
                    <span className="text-sm font-medium">AI generated new code for this file.</span>
                    <button
                        onClick={() => applyExternalUpdate()}
                        disabled={!isSynced}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                            isSynced
                                ? 'bg-white text-blue-600 hover:bg-gray-100'
                                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }`}
                        title={!isSynced ? "Waiting for Live Room to sync…" : ""}
                    >
                        {isSynced ? 'Apply Updates' : 'Syncing…'}
                    </button>
                    <button
                        onClick={() => setShowUpdatePrompt(false)}
                        className="text-white hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Hover Reset Button */}
            <button
                onClick={applyExternalUpdate}
                disabled={!isSynced}
                className="absolute bottom-4 right-6 z-50 bg-gray-800/80 hover:bg-blue-600 text-gray-300 hover:text-white px-3 py-1.5 text-xs rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 border border-white/10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 disabled:cursor-not-allowed"
                title="Apply AI updates to the Live Room"
            >
                Apply Updates
            </button>
            <MonacoEditor
                height="100%"
                language={language}
                theme={theme}
                path={editorPath}
                onMount={handleEditorDidMount}
                options={{
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                }}
            />
        </div>
    );
}
