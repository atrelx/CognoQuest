import {useState, useEffect, useRef, useMemo} from "react";
import api from "../services/ApiService.js";
import useAuthStore from "../stores/Auth.js";
import useToastStore from "../stores/useToastStore.js";
import { toast } from "react-toastify";
import defaultAvatar from '../assets/default-avatar.jpg';
import Modal from '../components/Modal.jsx';
import { FaPencilAlt } from 'react-icons/fa';
import LoadingSpinner from "../components/LoadingSpinner.jsx";

function Profile() {
    const { user, setUser } = useAuthStore();
    const { showToast } = useToastStore();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [profileError, setProfileError] = useState(null);
    const [pictureError, setPictureError] = useState(null);
    const [name, setName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const isOAuthUser = user?.oauthProvider != null && user.oauthProvider !== "";

    const profilePictureUrl = useMemo(() => {
        const baseUrl = user?.profilePicture;
        console.log("Base URL:", baseUrl);
        return baseUrl || defaultAvatar;
    }, [user?.profilePicture]);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
        } else {
            setName("");
        }
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [user, isEditingProfile]);

    const handleEditClick = () => {
        setName(user?.name || "");
        setSelectedFile(null);
        setIsEditingProfile(true);
        setProfileError(null);
        setPictureError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCancelEditProfile = () => {
        setIsEditingProfile(false);
        setProfileError(null);
        setPictureError(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith("image/")) {
            if (file.size > 5 * 1024 * 1024) {
                setPictureError("File is too large (Max 5MB).");
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setSelectedFile(file);
            setPictureError(null);
        } else {
            setSelectedFile(null);
            setPictureError("Please select a valid image file.");
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const nameChanged = name !== user?.name;
        const pictureChanged = selectedFile !== null;

        if (!nameChanged && !pictureChanged) {
            setIsEditingProfile(false);
            return;
        }

        setIsLoadingProfile(true);
        setProfileError(null);
        const toastId = toast.loading("Updating profile...");

        const formData = new FormData();
        formData.append('name', name);
        if (pictureChanged) {
            formData.append('pictureFile', selectedFile);
        }

        try {
            const { data } = await api.put("/users/me/update", formData);
            setUser(data);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setIsEditingProfile(false);
            toast.dismiss(toastId);
            showToast("Profile updated successfully!", "success");
        } catch (err) {
            console.error("Profile update error:", err);
            toast.update(toastId, {
                render: err.response?.data?.message || "Failed to update profile.",
                type: "error",
                isLoading: false,
                autoClose: 5000,
                closeButton: true
            });
            setProfileError(err.response?.data?.message || "Failed to update profile.");
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
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
        const toastId = toast.loading("Changing password...");

        try {
            await api.put("/users/me/password", { oldPassword: currentPassword, newPassword });
            toast.dismiss(toastId);
            showToast("Password changed successfully!", "success");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setIsPasswordModalOpen(false);
        } catch (err) {
            console.error("Password change error:", err);
            toast.update(toastId, {
                render: err.response?.data?.message || "Failed to change password.",
                type: "error",
                isLoading: false,
                autoClose: 5000,
                closeButton: true
            });
            setPasswordError(err.response?.data?.message || "Failed to change password.");
        } finally {
            setIsLoadingPassword(false);
        }
    };

    const closePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setPasswordError(null);
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
                    <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
                        <div className="relative group mb-2">
                            <img
                                src={selectedFile ? URL.createObjectURL(selectedFile) : profilePictureUrl}
                                alt="Profile"
                                className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-200 object-cover shadow-lg ${isEditingProfile ? 'cursor-pointer group-hover:opacity-75 transition-opacity' : ''}`}
                                onClick={() => isEditingProfile && fileInputRef.current?.click()}
                            />
                            {isEditingProfile && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition opacity-75 group-hover:opacity-100"
                                    title="Change profile picture"
                                    disabled={isLoadingProfile}
                                >
                                    <FaPencilAlt size={16} />
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            disabled={!isEditingProfile || isLoadingProfile}
                        />
                        {isEditingProfile && pictureError && (
                            <p className="text-red-500 text-xs mt-2 text-center">{pictureError}</p>
                        )}
                    </div>

                    <div className="flex-grow w-full">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-semibold text-gray-700">Account Details</h2>
                            {!isEditingProfile && (
                                <button
                                    onClick={handleEditClick}
                                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
                                    disabled={isLoadingProfile}
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                        {profileError && isEditingProfile && (
                            <p className="text-red-500 text-sm mb-3 text-center">{profileError}</p>
                        )}
                        <form onSubmit={handleSave}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
                                        Name
                                    </label>
                                    {isEditingProfile ? (
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                            disabled={isLoadingProfile}
                                        />
                                    ) : (
                                        <p className="p-2 text-gray-800 text-lg">{user?.name || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                                        Email
                                    </label>
                                    <p className="p-2 text-gray-500">{user?.email || '-'}</p>
                                </div>
                            </div>
                            {isEditingProfile && (
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleCancelEditProfile}
                                        className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                                        disabled={isLoadingProfile}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                        disabled={isLoadingProfile || (!selectedFile && name === user?.name)}
                                    >
                                        {isLoadingProfile ? <LoadingSpinner /> : "Save"}
                                    </button>
                                </div>
                            )}
                        </form>
                        {!isEditingProfile && !isOAuthUser && (
                            <div className="mt-6 border-t pt-4">
                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition duration-200"
                                    disabled={isLoadingProfile}
                                >
                                    Change Password
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Modal isOpen={isPasswordModalOpen} onClose={closePasswordModal} title="Change Your Password">
                {passwordError && <p className="text-red-500 text-sm mb-3 text-center">{passwordError}</p>}
                <form onSubmit={handleChangePassword} className="space-y-4 text-gray-900">
                    <div>
                        <label
                            htmlFor="modalCurrentPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Current Password
                        </label>
                        <input
                            id="modalCurrentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full p-2 border border-gray-300 rounded shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={isLoadingPassword}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="modalNewPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            New Password
                        </label>
                        <input
                            id="modalNewPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full p-2 border border-gray-300 rounded shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={isLoadingPassword}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="modalConfirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Confirm New Password
                        </label>
                        <input
                            id="modalConfirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full p-2 border border-gray-300 rounded shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={isLoadingPassword}
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 disabled:opacity-50"
                            disabled={isLoadingPassword}
                        >
                            {isLoadingPassword ? <LoadingSpinner /> : "Confirm Change Password"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Profile;