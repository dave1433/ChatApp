import { useEffect, useState } from "react";
import { StateleSSEClient } from "statele-sse";

export function useSse<T>(
    room: string, 
    fetchInitial: (connectionId: string) => Promise<any>, 
    onData: (data: T) => void
) {
    const [connectionId, setConnectionId] = useState<string | null>(null);

    useEffect(() => {
        const client = new StateleSSEClient("/chat/sse");

        const unsub = client.listen<T>(
            async (id) => {
                setConnectionId(id);
                return await fetchInitial(id);
            },
            (data) => {
                onData(data);
            }
        );

        return () => unsub();
    }, [room]);

    return { connectionId };
}
