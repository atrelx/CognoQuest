import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/ApiService.js";

function Surveys() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                setLoading(true);
                const { data } = await api.get("/surveys");
                setSurveys(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching surveys:", err);
                setError("Failed to load surveys. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchSurveys();
    }, []);

    const filteredSurveys = surveys.filter((survey) =>
        survey.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="mt-10 text-center">
                <p className="text-xl">Loading surveys...</p>
            </div>
        );
    }


    if (error) {
        return (
            <div className="mt-10 text-center">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }


    return (
        <div className="mt-10">
            <h1 className="text-2xl font-bold mb-4">Available Surveys</h1>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search surveys by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
            </div>
            {filteredSurveys.length === 0 ? (
                <p className="text-gray-600">
                    {searchQuery ? "No surveys match your search." : "No surveys available yet."}
                </p>
            ) : (
                <div className="grid gap-4">
                    {filteredSurveys.map((survey) => (
                        <div key={survey.id} className="p-4 bg-white rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold">{survey.title}</h2>
                            <p>{survey.description || "No description provided."}</p>
                            <Link
                                to={`/survey/${survey.id}`}
                                className="mt-2 inline-block p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Take Survey
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Surveys;