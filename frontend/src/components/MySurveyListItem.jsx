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
        <div className="p-5 bg-secondary dark:bg-secondary-dark rounded-lg border-border dark:border-border-dark border-2 shadow-secondary dark:shadow-secondary-dark hover:shadow-xl transition-shadow duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Name/Description */}
            <div className="flex-grow">
                <h2 className="text-h5 font-semibold mb-1 text-text dark:text-text-dark">{title}</h2>
                <p className="text-text-secondary dark:text-text-secondary-dark text-small line-clamp-2">{description}</p>
            </div>
            {/* Edit/Delete buttons */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Link
                    to={`/edit-survey/${id}`}
                    className="flex items-center justify-center gap-1 w-full sm:w-auto px-3 py-1.5 text-sm bg-edit text-white rounded hover:bg-edit/85 transition text-center"
                    title="Edit Survey"
                >
                    <FaEdit /> Edit
                </Link>
                <button
                    onClick={handleDeleteClick}
                    className="flex items-center justify-center gap-1 w-full sm:w-auto px-3 py-1.5 text-sm bg-delete text-white rounded hover:bg-delete/85 transition cursor-pointer"
                    title="Delete Survey"
                >
                    <FaTrashAlt /> Delete
                </button>
            </div>
        </div>
    );
}

export default MySurveyListItem;