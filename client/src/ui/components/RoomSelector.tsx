type Props = {
    room: string;
    onRoomChange: (room: string) => void;
    onJoin: () => void;
    connectionId: string | null;
};

export default function RoomSelector({ room, onRoomChange, onJoin, connectionId }: Props) {
    return (
        <div>
            <h2>Room</h2>

            <input
                value={room}
                onChange={(e) => onRoomChange(e.target.value)}
                placeholder="room name"
            />

            <button
                onClick={onJoin}
                style={{ marginLeft: 10 }}
                disabled={!connectionId}
            >
                Join
            </button>
        </div>
    );
}
