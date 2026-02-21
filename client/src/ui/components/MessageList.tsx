import type { ChatMessage } from "../../core/hooks/useChat.ts";

type Props = {
    messages: ChatMessage[];
    role?: string | null;
    onDelete: (id: number) => void;
    onUpdate: (id: number, content: string) => void;
};

export default function MessageList({ messages, role, onDelete, onUpdate }: Props) {
    return (
        <div className="card" >
            <div className="messages-container"
            >
                {messages.map((m) => (
                    <div className= "message" key={m.id} style={{ marginBottom: 10, borderBottom: "1px solid #eee" }}>
                        <small>{new Date(m.timestamp).toLocaleTimeString()}</small>{" "}
                        <b>{m.user?.username ?? "unknown"}:</b> {m.content}

                        {role === "Admin" && (
                            <div style={{ marginTop: 8 }}>
                                <button onClick={() => {
                                    const newContent = prompt("Edit message:", m.content);
                                    if (newContent) onUpdate(m.id, newContent);
                                }}>Edit</button>

                                <button
                                    className="danger"
                                    style={{ marginLeft: 8 }}
                                    onClick={() => onDelete(m.id)}
                                >Delete</button>
                            </div>
                        )}
                        
                    </div>
                ))}
            </div>
        </div>
    );
}
