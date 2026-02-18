import { useState } from "react";
import { useAuth } from "../../core/hooks/useAuth";
import { useChat } from "../../core/hooks/useChat";
import { useSse } from "../../core/hooks/useSse";
import { joinRoomRequest, sendMessageRequest } from "../../utils/api/chatApi";

export default function ChatPage() {
    const [room, setRoom] = useState("general");
    const [messageInput, setMessageInput] = useState("");
    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");

    const { token, role, login, logout } = useAuth();
    const { messages, addMessage } = useChat(room);

    const { connectionId } = useSse(room, (data) => {
        addMessage(data.message ?? JSON.stringify(data));
    });

    async function joinRoom() {
        if (!connectionId) return alert("Not connected yet");
        await joinRoomRequest(connectionId, room);
        alert(`Joined room: ${room}`);
    }

    async function sendMessage() {
        if (!token) return alert("Login required");
        if (!messageInput.trim()) return;

        await sendMessageRequest(room, messageInput, token);
        setMessageInput("");
    }

    async function handleLogin() {
        try {
            await login(usernameInput, passwordInput);
            alert("Logged in!");
        } catch {
            alert("Login failed");
        }
    }

    return (
        <div style={{ padding: 20, fontFamily: "Arial" }}>
            <h1>🔥 SSE Chat App</h1>

            <p>
                <b>Connection ID:</b> {connectionId ?? "Connecting..."}
            </p>

            <hr />

            <h2>Room</h2>
            <input value={room} onChange={(e) => setRoom(e.target.value)} />
            <button onClick={joinRoom} style={{ marginLeft: 10 }}>
                Join
            </button>

            <hr />

            <h2>Login</h2>
            <input
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="username"
            />
            <input
                value={passwordInput}
                type="password"
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="password"
                style={{ marginLeft: 10 }}
            />

            <button onClick={handleLogin} style={{ marginLeft: 10 }}>
                Login
            </button>

            {token && (
                <button onClick={logout} style={{ marginLeft: 10 }}>
                    Logout
                </button>
            )}

            <p>
                <b>Status:</b> {token ? `Logged in (${role}) ✅` : "Not logged in ❌"}
            </p>

            <hr />

            <h2>Messages</h2>
            <div style={{ border: "1px solid gray", padding: 10, height: 300, overflowY: "scroll" }}>
                {messages.map((m) => (
                    <div key={m.id}>
                        <small>{new Date(m.timestamp).toLocaleTimeString()}</small>{" "}
                        <b>{m.username}:</b> {m.content}
                    </div>
                ))}
            </div>

            <hr />

            <h2>Send message</h2>
            <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type message..."
                style={{ width: "60%" }}
            />
            <button onClick={sendMessage} style={{ marginLeft: 10 }}>
                Send
            </button>
        </div>
    );
}
