import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/ApiService.js";
import { useDebounce } from "../hooks/useDebounce.js";
import MySurveyListItem from '../components/MySurveyListItem.jsx';
import Pagination from '../components/Pagination.jsx';
import Modal from '../components/Modal.jsx';

function MySurveys() {
    const [surveys, setSurveys] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("title,asc");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [surveyToDelete, setSurveyToDelete] = useState({id: null, title: ''});
    const [isDeleting, setIsDeleting] = useState(false);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const fetchSurveysPage = useCallback(
        async (page, size, title, sort) => {
            setLoading(true);
            setError(null);
            try {
                const params = {page, size, sort, title: title || ""};
                const {data} = await api.get("/surveys/user/surveys", {params});
                setSurveys(data.content || []);
                setTotalPages(data.totalPages || 0);

                if (data.number == null || data.number !== currentPage) {
                    setCurrentPage(data.number ?? 0);
                }

                if (
                    (data.content == null || data.content.length === 0) &&
                    data.totalPages > 0 &&
                    data.number > 0
                ) {
                    setCurrentPage((prev) => Math.max(0, prev - 1));
                }
            } catch (err) {
                console.error("Error fetching user surveys:", err);
                setError("Failed to load your surveys.");
                setSurveys([]);
                setTotalPages(0);
            } finally {
                setLoading(false);
            }
        },
        [currentPage]
    );

    useEffect(() => {
        fetchSurveysPage(currentPage, pageSize, debouncedSearchQuery, sortOption);
    }, [currentPage, pageSize, debouncedSearchQuery, sortOption, fetchSurveysPage]);

    useEffect(() => {
        if (currentPage !== 0) {
            setCurrentPage(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchQuery, sortOption]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const handleDeleteClick = (id, title) => {
        setSurveyToDelete({id, title});
        setShowDeleteConfirm(true);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setSurveyToDelete({id: null, title: ""});
    };

    const confirmDelete = async () => {
        if (!surveyToDelete.id) return;

        setIsDeleting(true);
        setError(null);

        try {
            await api.delete(`/surveys/${surveyToDelete.id}`);
            setShowDeleteConfirm(false);
            setSurveyToDelete({id: null, title: ""});
            fetchSurveysPage(currentPage, pageSize, debouncedSearchQuery, sortOption);
        } catch (err) {
            console.error("Error deleting survey:", err);
            setError(err.response?.data?.message || "Failed to delete survey.");
            setShowDeleteConfirm(false);
        } finally {
            setIsDeleting(false);
        }
    };

// --- Renderowanie ---
    return (
        <>
            {/* Główny kontener strony */}
            <div className="container mx-auto mt-10 p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-center sm:text-left">My Surveys</h1>
                    <Link
                        to="/create-survey"
                        className="w-full sm:w-auto p-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition text-center"
                    >
                        Create New Survey
                    </Link>
                </div>

                {/* Wyszukiwanie i Sortowanie */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search your surveys by title..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                    <div className="flex-shrink-0">
                        <label htmlFor="sort-surveys" className="sr-only">
                            Sort by:
                        </label>
                        <select
                            id="sort-surveys"
                            value={sortOption}
                            onChange={handleSortChange}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm h-full w-full sm:w-auto"
                        >
                            <option value="title,asc">Sort by: Title (A-Z)</option>
                            <option value="title,desc">Sort by: Title (Z-A)</option>
                            <option value="startDate,desc">Sort by: Newest First</option>
                            <option value="startDate,asc">Sort by: Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* Loading / Error */}
                {loading && (
                    <div className="text-center text-gray-500 py-10">
                        <p>Loading your surveys...</p>
                    </div>
                )}
                {!loading && error && (
                    <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
                        <p>{error}</p>
                    </div>
                )}

                {/* Results */}
                {!loading && !error && (
                    <>
                        {surveys.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">
                                {searchQuery
                                    ? "No surveys match your search."
                                    : "You haven't created any surveys yet."}
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {surveys.map((survey) => (
                                    <MySurveyListItem
                                        key={survey.id}
                                        survey={survey}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </div>
                        )}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>

            {/* Modal Potwierdzenia Usunięcia */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={cancelDelete}
                title="Confirm Deletion"
            >
                <p className="mb-4 text-gray-700">
                    Are you sure you want to delete the survey titled "
                    <strong>{surveyToDelete.title}</strong>"? This action cannot be
                    undone.
                </p>
                {error && error.includes("delete") && (
                    <p className="text-red-500 text-sm mb-2">{error}</p>
                )}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={cancelDelete}
                        className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </button>
                </div>
            </Modal>
        </>
    );
}

export default MySurveys;