import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/Auth.js";
import api from "../services/ApiService.js";

function Navbar() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            logout();
            navigate("/login");
        } catch (err) {
            console.error("Logout error:", err);
            logout();
            navigate("/login");
        }
    };

    return (
        <nav className="bg-blue-600 p-4 text-white shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold">
                    CognoQuest
                </Link>
                <div className="flex items-center space-x-4">
                    <Link to="/profile" className="hover:underline">
                        {user?.name || "Profile"}
                    </Link>
                    <button onClick={handleLogout} className="hover:underline">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;