import { useEffect, useState } from "react";
import { fetchHistory } from "../../utils/api/chatApi";

export type ChatMessage = {
    id: number;
    room: string;
    username: string;
    content: string;
    timestamp: string;
};

export function useChat(room: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        async function load() {
            const history = await fetchHistory(room);
            setMessages(history);
        }

        load();
    }, [room]);

    function addMessage(content: string, username = "unknown") {
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                room,
                username,
                content,
                timestamp: new Date().toISOString(),
            },
        ]);
    }

    return { messages, setMessages, addMessage };
}
