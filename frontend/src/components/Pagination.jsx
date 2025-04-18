import React from 'react';
import { usePaginationRange } from '../hooks/usePaginationRange';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const paginationRange = usePaginationRange({ currentPage, totalPages });

    const handlePrev = () => {
        if (currentPage > 0) onPageChange(currentPage - 1);
    };
    const handleNext = () => {
        if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
    };

    return (
        <nav aria-label="Pagination" className="mt-8 flex justify-center items-center space-x-2">
            {/* Previous Button*/}
            <button
                onClick={handlePrev}
                disabled={currentPage === 0}
                className={`px-3 py-1 rounded transition ${currentPage === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                aria-label="Previous page"
            >
                &lt;
            </button>

            {/* Page numbers */}
            {paginationRange.map((pageNumber, index) => {
                if (pageNumber === '...') {
                    return <span key={`dots-${index}`} className="px-1 py-1 text-gray-500">...</span>;
                }

                const pageIndex = pageNumber;
                return (
                    <button
                        key={pageIndex}
                        onClick={() => onPageChange(pageIndex)}
                        disabled={currentPage === pageIndex}
                        className={`px-3 py-1 rounded transition ${currentPage === pageIndex ? 'bg-primary dark:bg-primary-dark text-text-dark cursor-default' : 'bg-white text-blue-600 border border-gray-300 hover:bg-blue-50'}`}
                        aria-current={currentPage === pageIndex ? 'page' : undefined}
                    >
                        {pageIndex + 1}
                    </button>
                );
            })}

            {/* Next Button */}
            <button
                onClick={handleNext}
                disabled={currentPage >= totalPages - 1}
                className={`px-3 py-1 rounded transition ${currentPage >= totalPages - 1 ? 'bg-gray-200 text-black cursor-not-allowed' : 'bg-gray-200 text-black hover:bg-white-300'}`}
                aria-label="Next page"
            >
                &gt;
            </button>
        </nav>
    );
};

export default Pagination;