import { useMemo } from 'react';

export function usePaginationRange({ totalPages, currentPage, siblingCount = 1 }) {
    return useMemo(() => {
        const totalPageNumbers = siblingCount + 5;

        if (totalPageNumbers >= totalPages) {
            return Array.from({ length: totalPages }, (_, i) => i);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 0);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 1);

        const shouldShowLeftDots = leftSiblingIndex > 1;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

        const firstPageIndex = 0;
        const lastPageIndex = totalPages - 1;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = Array.from({ length: leftItemCount }, (_, i) => i);
            return [...leftRange, '...', lastPageIndex];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i);
            return [firstPageIndex, '...', ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
            return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
        }

        return [];
    }, [totalPages, currentPage, siblingCount]);
}