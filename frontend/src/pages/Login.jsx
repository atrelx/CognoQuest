import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import api from "../services/ApiService.js";
import useAuthStore from "../stores/Auth.js";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login: loginUserInStore } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data) {
                loginUserInStore(response.data); // UserDto
                console.log("User data set in store after login:", response.data);
            } else {
                console.warn("Login API did not return user data.");
            }

            navigate("/");
        } catch (err) {
            console.error("Login error:", err.response?.data || err.message);
            setError("Something went wrong: " + err.response?.data?.message);
            console.log("Error set, staying on page");
        }
    };

    const handleGithubLogin = () => {
        console.log("GitHub login clicked");
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-2 mb-4 border rounded"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-2 mb-4 border rounded"
                    required
                />
                <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded mb-4">
                    Login
                </button>
                <button
                    type="button"
                    onClick={handleGithubLogin}
                    className="w-full p-2 bg-gray-800 text-white rounded"
                >
                    Login with GitHub
                </button>
            </form>
            <p className="mt-4 text-center">
                No account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                    Create one
                </Link>
            </p>
        </div>
    );
}

export default Login;