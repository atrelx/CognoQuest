import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/ApiService.js";
import { FaTrashAlt } from 'react-icons/fa';
import useToastStore from "../stores/useToastStore.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

function CreateSurvey() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString().split('T')[0];
    });
    const [questions, setQuestions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({ title: null, questions: {}, noQuestionsError: false });

    const navigate = useNavigate();
    const { showToast, toast: toastData, clearToast } = useToastStore();

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

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        if (validationErrors.title) {
            setValidationErrors(prev => ({ ...prev, title: null }));
        }
    };

    const addQuestion = (type) => {
        setQuestions(prev => [...prev, {
            tempId: Date.now(),
            id: null,
            type,
            questionText: "",
            options: [],
            matchingPairs: [],
            correctTextAnswer: ""
        }]);
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
        setQuestions(prev => prev.map(q =>
            q.tempId === tempId ? { ...q, [field]: value } : q
        ));
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

    const addOption = (qTempId) => {
        setQuestions(prev => prev.map(q =>
            q.tempId === qTempId ? {
                ...q,
                options: [...q.options, {
                    tempId: Date.now() + Math.random(),
                    id: null,
                    optionText: "",
                    isCorrect: false
                }]
            } : q
        ));
        clearAnswerError(qTempId);
    };

    const removeOption = (qTempId, oTempId) => {
        setQuestions(prev => prev.map(q =>
            q.tempId === qTempId ? {
                ...q,
                options: q.options.filter(opt => opt.tempId !== oTempId)
            } : q
        ));
        clearAnswerError(qTempId);
    };

    const updateOption = (qTempId, oTempId, field, value) => {
        setQuestions(prev => prev.map(q => {
            if (q.tempId === qTempId) {
                let newOptions = [...q.options];
                if (field === "isCorrect") {
                    if (q.type === "SingleChoice") {
                        newOptions = newOptions.map(opt => ({
                            ...opt,
                            isCorrect: opt.tempId === oTempId ? value : false
                        }));
                    } else {
                        newOptions = newOptions.map(opt =>
                            opt.tempId === oTempId ? { ...opt, isCorrect: value } : opt
                        );
                    }
                } else {
                    newOptions = newOptions.map(opt =>
                        opt.tempId === oTempId ? { ...opt, [field]: value } : opt
                    );
                }
                return { ...q, options: newOptions };
            }
            return q;
        }));
        clearAnswerError(qTempId);
    };

    const addMatchingPair = (qTempId) => {
        setQuestions(prev => prev.map(q =>
            q.tempId === qTempId ? {
                ...q,
                matchingPairs: [...q.matchingPairs, {
                    tempId: Date.now() + Math.random(),
                    id: null,
                    leftSide: "",
                    rightSide: ""
                }]
            } : q
        ));
        clearAnswerError(qTempId);
    };

    const removeMatchingPair = (qTempId, pTempId) => {
        setQuestions(prev => prev.map(q =>
            q.tempId === qTempId ? {
                ...q,
                matchingPairs: q.matchingPairs.filter(p => p.tempId !== pTempId)
            } : q
        ));
        clearAnswerError(qTempId);
    };

    const updateMatchingPair = (qTempId, pTempId, field, value) => {
        setQuestions(prev => prev.map(q =>
            q.tempId === qTempId ? {
                ...q,
                matchingPairs: q.matchingPairs.map(p =>
                    p.tempId === pTempId ? { ...p, [field]: value } : p
                )
            } : q
        ));
        clearAnswerError(qTempId);
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
                    if (!q.options || q.options.length === 0) {
                        qErrors.answer = "Add at least one option.";
                        isValid = false;
                    } else if (!q.options.some(opt => opt.isCorrect)) {
                        qErrors.answer = "Mark at least one option as correct.";
                        isValid = false;
                    } else if (q.options.some(opt => !opt.optionText.trim())) {
                        qErrors.answer = "All options must have text.";
                        isValid = false;
                    }
                    break;
                case 'TextInput':
                    if (!q.correctTextAnswer || !q.correctTextAnswer.trim()) {
                        qErrors.answer = "Enter the correct answer.";
                        isValid = false;
                    }
                    break;
                case 'Matching':
                    if (!q.matchingPairs || q.matchingPairs.length === 0) {
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
            if (Object.keys(qErrors).length > 0) {
                errors.questions[q.tempId] = qErrors;
            }
        });

        return { isValid, errors };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);

        const { isValid, errors } = validateForm();
        setValidationErrors(errors);
        if (!isValid) {
            return;
        }

        setIsSaving(true);

        const questionsToSend = questions.map(q => ({
            ...q,
            options: (q.options || []).map(opt => ({
                optionText: opt.optionText,
                isCorrect: opt.isCorrect
            })),
            matchingPairs: (q.matchingPairs || []).map(pair => ({
                leftSide: pair.leftSide,
                rightSide: pair.rightSide
            }))
        }));

        try {
            const surveyData = {
                title,
                description,
                startDate: startDate ? new Date(startDate).toISOString() : null,
                endDate: endDate ? new Date(endDate).toISOString() : null,
                questions: questionsToSend
            };
            await api.post("/surveys", surveyData);
            showToast("Survey created successfully!", "success");
            navigate("/");
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to create survey.", "error");
            setSubmitError(err.response?.data?.message || "Failed to create survey.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 mb-10 p-6 bg-secondary dark:bg-secondary-dark rounded-lg shadow-md">
            <h1 className="text-3xl text-text/70 dark:text-text-dark font-bold text-center mb-6">
                Create New Survey
            </h1>

            {submitError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
                    {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="title"
                           className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Enter survey title"
                        className={`w-full p-2 resize-none text-text dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-border border rounded shadow-sm ${validationErrors.title ? 'border-error' : 'border-border'}`}
                        required
                        disabled={isSaving}
                    />
                    {validationErrors.title && <p className="text-error text-xs mt-1">{validationErrors.title}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="description"
                           className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter survey description (optional)"
                        rows="3"
                        className="w-full p-2 resize-none text-text dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-border border border-border rounded shadow-sm"
                        disabled={isSaving}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="startDate"
                               className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                            Start Date
                        </label>
                        <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 resize-none text-text dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-border border border-border rounded shadow-sm"
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate"
                               className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                            End Date
                        </label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 resize-none text-text dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-border border border-border rounded shadow-sm"
                            disabled={isSaving}
                        />
                    </div>
                </div>

                <div
                    className={`mb-6 border-t border-t-2 border-border dark:border-border-dark pt-6 ${validationErrors.noQuestionsError ? 'border-1 rounded-md border-t-2 border-dashed border-error p-4 bg-error/60' : ''}`}>
                    <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-3">Questions</h2>
                    {validationErrors.noQuestionsError && (
                        <p className="text-red-600 text-sm mb-3 font-medium">
                            Please add at least one question to the survey.
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                        <button type="button" onClick={() => addQuestion("SingleChoice")}
                                className="p-2 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark hover:bg-primary/80 dark:hover:bg-primary-dark/80 cursor-pointer rounded" disabled={isSaving}>Add
                            Single Choice
                        </button>
                        <button type="button" onClick={() => addQuestion("MultipleChoice")}
                                className="p-2 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark hover:bg-primary/80 dark:hover:bg-primary-dark/80 cursor-pointer rounded" disabled={isSaving}>Add
                            Multiple Choice
                        </button>
                        <button type="button" onClick={() => addQuestion("TextInput")}
                                className="p-2 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark hover:bg-primary/80 dark:hover:bg-primary-dark/80 cursor-pointer rounded" disabled={isSaving}>Add
                            Text Input
                        </button>
                        <button type="button" onClick={() => addQuestion("Matching")}
                                className="p-2 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark hover:bg-primary/80 dark:hover:bg-primary-dark/80 cursor-pointer rounded" disabled={isSaving}>Add
                            Matching
                        </button>
                    </div>
                </div>

                {questions.map((q) => {
                    const qErrors = validationErrors.questions[q.tempId] || {};
                    return (
                        <div
                            key={q.tempId}
                            className={`mb-6 p-4 border rounded shadow-sm relative ${qErrors.text || qErrors.answer ? 'border-red-400 bg-red-50' : 'border-border dark:border-border-dark'}`}
                        >
                            <button
                                type="button"
                                onClick={() => removeQuestion(q.tempId)}
                                className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700"
                                title="Remove question"
                                disabled={isSaving}
                            >
                                <FaTrashAlt/>
                            </button>

                            <span className="text-xs font-semibold uppercase text-text dark:text-text-dark mb-2 block">
                {q.type.replace(/([A-Z])/g, ' $1').trim()}
              </span>

                            <input
                                type="text"
                                value={q.questionText}
                                onChange={(e) => updateQuestion(q.tempId, "questionText", e.target.value)}
                                placeholder="Question Text"
                                className={`w-full p-2 mb-1 text-text dark:text-text-dark border-1 border-border dark:border-border-dark shadow-sm focus:outline-none focus:ring-1 rounded ${qErrors.text ? 'border-error dark:border-error-dark' : 'border-border dark:border-border-dark'}`}
                                required
                                disabled={isSaving}
                            />
                            {qErrors.text && <p className="text-error dark:text-error-dark text-xs mb-2">{qErrors.text}</p>}
                            {qErrors.answer && <p className="text-error dark:text-error-dark text-xs mb-2">{qErrors.answer}</p>}

                            {(q.type === "SingleChoice" || q.type === "MultipleChoice") && (
                                <div className="pl-4 border-l-2 border-blue-200 ml-2 mb-3 mt-2 space-y-2">
                                    {q.options.map((opt) => (
                                        <div key={opt.tempId} className="flex items-center relative group">
                                            <input
                                                type={q.type === "SingleChoice" ? "radio" : "checkbox"}
                                                name={`correct_${q.tempId}`}
                                                checked={opt.isCorrect}
                                                onChange={(e) => updateOption(q.tempId, opt.tempId, "isCorrect", e.target.checked)}
                                                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                disabled={isSaving}
                                            />
                                            <input
                                                type="text"
                                                value={opt.optionText}
                                                onChange={(e) => updateOption(q.tempId, opt.tempId, "optionText", e.target.value)}
                                                placeholder="Option Text"
                                                className={`flex-grow p-2 text-text dark:text-text-dark shadow-sm border-1 focus:outline-none focus:ring-1 rounded mr-2 ${!opt.optionText.trim() && qErrors.answer ? 'border-red-400' : 'border-border dark:border-border-dark'}`}
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
                                                <FaTrashAlt size={12}/>
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addOption(q.tempId)}
                                        className="p-2 text-sm bg-primary/90 dark:bg-primary-dark/90 hover:bg-primary/80 dark:hover:bg-primary-dark-80 text-white rounded cursor-pointer mt-2"
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
                                    className={`w-full p-2 mt-1 text-text dark:text-text-dark shadow-sm border-1 focus:outline-none focus:ring-1 rounded mr-2 ${qErrors.answer ? 'border-red-400' : 'border-border dark:border-border-dark'}`}
                                    required
                                    disabled={isSaving}
                                />
                            )}

                            {q.type === "Matching" && (
                                <div className="pl-4 border-l-2 border-yellow-200 ml-2 mb-3 mt-2 space-y-2">
                                    {q.matchingPairs.map((pair) => (
                                        <div key={pair.tempId} className="flex items-center relative group">
                                            <input
                                                type="text"
                                                value={pair.leftSide}
                                                onChange={(e) => updateMatchingPair(q.tempId, pair.tempId, "leftSide", e.target.value)}
                                                placeholder="Left Side"
                                                className={`w-1/2 p-2 text-text dark:text-text-dark shadow-sm border-1 focus:outline-none focus:ring-1 rounded mr-2 ${!pair.leftSide.trim() && qErrors.answer ? 'border-red-400' : 'border-border dark:border-border-dark'}`}
                                                required
                                                disabled={isSaving}
                                            />
                                            <input
                                                type="text"
                                                value={pair.rightSide}
                                                onChange={(e) => updateMatchingPair(q.tempId, pair.tempId, "rightSide", e.target.value)}
                                                placeholder="Matching Right Side"
                                                className={`w-1/2 p-2 text-text dark:text-text-dark border-1 shadow-sm focus:outline-none focus:ring-1 rounded ${!pair.rightSide.trim() && qErrors.answer ? 'border-red-400' : 'border-border dark:border-border-dark'}`}
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
                                                <FaTrashAlt size={12}/>
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addMatchingPair(q.tempId)}
                                        className="p-2 px-4 text-sm bg-primary/90 dark:bg-primary-dark/90 hover:bg-primary/80 dark:hover:bg-primary-dark-80 text-white rounded cursor-pointer mt-2"
                                        disabled={isSaving}
                                    >
                                        Add Pair
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="flex justify-end space-x-3 mt-6 border-t-2 border-border dark:border-border-dark pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="px-4 py-2 font-header bg-delete text-white hover:bg-delete/85 rounded transition cursor-pointer"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 font-header bg-primary dark:bg-primary-dark hover:bg-primary/85 dark:hover:bg-primary-dark/85 cursor-pointer text-text-dark rounded transition disabled:opacity-50"
                        disabled={isSaving}
                    >
                        {isSaving ? <LoadingSpinner/> : "Create Survey"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateSurvey;