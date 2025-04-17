import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreateSurvey from "./pages/CreateSurvey";
import Surveys from "./pages/Surveys";
import MySurveys from "./pages/MySurveys";
import EditSurvey from "./pages/EditSurvey";
import TakeSurvey from "./pages/TakeSurvey";
import SurveyResult from "./pages/SurveyResult";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./stores/Auth.js";
import {ToastContainer} from "react-toastify";

function App() {
    const { isAuthenticated, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <div className="min-h-screen bg-gray-100">
            {isAuthenticated && <Navbar />}
            <div className="container mx-auto p-4">
                <Routes>
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to="/" /> : <Login />}
                    />
                    <Route
                        path="/register"
                        element={isAuthenticated ? <Navigate to="/" /> : <Register />}
                    />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/create-survey"
                        element={
                            <ProtectedRoute>
                                <CreateSurvey />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/surveys"
                        element={
                            <ProtectedRoute>
                                <Surveys />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-surveys"
                        element={
                            <ProtectedRoute>
                                <MySurveys />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/survey/:id"
                        element={
                            <ProtectedRoute>
                                <TakeSurvey />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/edit-survey/:id"
                        element={
                            <ProtectedRoute>
                                <EditSurvey />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/survey/:id/result"
                        element={
                            <ProtectedRoute>
                                <SurveyResult />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
                </Routes>
                <ToastContainer
                    position="bottom-left"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </div>
        </div>
    );
}

export default App;