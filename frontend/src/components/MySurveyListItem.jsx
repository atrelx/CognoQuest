import React from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // Ikony


function MySurveyListItem({ survey, onDelete }) {
    const { id, title = "No Title", description = "No description available." } = survey || {};

    if (!id) return null;

    const handleDeleteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(id, title);
    };

    return (
        <div className="p-5 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Name/Description */}
            <div className="flex-grow">
                <h2 className="text-xl font-semibold mb-1 text-blue-800">{title}</h2>
                <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
            </div>
            {/* Edit/Delete buttons */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Link
                    to={`/edit-survey/${id}`}
                    className="flex items-center justify-center gap-1 w-full sm:w-auto px-3 py-1.5 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-center"
                    title="Edit Survey"
                >
                    <FaEdit /> Edit
                </Link>
                <button
                    onClick={handleDeleteClick}
                    className="flex items-center justify-center gap-1 w-full sm:w-auto px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                    title="Delete Survey"
                >
                    <FaTrashAlt /> Delete
                </button>
            </div>
        </div>
    );
}

export default MySurveyListItem;