export async function updateMessageRequest(id: number, content: string, token: string) {
    const res = await fetch(`/chat/update/${id}?newContent=${encodeURIComponent(content)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Update failed");
}

export async function deleteMessageRequest(id: number, token: string) {
    const res = await fetch(`/chat/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Delete failed");
}

export async function fetchMessagesRealtime(connectionId: string, roomId: string) {
    const res = await fetch(`/chat/messages-realtime?connectionId=${connectionId}&roomId=${roomId}`);

    if (!res.ok) {
        throw new Error("Failed to subscribe to realtime messages");
    }

    return res.json();
}

export async function fetchHistory(roomId: string) {
    const res = await fetch(`/chat/history?roomId=${roomId}`);

    if (!res.ok) {
        throw new Error("Failed to load history");
    }

    return res.json();
}

export async function joinRoomRequest(connectionId: string, roomId: string) {
    const res = await fetch(`/chat/join?connectionId=${connectionId}&roomId=${roomId}`, {
        method: "POST",
    });

    if (!res.ok) {
        throw new Error("Failed to join room");
    }
}

export async function sendMessageRequest(roomId: string, message: string, token: string) {
    const res = await fetch(
        `/chat/send?roomId=${roomId}&message=${encodeURIComponent(message)}`,
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
