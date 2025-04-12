import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/Auth.js";
import api from "../services/ApiService.js";
import defaultAvatar from '../assets/default-avatar.jpg';

function Navbar() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();

    const getPictureUrl = (baseUrl) => {
        if (!baseUrl) return defaultAvatar;
        return `${baseUrl}?t=${new Date().getTime()}`;
    };

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            logout(); navigate("/login");
        } catch (err) {
            console.error("Logout error:", err); logout(); navigate("/login");
        }};

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition-colors"> CognoQuest </Link>
                <div className="flex items-center space-x-4">
                    <Link to="/profile" className="flex items-center space-x-2 p-1 rounded-full hover:bg-blue-700 transition-colors">
                        <img
                            src={getPictureUrl(user?.profilePicture)}
                            alt="Profile"
                            className="w-8 h-8 rounded-full border-2 border-blue-300 object-cover bg-gray-200"
                        />
                        <span className="font-medium hidden sm:inline"> {user?.name || "User"} </span>
                    </Link>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow"> Logout </button>
                </div>
            </div>
        </nav>
    );
}
export default Navbar;