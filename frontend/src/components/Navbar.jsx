import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/Auth.js";
import api from "../services/ApiService.js";
import defaultAvatar from '../assets/default-avatar.jpg';
import { useTheme } from "../providers/ThemeProvider.jsx";
import { FaSun, FaMoon, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import {useMemo, useState} from "react";

function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const profilePictureUrl = useMemo(() => {
        const baseUrl = user?.profilePicture;
        console.log("Base URL:", baseUrl);
        return baseUrl || defaultAvatar;
    }, [user?.profilePicture]);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            logout();
            navigate("/login");
        } catch (err) {
            console.error("Logout error:", err);
            logout();
            navigate("/login");
        }};

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };

    return (
        <nav className="bg-surface dark:bg-surface-dark bg-opacity-95 p-1 shadow-xl sticky top-0 z-50 font-heebo ">
            <div className="mx-auto w-full flex justify-between items-center">
                <div className="flex items-center space-x-10">
                    <Link to="/" className="flex items-center space-x-2 ml-5">
                        <img
                            src="/src/assets/logo.png"
                            alt="CognoQuest Logo"
                            className="w-14 h-14"
                        />
                        <span
                            className="text-2xl font-bold text-text dark:text-text-dark hover:text-text-secondary dark:hover:text-text-secondary-dark transition-colors font-heebo"
                            style={{ fontWeight: 'var(--font-weight-header)' }}
                        >
                            CognoQuest
                        </span>
                    </Link>
                </div>
                <div className="flex items-center space-x-2 mr-10">
                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-secondary dark:hover:bg-secondary-dark transition-colors cursor-pointer min-w-fit"
                            aria-expanded={isDropdownOpen}
                            aria-label="User menu"
                        >
                            <img
                                src={profilePictureUrl}
                                alt="Profile"
                                className="w-9 h-9 rounded-full border-2 border-border dark:border-border-dark object-cover"
                                onError={(e) => {
                                    console.log("Image load failed, falling back to defaultAvatar");
                                    e.target.src = defaultAvatar;
                                }}
                            />
                            <span className="text-text dark:text-text-dark font-heebo hidden sm:inline"
                                  style={{fontWeight: 'var(--font-weight-text)'}}>
                                {user?.name || "User"}
                            </span>
                            {isDropdownOpen ? (
                                <FaChevronUp className="text-text dark:text-text-dark" size={14}/>
                            ) : (
                                <FaChevronDown className="text-text dark:text-text-dark" size={14}/>
                            )}
                        </button>
                        {isDropdownOpen && (
                            <div
                                className="absolute right-0 w-full bg-surface dark:bg-surface-dark rounded-xl shadow-xl border border-border dark:border-border-dark animate-dropdown-slide z-50">
                                <Link
                                    to="/profile"
                                    className="block px-3 py-1.5 text-text dark:text-text-dark hover:bg-secondary dark:hover:bg-secondary-dark hover:text-on-primary dark:hover:text-on-primary-dark rounded-t-xl transition-colors font-heebo"
                                    style={{fontWeight: 'var(--font-weight-text)'}}
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Profile
                                </Link>
                                <Link
                                    to="/my-surveys"
                                    className="block px-3 py-1.5 text-text dark:text-text-dark hover:bg-secondary dark:hover:bg-secondary-dark hover:text-on-primary dark:hover:text-on-primary-dark transition-colors font-heebo"
                                    style={{fontWeight: 'var(--font-weight-text)'}}
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    My Surveys
                                </Link>
                                <hr className="border-border dark:border-border-dark mx-2"/>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-1.5 text-error dark:text-error-dark hover:bg-secondary dark:hover:bg-secondary-dark hover:text-on-primary dark:hover:text-on-primary-dark rounded-b-xl transition-colors cursor-pointer font-heebo"
                                    style={{fontWeight: 'var(--font-weight-text)'}}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full  text-text dark:text-text-dark hover:bg-secondary dark:hover:bg-secondary-dark transition-colors cursor-pointer"
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? <FaMoon size={20}/> : <FaSun size={20}/>}
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;