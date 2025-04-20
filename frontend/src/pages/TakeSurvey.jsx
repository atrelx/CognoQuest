import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/ApiService.js";

function TakeSurvey() {
    const { id } = useParams();
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSurvey = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const { data } = await api.get(`/surveys/${id}`);
                if (!data || !data.questions || !Array.isArray(data.questions)) {
                    throw new Error("Invalid survey data.");
                }

                setSurvey(data);

                const initialAnswers = {};
                data.questions.forEach((q) => {
                    if (!q || q.id == null) return;

                    if (q.type === "MultipleChoice") {
                        initialAnswers[q.id] = { selectedOptionIds: [] };
                    } else if (q.type === "Matching") {
                        if (q.matchingPairs && Array.isArray(q.matchingPairs)) {
                            initialAnswers[q.id] = {
                                matchingAnswers: q.matchingPairs
                                    .filter((p) => p && p.id != null)
                                    .map((p) => ({ pairId: p.id, selectedRightSide: "" })),
                            };
                        } else {
                            initialAnswers[q.id] = { matchingAnswers: [] };
                        }
                    } else if (q.type === "SingleChoice") {
                        initialAnswers[q.id] = { selectedOptionIds: [] };
                    } else if (q.type === "TextInput") {
                        initialAnswers[q.id] = { textAnswer: "" };
                    } else {
                        initialAnswers[q.id] = {};
                    }
                });

                setAnswers(initialAnswers);
            } catch (err) {
                console.error("Fetch survey error:", err);
                setError(err.message || "Failed to load survey.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSurvey();
    }, [id]);

    const handleAnswerChange = (questionId, type, value, optionId = null, pairId = null) => {
        if (questionId == null) return;

        // Clear validation error for the question if it exists
        if (validationErrors[questionId]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[questionId];
                return newErrors;
            });
        }

        // Update the answers state
        setAnswers((prev) => {
            const newAnswers = { ...prev };

            // Initialize the answer structure if it doesn't exist
            if (!newAnswers[questionId]) {
                switch (type) {
                    case "MultipleChoice":
                        newAnswers[questionId] = { selectedOptionIds: [] };
                        break;
                    case "Matching":
                        newAnswers[questionId] = {
                            matchingAnswers: survey?.questions
                                ?.find((q) => q.id === questionId)
                                ?.matchingPairs?.filter((p) => p && p.id != null)
                                .map((p) => ({ pairId: p.id, selectedRightSide: "" })) || [],
                        };
                        break;
                    case "TextInput":
                        newAnswers[questionId] = { textAnswer: "" };
                        break;
                    case "SingleChoice":
                        newAnswers[questionId] = { selectedOptionIds: [] };
                        break;
                    default:
                        newAnswers[questionId] = {};
                }
            }

            const currentAnswer = newAnswers[questionId];

            // Update the answer based on the question type
            switch (type) {
                case "SingleChoice":
                    newAnswers[questionId] = { ...currentAnswer, selectedOptionIds: [value] };
                    break;
                case "MultipleChoice":
                    const currentSelection = currentAnswer.selectedOptionIds || [];
                    if (value) {
                        if (optionId && !currentSelection.includes(optionId)) {
                            newAnswers[questionId] = {
                                ...currentAnswer,
                                selectedOptionIds: [...currentSelection, optionId],
                            };
                        }
                    } else if (optionId) {
                        newAnswers[questionId] = {
                            ...currentAnswer,
                            selectedOptionIds: currentSelection.filter((id) => id !== optionId),
                        };
                    }
                    break;
                case "TextInput":
                    newAnswers[questionId] = { ...currentAnswer, textAnswer: value };
                    break;
                case "Matching":
                    const currentMatching = currentAnswer.matchingAnswers || [];
                    let pairFound = false;

                    const updatedMatching = currentMatching.map((match) => {
                        if (match.pairId === pairId) {
                            pairFound = true;
                            return { ...match, selectedRightSide: value };
                        }
                        return match;
                    });

                    if (!pairFound && pairId != null) {
                        updatedMatching.push({ pairId: pairId, selectedRightSide: value });
                    }

                    newAnswers[questionId] = { ...currentAnswer, matchingAnswers: updatedMatching };
                    break;
                default:
                    break;
            }

            return newAnswers;
        });
    };

    const validateAnswers = () => {
        const errors = {};
        let allAnswered = true;

        if (!survey || !survey.questions) return { isValid: false, errors };

        for (const q of survey.questions) {
            const answerData = answers[q.id];
            let questionAnswered = false;

            // validates answer based on question type
            switch (q.type) {
                case 'SingleChoice':
                    if (!answerData || !answerData.selectedOptionIds || answerData.selectedOptionIds.length !== 1) {
                        errors[q.id] = "Please select one option.";
                        allAnswered = false;
                    } else {
                        questionAnswered = true;
                    }
                    break;
                case 'MultipleChoice':
                    if (!answerData || !answerData.selectedOptionIds || answerData.selectedOptionIds.length === 0) {
                        errors[q.id] = "Please select at least one option.";
                        allAnswered = false;
                    } else {
                        questionAnswered = true;
                    }
                    break;
                case 'TextInput':
                    questionAnswered = answerData && typeof answerData.textAnswer === 'string';
                    if (!questionAnswered) allAnswered = false;
                    break;
                case 'Matching':
                    const matchingAnswered = answerData && answerData.matchingAnswers &&
                        answerData.matchingAnswers.length === q.matchingPairs?.length &&
                        answerData.matchingAnswers.every(a => typeof a.selectedRightSide === 'string');
                    if (!matchingAnswered) {
                        errors[q.id] = "Please provide a match for every item.";
                        allAnswered = false;
                    } else {
                        questionAnswered = true;
                    }
                    break;
                default:
                    allAnswered = false;
                    break;
            }
            if (errors[q.id]) {
                allAnswered = false;
            }
        }

        if (!allAnswered && Object.keys(errors).length === 0) {
        }

        return { isValid: Object.keys(errors).length === 0, errors };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const { isValid, errors } = validateAnswers();
        setValidationErrors(errors);

        if (!isValid) {
            console.log("Frontend validation failed:", errors);
            setError("Please correct the errors marked below.");
            return;
        }

        setIsLoading(true);

        const formattedAnswers = Object.entries(answers)
            .map(([questionId, answerData]) => {
                const question = survey.questions.find(q => q.id === questionId);
                if (!question) return null;

                const dto = {
                    questionId: questionId,
                    selectedOptionIds: null,
                    textAnswer: null,
                    matchingAnswers: null,
                };

                switch (question.type) {
                    case 'SingleChoice':
                    case 'MultipleChoice':
                        dto.selectedOptionIds = answerData.selectedOptionIds || [];
                        break;
                    case 'TextInput':
                        dto.textAnswer = answerData.textAnswer || "";
                        break;
                    case 'Matching':
                        dto.matchingAnswers = (answerData.matchingAnswers || []).map(m => ({
                            pairId: m.pairId,
                            selectedRightSide: m.selectedRightSide || "",
                        }));
                        break;
                }

                return dto;
            })
            .filter(Boolean);

        const attempt = { surveyId: id, answers: formattedAnswers };
        console.log("Submitting Attempt Payload:", JSON.stringify(attempt, null, 2));

        try {
            await api.post("/surveys/attempt", attempt);
            navigate(`/survey/${id}/result`);
        } catch (err) {
            console.error("Submit attempt error:", err);
            setError(err.response?.data?.message || err.response?.data?.error || "Submission failed.");
            setIsLoading(false);
        }
    };


    if (isLoading && !survey) return <div className="text-center mt-10">Loading survey...</div>;
    if (error && !survey) return <div className="text-center mt-10 p-4 bg-red-100 text-red-700 rounded">{error}</div>;
    if (!survey || !survey.questions) return <div className="text-center mt-10">Survey data not available.</div>;

    return (
        <div className="max-w-3xl mx-auto mt-10 mb-10 p-6 bg-secondary dark:bg-secondary-dark rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-text dark:text-text-dark mb-2">{survey.title}</h1>
            {survey.description && <p className="text-text dark:text-text-dark mb-6">{survey.description}</p>}

            {/* Global error message */}
            {error && <p className="text-error bg-error-50 font-header p-3 rounded mb-4 text-center">{error}</p>}


            <form onSubmit={handleSubmit}>
                {survey.questions.map((q, index) => {
                    if (!q || q.id == null) return null;
                    const questionError = validationErrors[q.id];

                    return (
                        <div
                            key={q.id}
                            className={`mb-6 p-4 border rounded-lg shadow-sm ${
                                questionError ? 'border-red-400 bg-red-50' : 'border-border dark:border-border-dark bg-secondary-container dark:bg-secondary-container-dark'
                            }`}
                        >
                            <label className="block font-semibold mb-3 text-lg text-text dark:text-text-dark">
                                {index + 1}. {q.questionText}
                            </label>

                            {/* Error message for question */}
                            {questionError && (
                                <p className="text-red-500 text-sm mb-2">{questionError}</p>
                            )}

                            {/* Answer options */}
                            {q.type === "SingleChoice" && q.options && (
                                <div className="space-y-2">
                                    {q.options.map((opt) => {
                                        if (!opt || opt.id == null) return null;
                                        return (
                                            <label
                                                key={opt.id}
                                                className="flex items-center p-2 rounded hover:bg-primary/10 dark:hover:bg-primary-dark/40 cursor-pointer"
                                            >
                                                <input
                                                    type="radio"
                                                    name={q.id.toString()}
                                                    value={opt.id}
                                                    checked={
                                                        answers[q.id]?.selectedOptionIds?.[0] === opt.id
                                                    }
                                                    onChange={(e) =>
                                                        handleAnswerChange(q.id, q.type, e.target.value)
                                                    }
                                                    className="mr-3 h-4 w-4 text-text dark:text-text-dark border-border dark:border-border-dark focus:ring-blue-500 accent-primary dark:accent-secondary-dark"
                                                />
                                                <span className="text-text dark:text-text-dark">{opt.optionText}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {q.type === "MultipleChoice" && q.options && (
                                <div className="space-y-2">
                                    {q.options.map((opt) => {
                                        if (!opt || opt.id == null) return null;
                                        return (
                                            <label
                                                key={opt.id}
                                                className="flex items-center p-2 rounded hover:bg-primary/10 dark:hover:bg-primary-dark/40 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        answers[q.id]?.selectedOptionIds?.includes(opt.id) ||
                                                        false
                                                    }
                                                    onChange={(e) =>
                                                        handleAnswerChange(
                                                            q.id,
                                                            q.type,
                                                            e.target.checked,
                                                            opt.id
                                                        )
                                                    }
                                                    className="mr-3 h-4 w-4 text-text dark:text-text-dark border-border dark:border-border-dark rounded focus:ring-blue-500 accent-primary dark:accent-secondary-dark"
                                                />
                                                <span className="text-text dark:text-text-dark">{opt.optionText}</span>
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
                                    className="w-full p-2 border text-text dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-border dark:focus:ring-border-dark border-border dark:border-border-dark rounded shadow-sm"
                                    placeholder="Type your answer here"
                                />
                            )}

                            {q.type === "Matching" && q.matchingPairs && (
                                <div className="space-y-3">
                                    <p className="text-sm text-text dark:text-text-dark italic">Match items...</p>
                                    {q.matchingPairs.map((pair) => {
                                        if (!pair || pair.id == null) return null;
                                        return (
                                            <div
                                                key={pair.id}
                                                className="grid grid-cols-2 gap-4 items-center"
                                            >
                            <span className="p-2 rounded text-text dark:text-text-dark border border-border dark:border-border-dark text-right font-medium shadow-sm">
                                {pair.leftSide}
                            </span>
                                                <input
                                                    type="text"
                                                    value={
                                                        answers[q.id]?.matchingAnswers?.find(
                                                            (a) => a.pairId === pair.id
                                                        )?.selectedRightSide || ''
                                                    }
                                                    onChange={(e) =>
                                                        handleAnswerChange(
                                                            q.id,
                                                            q.type,
                                                            e.target.value,
                                                            null,
                                                            pair.id
                                                        )
                                                    }
                                                    className="p-2 border text-text dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-border dark:focus:ring-border-dark border-border dark:border-border-dark rounded shadow-sm"
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
                {/* Submit button */}
                <button
                    type="submit"
                    className="w-full p-3 mt-6 bg-primary font-header text-text-dark dark:bg-primary-dark hover:bg-primary/85 dark:hover:bg-primary-dark/85 transition duration-200 disabled:opacity-50 cursor-pointer"
                    disabled={isLoading}
                >
                    {isLoading ? 'Submitting...' : 'Submit Answers'}
                </button>
            </form>
        </div>
    );
}
export default TakeSurvey;