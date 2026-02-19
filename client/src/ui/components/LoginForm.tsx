import { useState } from "react";

type Props = {
    onLogin: (username: string, password: string) => Promise<void>;
    isLoggedIn: boolean;
    role?: string | null;
    onLogout: () => void;
};

export default function LoginForm({ onLogin, isLoggedIn, role, onLogout }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin() {
        await onLogin(username, password);
        setPassword("");
    }

    return (
        <div>
            <h2>Login</h2>

            {!isLoggedIn && (
                <>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                    />

                    <input
                        value={password}
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                        style={{ marginLeft: 10 }}
                    />

                    <button onClick={handleLogin} style={{ marginLeft: 10 }}>
                        Login
                    </button>
                </>
            )}

            {isLoggedIn && (
                <>
                    <p>
                        <b>Status:</b> Logged in ({role}) ✅
                    </p>

                    <button onClick={onLogout}>Logout</button>
                </>
            )}

            {!isLoggedIn && (
                <p>
                    <b>Status:</b> Not logged in ❌
                </p>
            )}
        </div>
    );
}
