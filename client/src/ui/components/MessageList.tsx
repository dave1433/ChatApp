import type { ChatMessage } from "../../core/hooks/useChat.ts";

type Props = {
    messages: ChatMessage[];
    onDelete: (id: number) => void;
    onUpdate: (id: number, content: string) => void;
};

export default function MessageList({ messages, onDelete, onUpdate }: Props) {
    return (
        <div>
            <div
                style={{
                    border: "1px solid gray",
                    padding: 10,
                    height: 300,
                    overflowY: "scroll",
                }}
            >
                {messages.map((m) => (
                    <div key={m.id} style={{ marginBottom: 10, borderBottom: "1px solid #eee" }}>
                        <small>{new Date(m.timestamp).toLocaleTimeString()}</small>{" "}
                        <b>{m.user?.username ?? "unknown"}:</b> {m.content}
                        
                        <div style={{ marginTop: 5 }}>
                            <button onClick={() => {
                                const newContent = prompt("Edit message:", m.content);
                                if (newContent) onUpdate(m.id, newContent);
                            }}>Edit</button>
                            
                            <button 
                                onClick={() => onDelete(m.id)}
                                style={{ color: "red", marginLeft: 10 }}
                            >Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
