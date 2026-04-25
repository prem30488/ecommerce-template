import React from 'react';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end === totalPages) start = Math.max(1, end - maxVisible + 1);

            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex justify-center items-center gap-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg transition-all border font-bold ${
                    currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : 'bg-white hover:bg-[var(--color-primary)] hover:text-white'
                }`}
                style={{
                    borderColor: 'var(--color-primary)',
                    color: currentPage === 1 ? '#9ca3af' : 'var(--color-primary)'
                }}
            >
                Prev
            </button>

            {getPageNumbers().map(num => (
                <button
                    key={num}
                    onClick={() => onPageChange(num)}
                    className={`w-10 h-10 rounded-lg font-bold transition-all border ${
                        currentPage === num
                        ? 'text-white shadow-lg'
                        : 'bg-white hover:bg-[var(--color-primary)] hover:text-white'
                    }`}
                    style={{
                        backgroundColor: currentPage === num ? 'var(--color-secondary)' : 'transparent',
                        borderColor: currentPage === num ? 'var(--color-secondary)' : 'var(--color-primary)',
                        color: currentPage === num ? 'white' : 'var(--color-primary)',
                        boxShadow: currentPage === num ? '0 4px 12px var(--color-secondary-shadow)' : 'none'
                    }}
                >
                    {num}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg transition-all border font-bold ${
                    currentPage === totalPages 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : 'bg-white hover:bg-[var(--color-primary)] hover:text-white'
                }`}
                style={{
                    borderColor: 'var(--color-primary)',
                    color: currentPage === totalPages ? '#9ca3af' : 'var(--color-primary)'
                }}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
