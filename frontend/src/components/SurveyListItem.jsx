import React from 'react';
import { Link } from 'react-router-dom';

function SurveyListItem({ survey }) {
    const { id, title = "No Title", description = "No description available.", createdByName = "Unknown" } = survey || {};

    if (!id) {
        console.warn("SurveyListItem received survey without ID:", survey);
        return null;
    }

    return (
        <div className="p-5 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-blue-700">{title}</h2>
            <p className="text-sm text-gray-500 mb-3">Created by: {createdByName}</p>
            <p className="text-gray-700 mb-4 line-clamp-3">{description}</p>
            <Link
                to={`/survey/${id}`}
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition duration-200"
            >
                Take Survey
            </Link>
        </div>
    );
}

export default SurveyListItem;