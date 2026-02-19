import { useState } from "react";
import { useAuth } from "../../core/hooks/useAuth";
import { useChat } from "../../core/hooks/useChat";
import { useSse } from "../../core/hooks/useSse";
import { joinRoomRequest, sendMessageRequest } from "../../utils/api/chatApi";

import LoginForm from "../components/LoginForm";
import RoomSelector from "../components/RoomSelector";
import MessageList from "../components/MessageList";
import SendMessageBox from "../components/SendMessageBox";

export default function ChatPage() {
    const [room, setRoom] = useState("general");

    const { token, role, login, logout } = useAuth();
    const { messages, addMessage } = useChat(room);

    const { connectionId } = useSse(room, (data) => {
        addMessage(data.message ?? JSON.stringify(data));
    });

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

            <MessageList messages={messages} />

            <hr />

            <SendMessageBox onSend={handleSend} disabled={!token} />
        </div>
    );
}
