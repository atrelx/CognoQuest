import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/ApiService.js";

function Surveys() {
    const [surveys, setSurveys] = useState([]);

    useEffect(() => {
        const fetchSurveys = async () => {
            const { data } = await api.get("/surveys");
            setSurveys(data);
        };
        fetchSurveys();
    }, []);

    return (
        <div className="mt-10">
            <h1 className="text-2xl font-bold mb-4">Available Surveys</h1>
            <div className="grid gap-4">
                {surveys.map((survey) => (
                    <div key={survey.id} className="p-4 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold">{survey.title}</h2>
                        <p>{survey.description}</p>
                        <Link
                            to={`/survey/${survey.id}`}
                            className="mt-2 inline-block p-2 bg-blue-600 text-white rounded"
                        >
                            Take Survey
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Surveys;