import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../stores/Auth.js';
import api from '../services/ApiService.js';
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login: loginUserInStore } = useAuthStore();

    useEffect(() => {
        const oauthError = searchParams.get('error');
        if (oauthError) {
            setError(`OAuth login failed: ${oauthError}`);

            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate]);


    const handleStandardLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data) {
                loginUserInStore(response.data);
                navigate("/home");
            } else {
                setError("Login failed: No user data returned.");
            }
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.response?.data?.message || "Login failed. Please check credentials.");
        }
    };

    const handleRegister = () => {
        navigate('/register');
    };

    const handleGoogleLogin = () => {
        setError('');
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                {/* Login form */}
                <form onSubmit={handleStandardLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            id="email" type="email" placeholder="Email" required
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="sr-only">Password</label>
                        <input
                            id="password" type="password" placeholder="Password" required
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
                        Login
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600">Don't have an account?</p>
                    <button onClick={handleRegister} className="font-medium text-blue-600 hover:underline">
                        Register here
                    </button>
                </div>

                <div className="mt-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                {/* Login with Google button */}
                <div className="mt-6">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex justify-center items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                        Sign in with Google
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Login;