import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/ApiService.js";

function CreateSurvey() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState([]);
    const navigate = useNavigate();

    const addQuestion = (type) => {
        setQuestions([...questions, { type, questionText: "", options: [], matchingPairs: [], correctTextAnswer: "" }]);
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const addOption = (index) => {
        const newQuestions = [...questions];
        newQuestions[index].options.push({ optionText: "", isCorrect: false });
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex, oIndex, field, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex][field] = value;
        setQuestions(newQuestions);
    };

    const addMatchingPair = (index) => {
        const newQuestions = [...questions];
        newQuestions[index].matchingPairs.push({ leftSide: "", rightSide: "" });
        setQuestions(newQuestions);
    };

    const updateMatchingPair = (qIndex, pIndex, field, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].matchingPairs[pIndex][field] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const surveyData = {
                title,
                description,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                questions,
            };
            const { data } = await api.post("/surveys", surveyData);
            navigate(`/surveys`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Create Survey</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full p-2 mb-4 border rounded"
                    required
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full p-2 mb-4 border rounded"
                />
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => addQuestion("SingleChoice")}
                        className="mr-2 p-2 bg-blue-500 text-white rounded"
                    >
                        Add Single Choice
                    </button>
                    <button
                        type="button"
                        onClick={() => addQuestion("MultipleChoice")}
                        className="mr-2 p-2 bg-blue-500 text-white rounded"
                    >
                        Add Multiple Choice
                    </button>
                    <button
                        type="button"
                        onClick={() => addQuestion("TextInput")}
                        className="mr-2 p-2 bg-blue-500 text-white rounded"
                    >
                        Add Text Input
                    </button>
                    <button
                        type="button"
                        onClick={() => addQuestion("Matching")}
                        className="p-2 bg-blue-500 text-white rounded"
                    >
                        Add Matching
                    </button>
                </div>
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="mb-6 p-4 border rounded">
                        <input
                            type="text"
                            value={q.questionText}
                            onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
                            placeholder="Question Text"
                            className="w-full p-2 mb-2 border rounded"
                            required
                        />
                        {q.type === "SingleChoice" || q.type === "MultipleChoice" ? (
                            <>
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex mb-2">
                                        <input
                                            type="text"
                                            value={opt.optionText}
                                            onChange={(e) => updateOption(qIndex, oIndex, "optionText", e.target.value)}
                                            placeholder="Option"
                                            className="w-full p-2 border rounded mr-2"
                                        />
                                        <input
                                            type="checkbox"
                                            checked={opt.isCorrect}
                                            onChange={(e) => updateOption(qIndex, oIndex, "isCorrect", e.target.checked)}
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addOption(qIndex)}
                                    className="p-2 bg-green-500 text-white rounded"
                                >
                                    Add Option
                                </button>
                            </>
                        ) : q.type === "TextInput" ? (
                            <input
                                type="text"
                                value={q.correctTextAnswer}
                                onChange={(e) => updateQuestion(qIndex, "correctTextAnswer", e.target.value)}
                                placeholder="Correct Answer"
                                className="w-full p-2 border rounded"
                            />
                        ) : q.type === "Matching" ? (
                            <>
                                {q.matchingPairs.map((pair, pIndex) => (
                                    <div key={pIndex} className="flex mb-2">
                                        <input
                                            type="text"
                                            value={pair.leftSide}
                                            onChange={(e) => updateMatchingPair(qIndex, pIndex, "leftSide", e.target.value)}
                                            placeholder="Left Side"
                                            className="w-1/2 p-2 border rounded mr-2"
                                        />
                                        <input
                                            type="text"
                                            value={pair.rightSide}
                                            onChange={(e) => updateMatchingPair(qIndex, pIndex, "rightSide", e.target.value)}
                                            placeholder="Right Side"
                                            className="w-1/2 p-2 border rounded"
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addMatchingPair(qIndex)}
                                    className="p-2 bg-green-500 text-white rounded"
                                >
                                    Add Pair
                                </button>
                            </>
                        ) : null}
                    </div>
                ))}
                <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
                    Create Survey
                </button>
            </form>
        </div>
    );
}

export default CreateSurvey;