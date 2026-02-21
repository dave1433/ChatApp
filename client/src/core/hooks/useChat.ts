import { useEffect, useState } from "react";
import { fetchHistory } from "../../utils/api/chatApi";

export type ChatMessage = {
    id: number;
    roomId: string;
    content: string;
    timestamp: string;
    userId: number;
    user?: {
        id: number;
        username: string;
    }
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

    return { messages, setMessages };
}
