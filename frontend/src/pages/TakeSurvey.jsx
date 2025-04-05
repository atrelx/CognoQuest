import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/ApiService.js";

function TakeSurvey() {
    const { id } = useParams();
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSurvey = async () => {
            const { data } = await api.get(`/surveys/${id}`);
            setSurvey(data);
        };
        fetchSurvey();
    }, [id]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const attempt = {
            surveyId: id,
            answers: Object.entries(answers).map(([questionId, value]) => ({
                questionId,
                ...value,
            })),
        };
        const { data } = await api.post("/surveys/attempt", attempt);
        navigate(`/survey/${id}/result`);
    };

    if (!survey) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">{survey.title}</h1>
            <form onSubmit={handleSubmit}>
                {survey.questions.map((q) => (
                    <div key={q.id} className="mb-6">
                        <p className="font-semibold">{q.questionText}</p>
                        {q.type === "SingleChoice" || q.type === "MultipleChoice" ? (
                            q.options.map((opt) => (
                                <label key={opt.id} className="block">
                                    <input
                                        type={q.type === "SingleChoice" ? "radio" : "checkbox"}
                                        name={q.id}
                                        value={opt.id}
                                        onChange={(e) =>
                                            handleAnswerChange(q.id, {
                                                selectedOptionIds: q.type === "SingleChoice"
                                                    ? [opt.id]
                                                    : [...(answers[q.id]?.selectedOptionIds || []), opt.id].filter(
                                                        (v, i, a) => a.indexOf(v) === i
                                                    ),
                                            })
                                        }
                                    />
                                    {opt.optionText}
                                </label>
                            ))
                        ) : q.type === "TextInput" ? (
                            <input
                                type="text"
                                onChange={(e) => handleAnswerChange(q.id, { textAnswer: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        ) : q.type === "Matching" ? (
                            q.matchingPairs.map((pair) => (
                                <div key={pair.id} className="flex mb-2">
                                    <span className="w-1/2">{pair.leftSide}</span>
                                    <input
                                        type="text"
                                        onChange={(e) =>
                                            handleAnswerChange(q.id, {
                                                matchingAnswers: [
                                                    ...(answers[q.id]?.matchingAnswers || []),
                                                    { pairId: pair.id, selectedRightSide: e.target.value },
                                                ],
                                            })
                                        }
                                        className="w-1/2 p-2 border rounded"
                                    />
                                </div>
                            ))
                        ) : null}
                    </div>
                ))}
                <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
                    Submit
                </button>
            </form>
        </div>
    );
}

export default TakeSurvey;