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

    const { token, isLoggedIn, role, login, logout } = useAuth();

    const { connectionId } = useSse<ChatMessage[]>(
        room,
        (id) => fetchMessagesRealtime(id, room),
        (data) => setMessages(data)
    );

    useSse<string>(
        "global",
        async (id) => {
            const res = await fetch(`/chat/everyone-notifications?connectionId=${id}`);
            return await res.json();
        },
        (alertMsg) => alert(alertMsg)
    );

    async function handleUpdate(id: number, content: string) {
        if (!token) return;
        try {
            await updateMessageRequest(id, content, token);
        } catch {
            alert("Update failed - maybe you don't own this message?");
        }
    }

    async function handleDelete(id: number) {
        if (!token) return;
        try {
            await deleteMessageRequest(id, token);
        } catch {
            alert("Delete failed - maybe you don't own this message?");
        }
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
        <div>
            <h1>🔥 SSE Chat App</h1>

            <div className="app-layout">

                <div className="sidebar">
                    <RoomSelector
                        room={room}
                        onRoomChange={setRoom}
                        onJoin={joinRoom}
                        connectionId={connectionId}
                    />

                    <LoginForm
                        onLogin={handleLogin}
                        isLoggedIn={!!token}
                        role={role}
                        onLogout={logout}
                    />
                </div>

                <div className="main-content">
                    <MessageList
                        messages={messages}
                        role={role}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                    />

                    <SendMessageBox
                        onSend={handleSend}
                        disabled={!token}
                    />
                </div>

            </div>
        </div>
    );
}
