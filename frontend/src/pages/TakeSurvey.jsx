import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/ApiService.js";

function TakeSurvey() {
    const { id } = useParams();
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSurvey = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // /api/surveys/{id} has to return the survey data
                // consisting of survey.title, survey.description, and survey.questions
                // every question has its id, questionText, type,
                const { data } = await api.get(`/surveys/${id}`);
                if (!data || !data.questions || !Array.isArray(data.questions)) {
                    throw new Error("Invalid survey data received from server.");
                }
                setSurvey(data);

                const initialAnswers = {};
                data.questions.forEach(q => {
                    if (!q || q.id == null) {
                        console.warn("Skipping invalid question data:", q);
                        return;
                    };
                    if (q.type === 'MultipleChoice') {
                        initialAnswers[q.id] = { selectedOptionIds: [] };
                    } else if (q.type === 'Matching') {

                        if (q.matchingPairs && Array.isArray(q.matchingPairs)) {
                            initialAnswers[q.id] = {
                                matchingAnswers: q.matchingPairs
                                    .filter(p => p && p.id != null)
                                    .map(p => ({ pairId: p.id, selectedRightSide: '' }))
                            };
                        } else {
                            initialAnswers[q.id] = { matchingAnswers: [] };
                        }
                    } else if (q.type === 'SingleChoice') {
                        initialAnswers[q.id] = { selectedOptionIds: [] };
                    } else if (q.type === 'TextInput') {
                        initialAnswers[q.id] = { textAnswer: '' };
                    } else {
                        initialAnswers[q.id] = {};
                    }
                });
                setAnswers(initialAnswers);

            } catch (err) {
                console.error("Failed to fetch survey:", err);
                setError(err.message || "Failed to load survey. Please check the URL or try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSurvey();
    }, [id]);


    const handleAnswerChange = (questionId, type, value, optionId = null, pairId = null) => {
        if (questionId == null) {
            console.error("handleAnswerChange called with null questionId");
            return;
        }

        setAnswers((prev) => {
            const newAnswers = { ...prev };

            if (!newAnswers[questionId]) {
                if (type === 'MultipleChoice') newAnswers[questionId] = { selectedOptionIds: [] };
                else if (type === 'Matching') newAnswers[questionId] = { matchingAnswers: survey?.questions?.find(q => q.id === questionId)?.matchingPairs?.filter(p => p && p.id != null).map(p => ({ pairId: p.id, selectedRightSide: '' })) || [] };
                else if (type === 'TextInput') newAnswers[questionId] = { textAnswer: ''};
                else if (type === 'SingleChoice') newAnswers[questionId] = { selectedOptionIds: []};
                else newAnswers[questionId] = {};
                console.warn(`Initialized missing answer state for question ${questionId}`);
            }
            const currentAnswer = newAnswers[questionId];

            switch (type) {
                case "SingleChoice":
                    newAnswers[questionId] = { ...currentAnswer, selectedOptionIds: [value] };
                    break;
                case "MultipleChoice":
                    const currentSelection = currentAnswer.selectedOptionIds || [];
                    if (value) {
                        if (optionId && !currentSelection.includes(optionId)) {
                            newAnswers[questionId] = { ...currentAnswer, selectedOptionIds: [...currentSelection, optionId] };
                        }
                    } else {
                        if (optionId) {
                            newAnswers[questionId] = { ...currentAnswer, selectedOptionIds: currentSelection.filter(id => id !== optionId) };
                        }
                    }
                    break;
                case "TextInput":
                    // value - e.target.value
                    newAnswers[questionId] = { ...currentAnswer, textAnswer: value };
                    break;
                case "Matching":
                    // value - e.target.value
                    const currentMatching = currentAnswer.matchingAnswers || [];
                    let pairFound = false;
                    const updatedMatching = currentMatching.map(match => {
                        if (match.pairId === pairId) {
                            pairFound = true;
                            return { ...match, selectedRightSide: value };
                        }
                        return match;
                    });
                    if (!pairFound && pairId != null) {
                        updatedMatching.push({ pairId: pairId, selectedRightSide: value });
                        console.warn(`Added missing matching pair state for pairId ${pairId}`);
                    }
                    newAnswers[questionId] = { ...currentAnswer, matchingAnswers: updatedMatching };
                    break;
                default:
                    console.warn(`Unhandled question type: ${type} for question ID: ${questionId}`);
                    break;
            }
            console.log("Updated answers state:", newAnswers);
            return newAnswers;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const answeredQuestionIds = new Set(Object.keys(answers));
        const allQuestionIds = new Set(survey.questions.map(q => q.id));
        if (answeredQuestionIds.size !== allQuestionIds.size) {
            // TODO: show what answers are missing
            setError("Please answer all questions before submitting.");
            setIsLoading(false);
            return;
        }

        const formattedAnswers = Object.entries(answers).map(([questionId, answerData]) => {
            const question = survey.questions.find(q => q.id === questionId);
            if (!question) {
                console.error(`Question data not found for ID: ${questionId}`);
                return null;
            }

            const answerDto = {
                questionId: questionId,
                selectedOptionIds: null,
                textAnswer: null,
                matchingAnswers: null,
            };

            switch (question.type) {
                case 'SingleChoice':
                case 'MultipleChoice':
                    answerDto.selectedOptionIds = answerData.selectedOptionIds || [];
                    break;
                case 'TextInput':
                    answerDto.textAnswer = answerData.textAnswer || "";
                    break;
                case 'Matching':
                    answerDto.matchingAnswers = (answerData.matchingAnswers || []).map(m => ({
                        pairId: m.pairId,
                        selectedRightSide: m.selectedRightSide || ""
                    }));
                    break;
            }
            return answerDto;
        }).filter(Boolean);

        // SurveyAttemptCreateDto
        const attempt = {
            surveyId: id,
            answers: formattedAnswers,
        };

        console.log("Submitting Attempt Payload:", JSON.stringify(attempt, null, 2)); // Логируем точные данные для отправки

        try {
            await api.post("/surveys/attempt", attempt);
            navigate(`/survey/${id}/result`);
        } catch (err) {
            console.error("Failed to submit attempt:", err.response?.data || err.message);
            setError(err.response?.data?.message || err.response?.data?.error || "Submission failed. Please check your answers or try again later.");
            setIsLoading(false);
        }
    };


    if (isLoading && !survey) return <div className="text-center mt-10">Loading survey...</div>;
    if (error) return <div className="text-center mt-10 p-4 bg-red-100 text-red-700 rounded">{error}</div>;
    if (!survey || !survey.questions) return <div className="text-center mt-10">Survey data could not be loaded or is invalid.</div>;

    return (
        <div className="max-w-3xl mx-auto mt-10 mb-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
            {survey.description && <p className="text-gray-700 mb-6">{survey.description}</p>}

            <form onSubmit={handleSubmit}>
                {survey.questions.map((q) => {

                    if (!q || q.id == null) return <div key={Math.random()} className="text-red-500 p-4 my-2 border border-red-200 rounded">Error: Invalid question data encountered.</div>;

                    return (
                        <div key={q.id} className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                            <label className="block font-semibold mb-3 text-lg text-gray-800">{q.questionText}</label>


                            {q.type === "SingleChoice" && q.options && (
                                <div className="space-y-2">
                                    {q.options.map((opt) => {
                                        if (!opt || opt.id == null) return <div key={Math.random()} className="text-red-500">Invalid option</div>;
                                        return (
                                            <label key={opt.id} className="flex items-center p-2 rounded hover:bg-blue-50 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={q.id.toString()}
                                                    value={opt.id} // value - это ID опции
                                                    checked={answers[q.id]?.selectedOptionIds?.[0] === opt.id}
                                                    onChange={(e) => handleAnswerChange(q.id, q.type, e.target.value)}
                                                    className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{opt.optionText}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}


                            {q.type === "MultipleChoice" && q.options && (
                                <div className="space-y-2">
                                    {q.options.map((opt) => {
                                        if (!opt || opt.id == null) return <div key={Math.random()} className="text-red-500">Invalid option</div>;
                                        return (
                                            <label key={opt.id} className="flex items-center p-2 rounded hover:bg-blue-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={answers[q.id]?.selectedOptionIds?.includes(opt.id) || false}
                                                    onChange={(e) => handleAnswerChange(q.id, q.type, e.target.checked, opt.id)}
                                                    className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{opt.optionText}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}


                            {q.type === "TextInput" && (
                                <input
                                    type="text"
                                    value={answers[q.id]?.textAnswer || ''}
                                    onChange={(e) => handleAnswerChange(q.id, q.type, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Type your answer here"
                                />
                            )}


                            {q.type === "Matching" && q.matchingPairs && (
                                <div className="space-y-3">

                                    <p className="text-sm text-gray-600 italic">Match the items on the left with the correct items on the right.</p>
                                    {q.matchingPairs.map((pair) => {
                                        if (!pair || pair.id == null) return <div key={Math.random()} className="text-red-500">Invalid matching pair</div>;
                                        return (
                                            <div key={pair.id} className="grid grid-cols-2 gap-4 items-center">

                                                <span className="p-3 bg-gray-100 rounded text-gray-800 text-right font-medium shadow-sm">{pair.leftSide}</span>

                                                <input
                                                    type="text"
                                                    value={answers[q.id]?.matchingAnswers?.find(a => a.pairId === pair.id)?.selectedRightSide || ''}
                                                    onChange={(e) => handleAnswerChange(q.id, q.type, e.target.value, null, pair.id)} // Передаем pair ID
                                                    className="p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter match here"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
                {/* Кнопка отправки */}
                <button
                    type="submit"
                    className="w-full p-3 mt-6 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition duration-200 disabled:opacity-50"
                    disabled={isLoading} // Блокируем кнопку во время загрузки/отправки
                >
                    {isLoading ? 'Submitting...' : 'Submit Answers'}
                </button>
            </form>
        </div>
    );
}
export default TakeSurvey;