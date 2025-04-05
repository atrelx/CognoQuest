import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/ApiService.js";

function SurveyResult() {
    const { id } = useParams();
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            const { data } = await api.get(`/surveys/${id}/results`);
            setResult(data);
        };
        fetchResult();
    }, [id]);

    if (!result) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Survey Results</h1>
            <p>Your Score: {result.userAttempt?.score}%</p>
            <p>Average Score: {result.averageScore}%</p>
            <p>Completion Count: {result.completionCount}</p>
        </div>
    );
}

export default SurveyResult;