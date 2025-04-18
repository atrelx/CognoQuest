import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import useToastStore from "../stores/useToastStore.js";

function Home() {
    const { toast: toastData, clearToast } = useToastStore();
    const toastShownRef = useRef(false);

    useEffect(() => {
        if (toastData && !toastShownRef.current) {
            toastShownRef.current = true;
            toast[toastData.type](toastData.message, {
                autoClose: 3000,
                closeButton: true,
                onClose: () => {
                    clearToast();
                    toastShownRef.current = false;
                }
            });
        }
    }, [toastData, clearToast]);

    return (
        <div className="flex flex-col items-center h-fit  dark:bg-background-dark px-4 py-4 mt-16 overflow-hidden">
            <h1 className="text-4xl font-greeting mb-8 text-text dark:text-text-dark font-heebo" style={{ fontWeight: 'var(--font-weight-header)' }}>
                Welcome to CognoQuest!
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                <div className="text-center bg-secondary dark:bg-secondary-dark rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 transition transform duration-200 animate-slide-up">
                    <h2 className="text-h5 font-header mb-2 text-text dark:text-text-dark font-heebo" style={{ fontWeight: 'var(--font-weight-header)' }}>
                        Create a Survey
                    </h2>
                    <p className="text-h6 font-text text-text-secondary dark:text-text-secondary-dark mb-4 font-heebo" style={{ fontWeight: 'var(--font-weight-text)' }}>
                        Build custom surveys in minutes.
                    </p>
                    <Link
                        to="/create-survey"
                        className="inline-block px-6 py-2 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark rounded font-heebo"
                    >
                        Create Now
                    </Link>
                </div>
                <div className="text-center bg-secondary dark:bg-secondary-dark rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 transition transform duration-200 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-2xl font-semibold mb-2 text-text dark:text-text-dark font-heebo" style={{ fontWeight: 'var(--font-weight-header)' }}>
                        My Surveys
                    </h2>
                    <p className="text-text-secondary dark:text-text-secondary-dark mb-4 font-heebo" style={{ fontWeight: 'var(--font-weight-text)' }}>
                        View and manage your surveys.
                    </p>
                    <Link
                        to="/my-surveys"
                        className="inline-block px-6 py-2 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark rounded font-heebo"
                    >
                        View My Surveys
                    </Link>
                </div>
                <div className="text-center bg-secondary dark:bg-secondary-dark rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 transition transform duration-200 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-2xl font-semibold mb-2 text-text dark:text-text-dark font-heebo" style={{ fontWeight: 'var(--font-weight-header)' }}>
                        Explore Surveys
                    </h2>
                    <p className="text-text-secondary dark:text-text-secondary-dark mb-4 font-heebo" style={{ fontWeight: 'var(--font-weight-text)' }}>
                        Discover surveys created by others.
                    </p>
                    <Link
                        to="/surveys"
                        className="inline-block px-6 py-2 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark rounded font-heebo"
                    >
                        Browse Surveys
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;