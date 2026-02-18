import { useEffect, useState } from "react";

export function useSse(room: string, onMessage: (data: any) => void) {
    const [connectionId, setConnectionId] = useState<string | null>(null);

    useEffect(() => {
        const evtSource = new EventSource("/chat/Connect");

        evtSource.addEventListener("connected", (e: MessageEvent) => {
            const data = JSON.parse(e.data);
            setConnectionId(data.connectionId);
        });

        evtSource.addEventListener("message", (e: MessageEvent) => {
            try {
                onMessage(JSON.parse(e.data));
            } catch {
                onMessage({ message: e.data });
            }
        });

        return () => evtSource.close();
    }, [room]);

    return { connectionId };
}
