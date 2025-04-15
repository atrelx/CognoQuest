import { Link } from "react-router-dom";
import useAuthStore from "../stores/Auth.js";

function Home() {
    const { user } = useAuthStore();

    return (
        <div className="text-center mt-20">
            <h1 className="text-4xl font-bold mb-6">
                Welcome to CognoQuest, {user?.name || "Guest"}!
            </h1>
            <div className="space-x-4">
                <Link
                    to="/create-survey"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Create Survey
                </Link>
                <Link to="/my-surveys" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-lg">
                    My Surveys
                </Link>
                <Link
                    to="/surveys"
                    className="inline-block px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    View Surveys
                </Link>
            </div>
        </div>
    );
}

export default Home;