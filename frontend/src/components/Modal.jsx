import React from 'react';

function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative transform transition-all duration-300 scale-95 opacity-0 animate-modal-appear">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl leading-none"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                {title && <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>}
                <div className="text-gray-900">
                    {children}
                </div>
            </div>
        </div>
    );
}


export default Modal;