import java.util.*;

public class CollabAILLD {

    // ==========================================
    // 1. MODELS (Entities representing MongoDB Collections)
    // ==========================================

    static class User {
        String id;
        String name;
        String email;

        public User(String id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }
        
        @Override
        public String toString() { return name; }
    }

    // Represents the hierarchical JSON structure of WebContainers
    static class FileNode {
        String name;
        boolean isDirectory;
        String content;
        Map<String, FileNode> children;

        public FileNode(String name, boolean isDirectory) {
            this.name = name;
            this.isDirectory = isDirectory;
            if (isDirectory) {
                children = new HashMap<>();
            }
        }
    }

    static class Message {
        String id;
        User sender;
        String content;
        Date timestamp;

        public Message(User sender, String content) {
            this.id = UUID.randomUUID().toString();
            this.sender = sender;
            this.content = content;
            this.timestamp = new Date();
        }
    }

    // AI Messages contain the generated file tree payload
    static class AIMessage extends Message {
        FileNode generatedFileTree;

        public AIMessage(User sender, String content, FileNode generatedFileTree) {
            super(sender, content);
            this.generatedFileTree = generatedFileTree;
        }
    }

    // Represents the Chat/Project collection
    static class Project {
        String id;
        String name;
        List<User> members;
        List<Message> messages;
        FileNode rootFileTree; // The current synced state of the code

        public Project(String id, String name, User creator) {
            this.id = id;
            this.name = name;
            this.members = new ArrayList<>();
            this.members.add(creator);
            this.messages = new ArrayList<>();
            this.rootFileTree = new FileNode("root", true);
        }

        public void addMember(User user) {
            if (!members.contains(user)) {
                members.add(user);
            }
        }
        
        public void addMessage(Message msg) {
            messages.add(msg);
        }
    }

    // Represents the Notification collection
    static class Notification {
        String id;
        User user;
        String message;
        boolean isRead;

        public Notification(User user, String message) {
            this.id = UUID.randomUUID().toString();
            this.user = user;
            this.message = message;
            this.isRead = false;
        }
    }

    // ==========================================
    // 2. SERVICES (Business Logic / Controllers)
    // ==========================================

    static class AIService {
        // Simulates the Gemini API call with JSON validation layer
        public AIMessage generateResponse(User aiUser, String prompt) {
            System.out.println("🤖 AI Service: Processing prompt -> '" + prompt + "'");
            
            // Simulating self-correcting JSON logic and generating a FileTree
            FileNode newTree = new FileNode("root", true);
            FileNode indexHtml = new FileNode("index.html", false);
            indexHtml.content = "<!DOCTYPE html>\\n<html>\\n  <body>Generated React App</body>\\n</html>";
            
            FileNode packageJson = new FileNode("package.json", false);
            packageJson.content = "{ \"name\": \"react-app\", \"dependencies\": { \"react\": \"^18.2.0\" } }";
            
            newTree.children.put("index.html", indexHtml);
            newTree.children.put("package.json", packageJson);
            
            return new AIMessage(aiUser, "I have generated the React application structure.", newTree);
        }
    }

    static class NotificationService {
        // Simulates MongoDB persistence for offline users
        Map<String, List<Notification>> userNotifications = new HashMap<>();

        public void notifyUser(User user, String message) {
            userNotifications.putIfAbsent(user.id, new ArrayList<>());
            Notification notif = new Notification(user, message);
            userNotifications.get(user.id).add(notif);
            
            // The Dual-Delivery System: Persist to DB + Send real-time if online
            System.out.println("🔔 [DB Persisted Notification for " + user.name + "]: " + message);
        }
    }

    static class ChatAndCollaborationService {
        AIService aiService;
        NotificationService notificationService;
        User systemAIUser;

        public ChatAndCollaborationService(AIService aiService, NotificationService notificationService) {
            this.aiService = aiService;
            this.notificationService = notificationService;
            this.systemAIUser = new User("AI_001", "Gemini AI", "ai@system.local");
        }

        // Handles standard messaging and AI interactions
        public void sendMessage(Project project, User sender, String content) {
            System.out.println("\\n💬 [" + project.name + "] " + sender.name + " says: " + content);
            Message msg = new Message(sender, content);
            project.addMessage(msg);

            // Simulating Pusher real-time broadcast to all connected clients
            for (User member : project.members) {
                if (!member.id.equals(sender.id)) {
                    System.out.println("   ⚡ (Pusher Event: incoming-message) -> Delivered to: " + member.name);
                }
            }

            // Intercept @ai tags
            if (content.contains("@ai")) {
                String prompt = content.replace("@ai", "").trim();
                AIMessage aiResponse = aiService.generateResponse(systemAIUser, prompt);
                
                project.addMessage(aiResponse);
                System.out.println("💬 [" + project.name + "] " + systemAIUser.name + " replies: " + aiResponse.content);
                
                // Update project file tree with the AI's generated one
                project.rootFileTree = aiResponse.generatedFileTree;
                
                // Broadcast updated file tree event
                System.out.println("   ⚡ (Pusher Event: updatedfiletree) -> FileTree updated for all connected clients.");
            }
        }
        
        // Handles invitations and dual-delivery notifications
        public void inviteUserToProject(Project project, User inviter, User invitee) {
            System.out.println("\\n📧 " + inviter.name + " invited " + invitee.name + " to project " + project.name);
            
            // Real-time UI notification (if online) + DB persistence (if offline)
            System.out.println("   ⚡ (Pusher Event: new-invitation) -> Sent to " + invitee.name);
            notificationService.notifyUser(invitee, "You have been invited to join " + project.name + " by " + inviter.name);
            
            // Simulating immediate acceptance
            System.out.println("✅ " + invitee.name + " accepted the invitation.");
            project.addMember(invitee);
            
            // Notify existing members
            for(User member : project.members) {
                if(!member.id.equals(invitee.id)) {
                     notificationService.notifyUser(member, invitee.name + " joined the project.");
                }
            }
        }
    }

    // ==========================================
    // 3. MAIN (Simulation Execution)
    // ==========================================
    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("🚀 COLLAB-AI: LOW LEVEL DESIGN (LLD) SIMULATION 🚀");
        System.out.println("==================================================\\n");

        // 1. Boot up services
        AIService aiService = new AIService();
        NotificationService notificationService = new NotificationService();
        ChatAndCollaborationService collabService = new ChatAndCollaborationService(aiService, notificationService);

        // 2. Create Users
        User satyam = new User("u1", "Satyam", "satyam@example.com");
        User interviewer = new User("u2", "Interviewer", "interviewer@company.com");

        // 3. Initialize a Workspace/Project
        Project project = new Project("p1", "Interview Demo App", satyam);
        System.out.println("📁 Workspace Created: '" + project.name + "' by " + satyam.name);

        // 4. Test Invitation Flow
        collabService.inviteUserToProject(project, satyam, interviewer);

        // 5. Test Collaboration & Messaging
        collabService.sendMessage(project, interviewer, "Hi Satyam, can we build a React app here?");
        collabService.sendMessage(project, satyam, "Absolutely! Let's ask the AI to bootstrap it.");
        
        // 6. Test AI Integration Flow
        collabService.sendMessage(project, satyam, "@ai create a basic React boilerplate");

        // 7. Verify the final state (MongoDB FileTree schema representation)
        System.out.println("\\n==================================================");
        System.out.println("📂 FINAL WORKSPACE FILE TREE STATE");
        System.out.println("==================================================");
        if (project.rootFileTree.children != null) {
            for (String fileName : project.rootFileTree.children.keySet()) {
                FileNode file = project.rootFileTree.children.get(fileName);
                System.out.println("📄 " + fileName);
                System.out.println("   └─ content size: " + file.content.length() + " bytes");
            }
        }
        
        System.out.println("\\n✅ Simulation complete. LLD is functional.");
    }
}
