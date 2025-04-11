import { useState, useEffect } from "react";
import api from "../services/ApiService.js";
import useAuthStore from "../stores/Auth.js";
import defaultAvatar from '../assets/default-avatar.jpg';
import Modal from '../components/Modal.jsx';

function Profile() {
    const { user, setUser } = useAuthStore();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [profileError, setProfileError] = useState(null);
    const [profileSuccess, setProfileSuccess] = useState(null);

    const [name, setName] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
        }
    }, [user]);

    const handleEditClick = () => {
        setName(user?.name || "");
        setIsEditingProfile(true);
        setProfileError(null);
        setProfileSuccess(null);
    };

    const handleCancelEditProfile = () => {
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
            const payload = { name: name };
            const { data } = await api.put("/users/me/update", payload);
            setUser(data);
            setIsEditingProfile(false);
            setProfileSuccess("Name updated successfully!");
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
            setPasswordError("New passwords do not match."); return;
        }
        if (!currentPassword || !newPassword) {
            setPasswordError("Please fill in all password fields."); return;
        }
        setIsLoadingPassword(true); setPasswordError(null); setPasswordSuccess(null);
        try {
            await api.put("/users/me/update/change-password", { oldPassword: currentPassword, newPassword });
            setPasswordSuccess("Password changed successfully! You can now close this window.");
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        } catch (err) {
            console.error("Password change error:", err);
            setPasswordError(err.response?.data?.message || "Failed to change password.");
        } finally {
            setIsLoadingPassword(false);
        }
    };

    const closePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setPasswordError(null);
        setPasswordSuccess(null);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const pageTitle = user ? `Hi, ${user.name || 'User'}` : 'Profile';

    return (
        <div className="container mx-auto mt-10 p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">{pageTitle}</h1>

            <div className="p-6 bg-white rounded-lg shadow-md mb-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">

                    {/* Avatar */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <img
                            src={user?.profilePicture || defaultAvatar}
                            alt="Profile"
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-200 object-cover shadow-lg"
                        />
                    </div>

                    {/* Account details */}
                    <div className="flex-grow w-full">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-semibold text-gray-700">Account Details</h2>
                            {!isEditingProfile && (
                                <button onClick={handleEditClick} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition">
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {profileSuccess && !isEditingProfile && <p className="text-green-600 text-sm mb-3">{profileSuccess}</p>}
                        {profileError && isEditingProfile && <p className="text-red-500 text-sm mb-3">{profileError}</p>}

                        <form onSubmit={handleSaveProfile}>
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                                    {isEditingProfile ? (
                                        <input
                                            id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required disabled={isLoadingProfile}
                                        />
                                    ) : (
                                        <p className="p-2 text-gray-800 text-lg">{user?.name || '-'}</p>
                                        )}
                                </div>
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                    <p className="p-2 text-gray-500">{user?.email || '-'}</p>
                                </div>
                            </div>

                            {/* Save/Cancel buttons in edit mode */}
                            {isEditingProfile && (
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button type="button" onClick={handleCancelEditProfile} className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600" disabled={isLoadingProfile}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50" disabled={isLoadingProfile}>
                                        {isLoadingProfile ? "Saving..." : "Save Name"}
                                    </button>
                                </div>
                            )}
                        </form>

                        {/* Edit password button */}
                        {!isEditingProfile && (
                            <div className="mt-6 border-t pt-4">
                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition duration-200"
                                >
                                    Change Password
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isPasswordModalOpen} onClose={closePasswordModal} title="Change Your Password">
                {passwordSuccess && <p className="text-green-600 text-sm mb-3 text-center">{passwordSuccess}</p>}
                {passwordError && <p className="text-red-500 text-sm mb-3 text-center">{passwordError}</p>}
                {!passwordSuccess && (
                    <form onSubmit={handleChangePassword}>
                        <div className="mb-4">
                            <label htmlFor="modalCurrentPassword"className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                            <input id="modalCurrentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="w-full p-2 border border-gray-300 rounded shadow-sm" required disabled={isLoadingPassword}/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="modalNewPassword"className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                            <input id="modalNewPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full p-2 border border-gray-300 rounded shadow-sm" required disabled={isLoadingPassword}/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="modalConfirmPassword"className="block text-sm font-medium text-gray-600 mb-1">Confirm New Password</label>
                            <input id="modalConfirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full p-2 border border-gray-300 rounded shadow-sm" required disabled={isLoadingPassword}/>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="w-full sm:w-auto px-4 py-2 mt-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 disabled:opacity-50" disabled={isLoadingPassword}>
                                {isLoadingPassword ? "Changing..." : "Confirm Change Password"}
                            </button>
                        </div>
                    </form>
                )}
                {passwordSuccess && ( <div className="text-right mt-4"> <button onClick={closePasswordModal} className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">Close</button> </div> )}
            </Modal>

        </div>
    );
}

export default Profile;