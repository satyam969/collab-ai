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

export default function CollaborativeEditor({ fileId, language, theme = "vs-dark", onChange, initialContent }) {
    const room = useRoom();
    const [provider, setProvider] = useState(null);
    const [editor, setEditor] = useState(null);
    const [doc, setDoc] = useState(null);

    // Initialize Y.Doc and Provider once per room
    useEffect(() => {
        const yDoc = new Y.Doc();
        const yProvider = new LiveblocksYjsProvider(room, yDoc);
        setDoc(yDoc);
        setProvider(yProvider);

        return () => {
            yDoc.destroy();
            yProvider.destroy();
        };
    }, [room]);

    const handleEditorDidMount = (editor, monaco) => {
        setEditor(editor);
        editor.onDidChangeModelContent(() => {
            if (onChange) {
                onChange(editor.getValue());
            }
        });
    };

    // Bind Yjs to Monaco when fileId changes
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
                console.log(`[CollaborativeEditor] SKIP: Content not empty. (Equality check: ${currentContent === initialContent})`);
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
            // Cleanup binding but KEEP the doc/provider active if possible,
            // though currently we destroy them on unmount (useEffect cleanup).
            // That causes the 're-sync' loop issue if parent re-renders.
            binding.destroy();
            provider.off("synced", handleSync);
        };
    }, [editor, doc, provider, fileId]); // Removed initialContent dependency to prevent re-runs loop

    // Generate a unique path suffix to ensure Monaco creates a fresh model
    // This prevents the editor from loading cached content which causes duplication
    // when merging with Yjs remote content.
    const [uniqueId] = useState(Date.now());
    const editorPath = `${fileId}-${uniqueId}`;

    // Debugging/Utility Function to Clear Room
    const clearRoom = () => {
        if (doc && fileId) {
            const confirmReset = window.confirm("This will clear the current file's content in the Live Room and reload. Continue?");
            if (!confirmReset) return;

            console.log("Clearing room data for", fileId);
            doc.transact(() => {
                doc.getText(fileId).delete(0, doc.getText(fileId).length);
                doc.getMap('initialization').delete(fileId);
            });
            window.location.reload();
        }
    };

    return (
        <div className="h-full w-full overflow-hidden relative group">
            {/* Reset Button - Visible on hover or when styling dictates */}
            <button
                onClick={clearRoom}
                className="absolute bottom-4 right-6 z-50 bg-gray-800/80 hover:bg-red-600 text-gray-300 hover:text-white px-3 py-1.5 text-xs rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 border border-white/10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                title="Reset Live Room content for this file"
            >
                Reset Content
            </button>
            <MonacoEditor
                height="100%" // Match the height in FileTreePanel or use 100%
                language={language}
                theme={theme}
                path={editorPath} // Use unique path to force fresh model
                onMount={handleEditorDidMount}
                options={{
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 }, // Add some padding
                }}
            />
        </div>
    );
}
