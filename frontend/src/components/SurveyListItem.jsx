import React from 'react';
import { Link } from 'react-router-dom';

function SurveyListItem({ survey }) {
    const { id, title = "No Title", description = "No description available.", createdByName = "Unknown" } = survey || {};

    if (!id) {
        console.warn("SurveyListItem received survey without ID:", survey);
        return null;
    }

    return (
        <div className="p-5 bg-secondary dark:bg-secondary-dark rounded-lg border-border dark:border-border-dark border-2 shadow-secondary dark:shadow-secondary-dark hover:shadow-xl transition-shadow duration-200">
            <h2 className="text-h5 text-text dark:text-text-dark font-semibold mb-2">{title}</h2>
            <p className="text-h6 text-text-secondary dark:text-text-secondary-dark">Created by: {createdByName}</p>
            <p className="text-gray-700 mb-4 line-clamp-3">{description}</p>
            <Link
                to={`/survey/${id}`}
                className="inline-block px-6 py-2 bg-primary dark:bg-primary-dark hover:bg-primary/80 dark:hover:bg-primary-dark/80 text-on-primary dark:text-on-primary-dark text-h6 font-medium rounded transition duration-200"
            >
                Take Survey
            </Link>
        </div>
    );
}

export default SurveyListItem;