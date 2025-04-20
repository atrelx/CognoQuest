import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/ApiService.js";

function SurveyResult() {
    const { id } = useParams();
    const [result, setResult] = useState(null); // SurveyResultDto
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { data } = await api.get(`/surveys/${id}/results`);
                setResult(data); // SurveyResultDto
            } catch (err) {
                console.error("Failed to fetch results:", err);
                setError(err.response?.data?.message || "Failed to load survey results. The survey might not exist or results are unavailable.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    if (isLoading) return <div className="text-center mt-10">Loading results...</div>;
    if (error) return <div className="text-center mt-10 p-4 bg-red-100 text-red-700 rounded">{error}</div>;
    if (!result) return <div className="text-center mt-10">Could not retrieve survey results.</div>;

    return (
        <div className="max-w-2xl mx-auto mt-10 mb-10 p-8 bg-secondary dark:bg-secondary-dark rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold mb-6 text-center text-text dark:text-text-dark">
                Survey Results: {result.title || 'Survey'}
            </h1>

            {result.userAttempt ? (
                <div className="mb-6 p-5 border-2 border border-border dark:border-border-dark bg-secondary-container dark:bg-secondary-container-dark rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-3 text-text dark:text-text-dark text-center">Your Result</h2>
                    <p className="text-lg text-text dark:text-text-dark text-center">
                        <span className="font-bold text-text dark:text-text-dark ml-2">
                            {result.userAttempt.score != null ? `${result.userAttempt.score.toFixed(1)}%` : 'Not scored yet'}
                        </span>
                    </p>
                </div>
            ) : (
                <p className="mb-6 p-4 border border-yellow-300 rounded bg-yellow-50 text-yellow-800 text-center">
                    You haven't taken this survey, or your result isn't available yet.
                </p>
            )}

            <div className="p-5 border-2 border-border dark:border-border-dark bg-secondary-container dark:bg-secondary-container-dark rounded-lg shadow">
                <h2 className="text-xl font-header mb-3 text-text dark:text-text-dark text-center">Overall Statistics</h2>
                <div className="flex justify-around text-center">
                    <div>
                        <p className="text-text dark:text-text-dark">Average Score</p>
                        <p className="text-2xl font-bold text-text dark:text-text-dark">
                            {result.averageScore != null ? `${result.averageScore.toFixed(1)}%` : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-text dark:text-text-dark">Total Completions</p>
                        <p className="text-2xl font-bold text-text dark:text-text-dark">
                            {result.completionCount ?? 0}
                        </p>
                    </div>
                </div>
            </div>


            <div className="mt-8 text-center space-x-4">
                <Link
                    to="/surveys"
                    className="inline-block px-5 py-2 font-header bg-delete text-white hover:bg-delete/85 rounded-md transition duration-200 shadow"
                >
                    Back to Surveys List
                </Link>
                <Link
                    to={`/survey/${id}`}
                    className="inline-block px-5 py-2 font-header bg-primary dark:bg-primary-dark hover:bg-primary/85 dark:hover:bg-primary-dark/85 cursor-pointer text-text-dark rounded transition disabled:opacity-50 rounded-mdtransition duration-200 shadow"
                >
                    {result.userAttempt ? 'Retake Survey' : 'Take Survey'}
                </Link>
            </div>
        </div>
    );
}

export default SurveyResult;