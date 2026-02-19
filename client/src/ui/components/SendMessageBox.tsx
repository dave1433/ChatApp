import { useState } from "react";

type Props = {
    onSend: (message: string) => Promise<void>;
    disabled?: boolean;
};

export default function SendMessageBox({ onSend, disabled }: Props) {
    const [message, setMessage] = useState("");

    async function handleSend() {
        if (!message.trim()) return;

        await onSend(message);
        setMessage("");
    }

    return (
        <div>
            <h2>Send message</h2>

            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type message..."
                style={{ width: "60%" }}
                disabled={disabled}
            />

            <button onClick={handleSend} style={{ marginLeft: 10 }} disabled={disabled}>
                Send
            </button>
        </div>
    );
}
