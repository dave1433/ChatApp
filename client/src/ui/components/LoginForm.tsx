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
        <div className="card"  data-testid="login-form">
            <h2>Login</h2>

            {!isLoggedIn && (
                <div className="login-inputs">
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
                    />

                    <button onClick={handleLogin} >
                        Login
                    </button>
                </div>
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
