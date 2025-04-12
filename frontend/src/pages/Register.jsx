import { useState } from "react";
import {useNavigate, Link, Navigate} from "react-router-dom";
import api from "../services/ApiService.js";
import useAuthStore from "../stores/Auth.js";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post("/auth/register", { name, email, password });
            login(data.user);
            navigate("/");
        } catch (err) {
            setError("Registration failed");
        }
    };

    const handleGithubRegister = () => {
        // TODO: Implement GitHub login
        console.log("GitHub register clicked");
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Register</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="w-full p-2 mb-4 border rounded"
                    required
                />
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
                    Register
                </button>
                <button
                    type="button"
                    onClick={handleGithubRegister}
                    className="w-full p-2 bg-gray-800 text-white rounded"
                >
                    Register with GitHub
                </button>
            </form>
            <p className="mt-4 text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    );
}

export default Register;