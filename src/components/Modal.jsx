// components/Modal.jsx
import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div
            // Outer overlay for backdrop and closing when clicking outside
            // flex items-center justify-center: Centers the modal vertically and horizontally
            // p-4 sm:p-6: Adds padding around the modal on smaller (p-4) and slightly larger (sm:p-6) screens
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 sm:p-6"
            onClick={onClose} // Close modal when clicking outside
        >
            <div
                // Inner modal content container
                // w-full: Takes full width available (up to max-width)
                // max-h-[90vh]: Limits height to 90% of viewport height
                // overflow-y-auto: Enables vertical scrolling if content exceeds max-height
                // max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl: Responsive max-widths for different screen sizes
                className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100
                           max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl"
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
            >
                {children}
            </div>
        </div>
    );
};

export default Modal;