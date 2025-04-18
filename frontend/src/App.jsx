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
import { ThemeProvider } from "./providers/ThemeProvider.jsx";
import ThemedToastContainer from "./components/ThemedToastContainer.jsx";
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast-styles.css';

function App() {
    const { isAuthenticated, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <ThemeProvider>
            <Routes>
                {/* Routes without protection */}
                <Route
                    path="/login"
                    element={
                        <div className="min-h-screen font-heebo">
                            {isAuthenticated ? <Navigate to="/" /> : <Login />}
                            <ThemedToastContainer />
                        </div>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <div className="min-h-screen font-heebo">
                            {isAuthenticated ? <Navigate to="/" /> : <Register />}
                            <ThemedToastContainer />
                        </div>
                    }
                />
                {/* Protected routes */}
                <Route
                    path="*"
                    element={
                        <div className="min-h-screen bg-background/90 dark:bg-background-dark font-heebo">
                            {isAuthenticated && <Navbar />}
                            <div className="container mx-auto p-4">
                                <Routes>
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
                                <ThemedToastContainer />
                            </div>
                        </div>
                    }
                />
            </Routes>
        </ThemeProvider>
    );
}

export default App;