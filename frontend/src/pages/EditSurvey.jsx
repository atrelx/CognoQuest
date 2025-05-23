import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/ApiService.js";
import useToastStore from "../stores/useToastStore.js";
import { FaTrashAlt } from 'react-icons/fa';
import LoadingSpinner from "../components/LoadingSpinner.jsx";

function EditSurvey() {
    const { id: surveyId } = useParams();
    const navigate = useNavigate();
    const { showToast, toast: toastData, clearToast } = useToastStore();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [saveError, setSaveError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({
        title: null,
        questions: {},
        noQuestionsError: false,
    });

    useEffect(() => {
        const fetchSurveyForEdit = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const { data } = await api.get(`/surveys/${surveyId}/edit`);
                setTitle(data.title || "");
                setDescription(data.description || "");
                setStartDate(data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "");
                setEndDate(data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : "");
                const mappedQuestions = (data.questions || []).map(q => ({
                    ...q,
                    tempId: q.id || Date.now() + Math.random(),
                    options: (q.options || []).map(o => ({
                        ...o,
                        tempId: o.id || Date.now() + Math.random() + 1,
                    })),
                    matchingPairs: (q.matchingPairs || []).map(p => ({
                        ...p,
                        tempId: p.id || Date.now() + Math.random() + 2,
                    })),
                }));
                setQuestions(mappedQuestions);
            } catch (err) {
                console.error("Fetch error:", err);
                setFetchError(err.response?.data?.message || "Could not load survey.");
            } finally {
                setIsLoading(false);
            }
        };

        if (surveyId) {
            fetchSurveyForEdit();
        } else {
            setFetchError("Survey ID missing.");
            setIsLoading(false);
        }
    }, [surveyId]);

    useEffect(() => {
        if (toastData && toastData.type === "error") {
            import('react-toastify').then(({ toast }) => {
                toast.error(toastData.message, {
                    autoClose: 5000,
                    closeButton: true,
                });
                clearToast();
            });
        }
    }, [toastData, clearToast]);

    const addQuestion = (type) => {
        setQuestions(prev => [
            ...prev,
            {
                tempId: Date.now(),
                id: null,
                type,
                questionText: "",
                options: [],
                matchingPairs: [],
                correctTextAnswer: "",
            }
        ]);
        if (validationErrors.noQuestionsError) {
            setValidationErrors(prev => ({ ...prev, noQuestionsError: false }));
        }
    };

    const removeQuestion = (tempId) => {
        setQuestions(prev => prev.filter(q => q.tempId !== tempId));
        setValidationErrors(prev => {
            const newQErrors = { ...prev.questions };
            delete newQErrors[tempId];
            return { ...prev, questions: newQErrors };
        });
    };

    const updateQuestion = (tempId, field, value) => {
        setQuestions(prev =>
            prev.map(q => q.tempId === tempId ? { ...q, [field]: value } : q)
        );
        if (validationErrors.questions[tempId]?.[field === 'questionText' ? 'text' : 'answer']) {
            setValidationErrors(prev => {
                const qErrors = { ...prev.questions[tempId] };
                delete qErrors[field === 'questionText' ? 'text' : 'answer'];
                const updatedQuestions = { ...prev.questions, [tempId]: qErrors };
                if (Object.keys(qErrors).length === 0) delete updatedQuestions[tempId];
                return { ...prev, questions: updatedQuestions };
            });
        }
    };

    const addOption = (qTempId) => {
        setQuestions(prev =>
            prev.map(q =>
                q.tempId === qTempId
                    ? { ...q, options: [...q.options, { tempId: Date.now() + Math.random(), id: null, optionText: "", isCorrect: false }] }
                    : q
            )
        );
        clearAnswerError(qTempId);
    };

    const removeOption = (qTempId, oTempId) => {
        setQuestions(prev =>
            prev.map(q =>
                q.tempId === qTempId
                    ? { ...q, options: q.options.filter(opt => opt.tempId !== oTempId) }
                    : q
            )
        );
        clearAnswerError(qTempId);
    };

    const updateOption = (qTempId, oTempId, field, value) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q => {
                if (q.tempId !== qTempId) return q;
                let newOptions = [...q.options];
                if (field === "isCorrect") {
                    newOptions = q.type === "SingleChoice"
                        ? newOptions.map(opt => ({ ...opt, isCorrect: opt.tempId === oTempId ? value : false }))
                        : newOptions.map(opt => opt.tempId === oTempId ? { ...opt, isCorrect: value } : opt);
                } else {
                    newOptions = newOptions.map(opt => opt.tempId === oTempId ? { ...opt, [field]: value } : opt);
                }
                return { ...q, options: newOptions };
            })
        );
        clearAnswerError(qTempId);
    };

    const addMatchingPair = (qTempId) => {
        setQuestions(prev =>
            prev.map(q =>
                q.tempId === qTempId
                    ? { ...q, matchingPairs: [...q.matchingPairs, { tempId: Date.now() + Math.random(), id: null, leftSide: "", rightSide: "" }] }
                    : q
            )
        );
        clearAnswerError(qTempId);
    };

    const removeMatchingPair = (qTempId, pTempId) => {
        setQuestions(prev =>
            prev.map(q =>
                q.tempId === qTempId
                    ? { ...q, matchingPairs: q.matchingPairs.filter(p => p.tempId !== pTempId) }
                    : q
            )
        );
        clearAnswerError(qTempId);
    };

    const updateMatchingPair = (qTempId, pTempId, field, value) => {
        setQuestions(prev =>
            prev.map(q =>
                q.tempId === qTempId
                    ? {
                        ...q,
                        matchingPairs: q.matchingPairs.map(p =>
                            p.tempId === pTempId ? { ...p, [field]: value } : p
                        ),
                    }
                    : q
            )
        );
        clearAnswerError(qTempId);
    };

    const clearAnswerError = (qTempId) => {
        if (validationErrors.questions[qTempId]?.answer) {
            setValidationErrors(prev => {
                const qErrors = { ...prev.questions[qTempId] };
                delete qErrors.answer;
                const updatedQuestions = { ...prev.questions, [qTempId]: qErrors };
                if (Object.keys(qErrors).length === 0) delete updatedQuestions[qTempId];
                return { ...prev, questions: updatedQuestions };
            });
        }
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        if (validationErrors.title) {
            setValidationErrors(prev => ({ ...prev, title: null }));
        }
    };

    const validateForm = () => {
        const errors = { title: null, questions: {}, noQuestionsError: false };
        let isValid = true;

        if (!title.trim()) {
            errors.title = 'Survey title cannot be empty.';
            isValid = false;
        }

        if (questions.length === 0) {
            errors.noQuestionsError = true;
            isValid = false;
        }

        questions.forEach(q => {
            const qErrors = {};
            if (!q.questionText.trim()) {
                qErrors.text = 'Question text cannot be empty.';
                isValid = false;
            }
            switch (q.type) {
                case 'SingleChoice':
                case 'MultipleChoice':
                    if (!q.options?.length) {
                        qErrors.answer = "Add at least one option.";
                        isValid = false;
                    } else if (!q.options.some(o => o.isCorrect)) {
                        qErrors.answer = "Mark at least one option as correct.";
                        isValid = false;
                    } else if (q.options.some(o => !o.optionText.trim())) {
                        qErrors.answer = "All options must have text.";
                        isValid = false;
                    }
                    break;
                case 'TextInput':
                    if (!q.correctTextAnswer?.trim()) {
                        qErrors.answer = "Enter the correct answer.";
                        isValid = false;
                    }
                    break;
                case 'Matching':
                    if (!q.matchingPairs?.length) {
                        qErrors.answer = "Add at least one pair.";
                        isValid = false;
                    } else if (q.matchingPairs.some(p => !p.leftSide.trim() || !p.rightSide.trim())) {
                        qErrors.answer = "Both sides of all pairs must be filled.";
                        isValid = false;
                    }
                    break;
                default:
                    break;
            }
            if (Object.keys(qErrors).length) {
                errors.questions[q.tempId] = qErrors;
            }
        });

        return { isValid, errors };
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setSaveError(null);

        const { isValid, errors } = validateForm();
        setValidationErrors(errors);
        if (!isValid) return;

        setIsSaving(true);

        const questionsToSend = questions.map(q => {
            // Create a copy without tempId
            const questionCopy = { ...q };
            delete questionCopy.tempId;

            return {
                ...questionCopy,
                options: q.options?.map(o => {
                    const optionCopy = { ...o };
                    delete optionCopy.tempId;
                    return optionCopy;
                }),
                matchingPairs: q.matchingPairs?.map(p => {
                    const pairCopy = { ...p };
                    delete pairCopy.tempId;
                    return pairCopy;
                }),
            };
        });

        const surveyData = {
            title,
            description,
            startDate: startDate ? new Date(startDate).toISOString() : null,
            endDate: endDate ? new Date(endDate).toISOString() : null,
            questions: questionsToSend,
        };

        try {
            await api.put(`/surveys/${surveyId}`, surveyData);
            showToast("Survey updated successfully!", "success");
            navigate("/");
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to update survey.", "error");
            setSaveError(err.response?.data?.message || "Failed to update survey.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <div className="text-center mt-10">
            <LoadingSpinner />
            <p>Loading survey data...</p>
        </div>
    );
    if (fetchError) return <div className="text-center mt-10 p-4 bg-red-100 text-red-700 rounded">{fetchError}</div>;

    return (
        <div className="max-w-3xl mx-auto mt-10 mb-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-center">Edit Survey</h1>
            {saveError && <p className="text-red-500 text-sm mb-3 text-center p-2 bg-red-50 rounded">{saveError}</p>}
            <form onSubmit={handleUpdateSubmit}>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        className={`w-full p-2 border rounded shadow-sm ${validationErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                        required
                        disabled={isSaving}
                    />
                    {validationErrors.title && <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded shadow-sm"
                        disabled={isSaving}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded shadow-sm"
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded shadow-sm"
                            disabled={isSaving}
                        />
                    </div>
                </div>

                <div className={`mb-6 border-t pt-6 rounded-md ${validationErrors.noQuestionsError ? 'border-2 border-dashed border-red-400 p-4 bg-red-50' : ''}`}>
                    <h2 className="text-xl font-semibold mb-3">Edit Questions</h2>
                    {validationErrors.noQuestionsError && <p className="text-red-600 text-sm mb-3 font-medium">Please add at least one question.</p>}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button type="button" onClick={() => addQuestion("SingleChoice")} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600" disabled={isSaving}>Add Single Choice</button>
                        <button type="button" onClick={() => addQuestion("MultipleChoice")} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600" disabled={isSaving}>Add Multiple Choice</button>
                        <button type="button" onClick={() => addQuestion("TextInput")} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600" disabled={isSaving}>Add Text Input</button>
                        <button type="button" onClick={() => addQuestion("Matching")} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600" disabled={isSaving}>Add Matching</button>
                    </div>
                </div>

                {questions.map((q) => {
                    const qErrors = validationErrors.questions[q.tempId] || {};
                    return (
                        <div
                            key={q.tempId}
                            className={`mb-6 p-4 border rounded shadow-sm relative ${qErrors.text || qErrors.answer ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        >
                            <button
                                type="button"
                                onClick={() => removeQuestion(q.tempId)}
                                className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700"
                                title="Remove question"
                                disabled={isSaving}
                            >
                                <FaTrashAlt />
                            </button>
                            <span className="text-xs font-semibold uppercase text-gray-500 mb-2 block">
                {q.type.replace(/([A-Z])/g, ' $1').trim()}
              </span>
                            <input
                                type="text"
                                value={q.questionText}
                                onChange={(e) => updateQuestion(q.tempId, "questionText", e.target.value)}
                                placeholder="Question Text"
                                className={`w-full p-2 mb-1 border rounded ${qErrors.text ? 'border-red-400' : 'border-gray-300'}`}
                                required
                                disabled={isSaving}
                            />
                            {qErrors.text && <p className="text-red-500 text-xs mb-2">{qErrors.text}</p>}
                            {qErrors.answer && <p className="text-red-500 text-xs mb-2">{qErrors.answer}</p>}

                            {(q.type === "SingleChoice" || q.type === "MultipleChoice") && (
                                <div className="pl-4 border-l-2 border-blue-200 ml-2 mb-3 mt-2 space-y-2">
                                    {(q.options || []).map((opt) => (
                                        <div key={opt.tempId} className="flex items-center relative group">
                                            <input
                                                type={q.type === "SingleChoice" ? "radio" : "checkbox"}
                                                name={`correct_${q.tempId}`}
                                                checked={opt.isCorrect || false}
                                                onChange={(e) => updateOption(q.tempId, opt.tempId, "isCorrect", e.target.checked)}
                                                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                disabled={isSaving}
                                            />
                                            <input
                                                type="text"
                                                value={opt.optionText || ''}
                                                onChange={(e) => updateOption(q.tempId, opt.tempId, "optionText", e.target.value)}
                                                placeholder="Option Text"
                                                className={`flex-grow p-2 border rounded ${!opt.optionText?.trim() && qErrors.answer ? 'border-red-400' : 'border-gray-300'}`}
                                                required
                                                disabled={isSaving}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeOption(q.tempId, opt.tempId)}
                                                className="ml-2 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove option"
                                                disabled={isSaving}
                                            >
                                                <FaTrashAlt size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addOption(q.tempId)}
                                        className="p-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 mt-2"
                                        disabled={isSaving}
                                    >
                                        Add Option
                                    </button>
                                </div>
                            )}

                            {q.type === "TextInput" && (
                                <input
                                    type="text"
                                    value={q.correctTextAnswer || ''}
                                    onChange={(e) => updateQuestion(q.tempId, "correctTextAnswer", e.target.value)}
                                    placeholder="Correct Answer (Case-insensitive)"
                                    className={`w-full p-2 border rounded mt-2 ${qErrors.answer ? 'border-red-400' : 'border-gray-300'}`}
                                    required
                                    disabled={isSaving}
                                />
                            )}

                            {q.type === "Matching" && (
                                <div className="pl-4 border-l-2 border-yellow-200 ml-2 mb-3 mt-2 space-y-2">
                                    {(q.matchingPairs || []).map((pair) => (
                                        <div key={pair.tempId} className="flex items-center relative group">
                                            <input
                                                type="text"
                                                value={pair.leftSide}
                                                onChange={(e) => updateMatchingPair(q.tempId, pair.tempId, "leftSide", e.target.value)}
                                                placeholder="Left Side"
                                                className={`w-1/2 p-2 border rounded mr-2 ${!pair.leftSide?.trim() && qErrors.answer ? 'border-red-400' : 'border-gray-300'}`}
                                                required
                                                disabled={isSaving}
                                            />
                                            <input
                                                type="text"
                                                value={pair.rightSide}
                                                onChange={(e) => updateMatchingPair(q.tempId, pair.tempId, "rightSide", e.target.value)}
                                                placeholder="Matching Right Side"
                                                className={`w-1/2 p-2 border rounded ${!pair.rightSide?.trim() && qErrors.answer ? 'border-red-400' : 'border-gray-300'}`}
                                                required
                                                disabled={isSaving}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeMatchingPair(q.tempId, pair.tempId)}
                                                className="ml-2 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove pair"
                                                disabled={isSaving}
                                            >
                                                <FaTrashAlt size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addMatchingPair(q.tempId)}
                                        className="p-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 mt-2"
                                        disabled={isSaving}
                                    >
                                        Add Pair
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="flex justify-end space-x-3 mt-6 border-t pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                        disabled={isSaving}
                    >
                        {isSaving ? <LoadingSpinner /> : "Update Survey"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditSurvey;