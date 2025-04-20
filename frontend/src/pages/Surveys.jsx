import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/ApiService.js";
import { useDebounce } from "../hooks/useDebounce.js";
import SurveyListItem from '../components/SurveyListItem.jsx';
import Pagination from '../components/Pagination.jsx';

function Surveys() {
    const [surveys, setSurveys] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("title,asc");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const fetchSurveysPage = useCallback(async (page, size, title, sort) => {
        setLoading(true); setError(null);
        try {
            const params = { page, size, sort, title: title || "" };
            const { data } = await api.get("/surveys", { params });
            setSurveys(data.content || []);
            setTotalPages(data.totalPages || 0);
            setCurrentPage(data.number != null ? data.number : 0);
        } catch (err) { console.error("Error fetching surveys:", err); setError("Failed to load surveys."); setSurveys([]); setTotalPages(0); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchSurveysPage(currentPage, pageSize, debouncedSearchQuery, sortOption);
    }, [currentPage, pageSize, debouncedSearchQuery, sortOption, fetchSurveysPage]);

    useEffect(() => {
        if (currentPage !== 0) { setCurrentPage(0); }
    }, [debouncedSearchQuery, sortOption]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) { setCurrentPage(newPage); }
    };
    const handleSearchChange = (event) => { setSearchQuery(event.target.value); };
    const handleSortChange = (event) => { setSortOption(event.target.value); };

    return (
        <div className="container mx-auto mt-10 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl text-text dark:text-text-dark font-bold text-center sm:text-left">
                    Available Surveys
                </h1>
                <Link to="/create-survey"
                      className="w-full font-header sm:w-auto p-2 px-7 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark rounded shadow-xl hover:shadow-primary/50 dark:hover:shadow-primary-dark/50 transition text-center">
                    Create New Survey
                </Link>
            </div>

            {/* Search/Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input type="text"
                       placeholder="Search surveys by title..."
                       value={searchQuery}
                       onChange={handleSearchChange}
                       className="flex-grow p-3 text-text dark:text-text-dark border-3 border-border dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-border shadow-sm" />
                <div className="flex-shrink-0">
                    <label htmlFor="sort-surveys" className="sr-only">Sort by:</label>
                    <select id="sort-surveys" value={sortOption}
                            onChange={handleSortChange}
                            className="p-3 bg-primary dark:bg-primary-dark text-text-dark font-1000 border-3 border-border dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-border shadow-sm h-full w-full sm:w-auto cursor-pointer hover:accent" >
                        <option value="title,asc">Sort by: Title (A-Z)</option>
                        <option value="title,desc">Sort by: Title (Z-A)</option>
                        <option value="startDate,desc">Sort by: Newest First</option>
                        <option value="startDate,asc">Sort by: Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Load / Error */}
            {loading && ( <div className="text-center text-gray-500 py-10"><p>Loading surveys...</p></div> )}
            {!loading && error && ( <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg"><p>{error}</p></div> )}

            {/* Survey list */}
            {!loading && !error && (
                <>
                    {surveys.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">
                            {searchQuery ? "No surveys match your search criteria." : "No surveys available yet."}
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {surveys.map((survey) => (
                                <SurveyListItem key={survey.id} survey={survey} />
                            ))}
                        </div>
                    )}
                    {/* Pagination at the bottom */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
}

export default Surveys;