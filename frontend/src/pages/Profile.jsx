import { useState, useEffect } from "react";
import api from "../services/ApiService.js";
import useAuthStore from "../stores/Auth.js";

function Profile() {
    const { user, setUser } = useAuthStore();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put("/users/profile", { name, email });
            setUser(data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="w-full p-2 mb-4 border rounded"
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-2 mb-4 border rounded"
                />
                <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
                    Update Profile
                </button>
            </form>
        </div>
    );
}

export default Profile;