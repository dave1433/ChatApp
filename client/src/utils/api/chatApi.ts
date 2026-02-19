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

export async function fetchMessagesRealtime(connectionId: string, room: string) {
    const res = await fetch(`/chat/messages-realtime?connectionId=${connectionId}&room=${room}`);

    if (!res.ok) {
        throw new Error("Failed to subscribe to realtime messages");
    }

    return res.json();
}

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
