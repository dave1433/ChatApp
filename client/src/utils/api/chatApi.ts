export async function fetchHistory(room: string) {
    const res = await fetch(`/chat/history?room=${room}`);

    if (!res.ok) {
        throw new Error("Failed to load history");
    }

    return res.json();
}

export async function joinRoomRequest(connectionId: string, room: string) {
    const res = await fetch(`/chat/join?connectionId=${connectionId}&room=${room}`, {
        method: "POST",
    });

    if (!res.ok) {
        throw new Error("Failed to join room");
    }
}

export async function sendMessageRequest(room: string, message: string, token: string) {
    const res = await fetch(
        `/chat/send?room=${room}&message=${encodeURIComponent(message)}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!res.ok) {
        throw new Error("Send failed");
    }

    return res.json();
}
