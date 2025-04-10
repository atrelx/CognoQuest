import { useState, useEffect, useRef } from "react";
import api from "../services/ApiService.js";
import useAuthStore from "../stores/Auth.js";
import defaultAvatar from '../assets/default-avatar.jpg'; // Upewnij się, że ścieżka jest poprawna

function Profile() {
    const { user, setUser } = useAuthStore();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [profileError, setProfileError] = useState(null);
    const [profileSuccess, setProfileSuccess] = useState(null);

    const [name, setName] = useState("");
    const [profilePictureUrl, setProfilePictureUrl] = useState(""); // Stan dla URL zdjęcia

    const [email, setEmail] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setProfilePictureUrl(user.profilePicture || "");
        }
    }, [user]);


    const handleCancelEditProfile = () => {
        setName(user?.name || "");
        setProfilePictureUrl(user?.profilePicture || "");
        setIsEditingProfile(false);
        setProfileError(null);
        setProfileSuccess(null);
    };


    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsLoadingProfile(true);
        setProfileError(null);
        setProfileSuccess(null);
        try {
            const { data } = await api.put("/users/me/update", { name: name, profilePicture: profilePictureUrl });
            setUser(data); // has to be UserDto
            setIsEditingProfile(false);
            setProfileSuccess("Profile updated successfully!");
        } catch (err) {
            console.error("Profile update error:", err);
            setProfileError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }
        if (!currentPassword || !newPassword) {
            setPasswordError("Please fill in all password fields.");
            return;
        }
        setIsLoadingPassword(true);
        setPasswordError(null);
        setPasswordSuccess(null);
        try {
            await api.put("/users/me/update/change-password", { oldPassword: currentPassword, newPassword }); // PasswordChangeDto
            setPasswordSuccess("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Password change error:", err);
            setPasswordError(err.response?.data?.message || "Failed to change password.");
        } finally {
            setIsLoadingPassword(false);
        }
    };

    return (
        <div className="container mx-auto mt-10 p-4 max-w-2xl"> {/* Zmniejszyłem max-w */}
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Your Profile</h1>

            {/* Profile Avatar */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Profile Picture</h2>
                <img
                    src={profilePictureUrl || user?.profilePicture || defaultAvatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover mb-4 shadow-lg"
                />
                {/* TODO: Add image upload */}
            </div>

            {/* Profile Data (name-email) */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Account Details</h2>
                    {!isEditingProfile && (
                        <button
                            onClick={() => setIsEditingProfile(true)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {profileSuccess && <p className="text-green-600 text-sm mb-3 text-center">{profileSuccess}</p>}
                {profileError && <p className="text-red-500 text-sm mb-3 text-center">{profileError}</p>}

                <form onSubmit={handleSaveProfile}>
                    {/* Name */}
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            className={`w-full p-2 border rounded shadow-sm ${!isEditingProfile ? 'bg-gray-100 text-gray-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                            required
                            disabled={!isEditingProfile || isLoadingProfile}
                        />
                    </div>
                    {/* Email */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email (cannot be changed)</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            placeholder="Your Email"
                            className="w-full p-2 border border-gray-200 rounded shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                            disabled={true}
                        />
                    </div>
                    {/* Avatar URL */}
                    <div className="mb-4">
                        <label htmlFor="profilePictureUrl" className="block text-sm font-medium text-gray-600 mb-1">Profile Picture URL</label>
                        <input
                            id="profilePictureUrl"
                            type="text"
                            value={profilePictureUrl}
                            onChange={(e) => setProfilePictureUrl(e.target.value)}
                            placeholder="Enter URL for your profile picture"
                            className={`w-full p-2 border rounded shadow-sm ${!isEditingProfile ? 'bg-gray-100 text-gray-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                            disabled={!isEditingProfile || isLoadingProfile}
                        />
                    </div>


                    {/* Save/Cancel Buttons*/}
                    {isEditingProfile && (
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                type="button"
                                onClick={handleCancelEditProfile}
                                className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200"
                                disabled={isLoadingProfile}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                                disabled={isLoadingProfile}
                            >
                                {isLoadingProfile ? "Saving..." : "Save Profile"}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Change Password */}
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Change Password</h2>

                {passwordSuccess && <p className="text-green-600 text-sm mb-3 text-center">{passwordSuccess}</p>}
                {passwordError && <p className="text-red-500 text-sm mb-3 text-center">{passwordError}</p>}

                <form onSubmit={handleChangePassword}>
                    <div className="mb-4">
                        <label htmlFor="currentPassword"className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                        <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter your current password" className="w-full p-2 border border-gray-300 rounded shadow-sm" required disabled={isLoadingPassword}/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="newPassword"className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                        <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full p-2 border border-gray-300 rounded shadow-sm" required disabled={isLoadingPassword}/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-600 mb-1">Confirm New Password</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full p-2 border border-gray-300 rounded shadow-sm" required disabled={isLoadingPassword}/>
                    </div>
                    <button type="submit" className="w-full p-2 mt-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 disabled:opacity-50" disabled={isLoadingPassword}>
                        {isLoadingPassword ? "Changing..." : "Change Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Profile;