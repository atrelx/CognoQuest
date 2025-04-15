// TakeSurvey.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/ApiService.js";

function TakeSurvey() {
    const { id } = useParams();
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Błąd API
    // --- NOWY STAN: Błędy walidacji po stronie klienta ---
    // { questionId: "Error message", ... }
    const [validationErrors, setValidationErrors] = useState({});
    // --- --------------------------------------------- ---
    const navigate = useNavigate();

    // Fetch Survey (bez zmian)
    useEffect(() => { const fetchSurvey = async () => { setIsLoading(true); setError(null); try { const { data } = await api.get(`/surveys/${id}`); if (!data || !data.questions || !Array.isArray(data.questions)) { throw new Error("Invalid survey data."); } setSurvey(data); const initialAnswers = {}; data.questions.forEach(q => { if (!q || q.id == null) return; if (q.type === 'MultipleChoice') { initialAnswers[q.id] = { selectedOptionIds: [] }; } else if (q.type === 'Matching') { if (q.matchingPairs && Array.isArray(q.matchingPairs)) { initialAnswers[q.id] = { matchingAnswers: q.matchingPairs .filter(p => p && p.id != null) .map(p => ({ pairId: p.id, selectedRightSide: '' })) }; } else { initialAnswers[q.id] = { matchingAnswers: [] }; } } else if (q.type === 'SingleChoice') { initialAnswers[q.id] = { selectedOptionIds: [] }; } else if (q.type === 'TextInput') { initialAnswers[q.id] = { textAnswer: '' }; } else { initialAnswers[q.id] = {}; } }); setAnswers(initialAnswers); } catch (err) { console.error("Fetch survey error:", err); setError(err.message || "Failed to load survey."); } finally { setIsLoading(false); } }; fetchSurvey(); }, [id]);

    // handleAnswerChange - dodajemy czyszczenie błędu walidacji dla zmienianego pytania
    const handleAnswerChange = (questionId, type, value, optionId = null, pairId = null) => {
        if (questionId == null) return;

        // Czyść błąd walidacji dla tego pytania przy zmianie odpowiedzi
        if (validationErrors[questionId]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[questionId];
                return newErrors;
            });
        }

        setAnswers((prev) => { /* ... logika ustawiania odpowiedzi jak poprzednio ... */ const newAnswers = { ...prev }; if (!newAnswers[questionId]) { if (type === 'MultipleChoice') newAnswers[questionId] = { selectedOptionIds: [] }; else if (type === 'Matching') newAnswers[questionId] = { matchingAnswers: survey?.questions?.find(q => q.id === questionId)?.matchingPairs?.filter(p => p && p.id != null).map(p => ({ pairId: p.id, selectedRightSide: '' })) || [] }; else if (type === 'TextInput') newAnswers[questionId] = { textAnswer: ''}; else if (type === 'SingleChoice') newAnswers[questionId] = { selectedOptionIds: []}; else newAnswers[questionId] = {}; } const currentAnswer = newAnswers[questionId]; switch (type) { case "SingleChoice": newAnswers[questionId] = { ...currentAnswer, selectedOptionIds: [value] }; break; case "MultipleChoice": const currentSelection = currentAnswer.selectedOptionIds || []; if (value) { if (optionId && !currentSelection.includes(optionId)) { newAnswers[questionId] = { ...currentAnswer, selectedOptionIds: [...currentSelection, optionId] }; } } else { if (optionId) { newAnswers[questionId] = { ...currentAnswer, selectedOptionIds: currentSelection.filter(id => id !== optionId) }; } } break; case "TextInput": newAnswers[questionId] = { ...currentAnswer, textAnswer: value }; break; case "Matching": const currentMatching = currentAnswer.matchingAnswers || []; let pairFound = false; const updatedMatching = currentMatching.map(match => { if (match.pairId === pairId) { pairFound = true; return { ...match, selectedRightSide: value }; } return match; }); if (!pairFound && pairId != null) { updatedMatching.push({ pairId: pairId, selectedRightSide: value }); } newAnswers[questionId] = { ...currentAnswer, matchingAnswers: updatedMatching }; break; default: break; } return newAnswers; });
    };

    // Funkcja walidacji po stronie klienta
    const validateAnswers = () => {
        const errors = {};
        let allAnswered = true; // Flaga sprawdzająca czy na WSZYSTKO odpowiedziano

        if (!survey || !survey.questions) return { isValid: false, errors };

        for (const q of survey.questions) {
            const answerData = answers[q.id];
            let questionAnswered = false;

            switch (q.type) {
                case 'SingleChoice':
                    // Musi być wybrana dokładnie jedna opcja
                    if (!answerData || !answerData.selectedOptionIds || answerData.selectedOptionIds.length !== 1) {
                        errors[q.id] = "Please select one option.";
                        allAnswered = false;
                    } else {
                        questionAnswered = true;
                    }
                    break;
                case 'MultipleChoice':
                    // Musi być wybrana przynajmniej jedna opcja
                    if (!answerData || !answerData.selectedOptionIds || answerData.selectedOptionIds.length === 0) {
                        errors[q.id] = "Please select at least one option.";
                        allAnswered = false;
                    } else {
                        questionAnswered = true;
                    }
                    break;
                case 'TextInput':
                    // Pozwalamy na pusty string "", ale traktujemy jako odpowiedź
                    questionAnswered = answerData && typeof answerData.textAnswer === 'string';
                    if (!questionAnswered) allAnswered = false; // Jeśli nie ma nawet pustego stringa
                    break;
                case 'Matching':
                    // Zakładamy, że wszystkie pary muszą mieć odpowiedź (nawet pusty string)
                    const matchingAnswered = answerData && answerData.matchingAnswers &&
                        answerData.matchingAnswers.length === q.matchingPairs?.length &&
                        answerData.matchingAnswers.every(a => typeof a.selectedRightSide === 'string');
                    if (!matchingAnswered) {
                        // Można by dodać bardziej szczegółowy błąd, np. która para jest pusta
                        errors[q.id] = "Please provide a match for every item.";
                        allAnswered = false;
                    } else {
                        questionAnswered = true;
                    }
                    break;
                default:
                    allAnswered = false; // Nieznany typ, traktuj jako nieodpowiedziany
                    break;
            }
            // Jeśli walidacja specyficzna dla typu nie przeszła, upewnij się, że allAnswered jest false
            if (errors[q.id]) {
                allAnswered = false;
            }
        }

        // Dodatkowy ogólny błąd, jeśli nie wszystkie pytania mają jakąkolwiek odpowiedź
        if (!allAnswered && Object.keys(errors).length === 0) {
            // Jeśli nie znaleziono konkretnych błędów (np. dla TextInput/Matching),
            // ale nie wszystkie pytania mają wpis w 'answers', pokaż ogólny błąd.
            // Można by to uściślić, sprawdzając, które ID brakuje.
            // errors.general = "Please answer all questions.";
        }


        return { isValid: Object.keys(errors).length === 0, errors };
    };

    // handleSubmit z walidacją frontendu
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Wyczyść błędy API

        // --- WALIDACJA FRONTEND ---
        const { isValid, errors } = validateAnswers();
        setValidationErrors(errors); // Ustaw stan błędów walidacji

        if (!isValid) {
            console.log("Frontend validation failed:", errors);
            // Można dodać ogólny komunikat o błędzie walidacji
            setError("Please correct the errors marked below.");
            return; // Przerwij wysyłanie
        }
        // --- KONIEC WALIDACJI ---

        setIsLoading(true); // Ustaw ładowanie tylko jeśli walidacja przeszła

        // Formatowanie odpowiedzi (jak poprzednio)
        const formattedAnswers = Object.entries(answers).map(([questionId, answerData]) => { /* ... jak poprzednio ... */ const question = survey.questions.find(q => q.id === questionId); if (!question) return null; const dto = { questionId: questionId, selectedOptionIds: null, textAnswer: null, matchingAnswers: null, }; switch (question.type) { case 'SingleChoice': case 'MultipleChoice': dto.selectedOptionIds = answerData.selectedOptionIds || []; break; case 'TextInput': dto.textAnswer = answerData.textAnswer || ""; break; case 'Matching': dto.matchingAnswers = (answerData.matchingAnswers || []).map(m => ({ pairId: m.pairId, selectedRightSide: m.selectedRightSide || "" })); break; } return dto; }).filter(Boolean);
        const attempt = { surveyId: id, answers: formattedAnswers };
        console.log("Submitting Attempt Payload:", JSON.stringify(attempt, null, 2));

        try {
            await api.post("/surveys/attempt", attempt);
            navigate(`/survey/${id}/result`);
        } catch (err) { /* ... obsługa błędów API ... */ console.error("Submit attempt error:", err); setError(err.response?.data?.message || err.response?.data?.error || "Submission failed."); setIsLoading(false); }
        // finally nie jest tu potrzebne, bo isLoading=false tylko przy błędzie
    };


    if (isLoading && !survey) return <div className="text-center mt-10">Loading survey...</div>;
    // Pokaż błąd API lub ogólny błąd ładowania
    if (error && !survey) return <div className="text-center mt-10 p-4 bg-red-100 text-red-700 rounded">{error}</div>;
    if (!survey || !survey.questions) return <div className="text-center mt-10">Survey data not available.</div>;

    return (
        <div className="max-w-3xl mx-auto mt-10 mb-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
            {survey.description && <p className="text-gray-700 mb-6">{survey.description}</p>}

            {/* Ogólny komunikat błędu (API lub walidacji) */}
            {error && <p className="text-red-600 bg-red-50 p-3 rounded mb-4 text-center">{error}</p>}


            <form onSubmit={handleSubmit}>
                {survey.questions.map((q, index) => {
                    if (!q || q.id == null) return null; // Pomiń nieprawidłowe
                    const questionError = validationErrors[q.id]; // Błąd dla tego pytania

                    return (
                        // Dodajemy podświetlenie dla błędu walidacji
                        <div key={q.id} className={`mb-6 p-4 border rounded-lg shadow-sm ${questionError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                            <label className="block font-semibold mb-3 text-lg text-gray-800">{index + 1}. {q.questionText}</label> {/* Dodano numerację */}

                            {/* Wyświetlanie błędu walidacji dla pytania */}
                            {questionError && <p className="text-red-500 text-sm mb-2">{questionError}</p>}

                            {/* Opcje odpowiedzi (bez zmian w logice renderowania) */}
                            {q.type === "SingleChoice" && q.options && ( <div className="space-y-2"> {q.options.map((opt) => { if (!opt || opt.id == null) return null; return ( <label key={opt.id} className="flex items-center p-2 rounded hover:bg-blue-50 cursor-pointer"> <input type="radio" name={q.id.toString()} value={opt.id} checked={answers[q.id]?.selectedOptionIds?.[0] === opt.id} onChange={(e) => handleAnswerChange(q.id, q.type, e.target.value)} className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" /> <span className="text-gray-700">{opt.optionText}</span> </label> ); })} </div> )}
                            {q.type === "MultipleChoice" && q.options && ( <div className="space-y-2"> {q.options.map((opt) => { if (!opt || opt.id == null) return null; return ( <label key={opt.id} className="flex items-center p-2 rounded hover:bg-blue-50 cursor-pointer"> <input type="checkbox" checked={answers[q.id]?.selectedOptionIds?.includes(opt.id) || false} onChange={(e) => handleAnswerChange(q.id, q.type, e.target.checked, opt.id)} className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /> <span className="text-gray-700">{opt.optionText}</span> </label> ); })} </div> )}
                            {q.type === "TextInput" && ( <input type="text" value={answers[q.id]?.textAnswer || ''} onChange={(e) => handleAnswerChange(q.id, q.type, e.target.value)} className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Type your answer here" /> )}
                            {q.type === "Matching" && q.matchingPairs && ( <div className="space-y-3"> <p className="text-sm text-gray-600 italic">Match items...</p> {q.matchingPairs.map((pair) => { if (!pair || pair.id == null) return null; return ( <div key={pair.id} className="grid grid-cols-2 gap-4 items-center"> <span className="p-3 bg-gray-100 rounded text-gray-800 text-right font-medium shadow-sm">{pair.leftSide}</span> <input type="text" value={answers[q.id]?.matchingAnswers?.find(a => a.pairId === pair.id)?.selectedRightSide || ''} onChange={(e) => handleAnswerChange(q.id, q.type, e.target.value, null, pair.id)} className="p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Enter match here" /> </div> ); })} </div> )}
                        </div>
                    );
                })}
                {/* Przycisk Submit */}
                <button
                    type="submit"
                    className="w-full p-3 mt-6 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition duration-200 disabled:opacity-50"
                    disabled={isLoading} // Aktywny, chyba że trwa wysyłanie
                >
                    {isLoading ? 'Submitting...' : 'Submit Answers'}
                </button>
            </form>
        </div>
    );
}
export default TakeSurvey;