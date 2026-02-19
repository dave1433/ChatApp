import { useState } from "react";
import { useAuth } from "../../core/hooks/useAuth";
import type { ChatMessage } from "../../core/hooks/useChat";
import { useSse } from "../../core/hooks/useSse";
import { 
    fetchMessagesRealtime, 
    joinRoomRequest, 
    sendMessageRequest,
    updateMessageRequest,
    deleteMessageRequest
} from "../../utils/api/chatApi";

import LoginForm from "../components/LoginForm";
import RoomSelector from "../components/RoomSelector";
import MessageList from "../components/MessageList";
import SendMessageBox from "../components/SendMessageBox";

export default function ChatPage() {
    const [room, setRoom] = useState("general");
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const { token, role, login, logout } = useAuth();

    // Main Live Query for room messages (Task 2, 3, 5)
    const { connectionId } = useSse<ChatMessage[]>(
        room, 
        (id) => fetchMessagesRealtime(id, room),
        (data) => setMessages(data)
    );

    // Task 4: Realtime @everyone notification
    useSse<string>(
        "global",
        async (id) => {
            const res = await fetch(`/chat/everyone-notifications?connectionId=${id}`);
            return await res.json();
        },
        (alertMsg) => {
            alert(alertMsg);
        }
    );

    async function handleUpdate(id: number, content: string) {
        if (!token) return;
        try {
            await updateMessageRequest(id, content, token);
        } catch { alert("Update failed - maybe you don't own this message?"); }
    }

    async function handleDelete(id: number) {
        if (!token) return;
        try {
            await deleteMessageRequest(id, token);
        } catch { alert("Delete failed - maybe you don't own this message?"); }
    }

    async function joinRoom() {
        if (!connectionId) return alert("Not connected yet");

        try {
            await joinRoomRequest(connectionId, room);
            alert(`Joined room: ${room}`);
        } catch {
            alert("Failed to join room");
        }
    }

    async function handleLogin(username: string, password: string) {
        try {
            await login(username, password);
            alert("Logged in!");
        } catch {
            alert("Login failed");
        }
    }

    async function handleSend(message: string) {
        if (!token) {
            alert("You must login to send messages");
            return;
        }

        try {
            await sendMessageRequest(room, message, token);
        } catch {
            alert("Send failed");
        }
    }

    return (
        <div style={{ padding: 20, fontFamily: "Arial" }}>
            <h1>🔥 SSE Chat App</h1>

            <RoomSelector
                room={room}
                onRoomChange={setRoom}
                onJoin={joinRoom}
                connectionId={connectionId}
            />

            <hr />

            <LoginForm
                onLogin={handleLogin}
                isLoggedIn={!!token}
                role={role}
                onLogout={logout}
            />

            <hr />

            <MessageList 
                messages={messages} 
                onDelete={handleDelete}
                onUpdate={handleUpdate}
            />

            <hr />

            <SendMessageBox onSend={handleSend} disabled={!token} />
        </div>
    );
}
