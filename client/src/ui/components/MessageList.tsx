import type { ChatMessage } from "../../core/hooks/useChat.ts";

type Props = {
    messages: ChatMessage[];
};

export default function MessageList({ messages }: Props) {
    return (
        <div>
            <h2>Messages</h2>

            <div
                style={{
                    border: "1px solid gray",
                    padding: 10,
                    height: 300,
                    overflowY: "scroll",
                }}
            >
                {messages.map((m) => (
                    <div key={m.id}>
                        <small>{new Date(m.timestamp).toLocaleTimeString()}</small>{" "}
                        <b>{m.username}:</b> {m.content}
                    </div>
                ))}
            </div>
        </div>
    );
}
