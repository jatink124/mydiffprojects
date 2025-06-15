import React from 'react';

const FeedbackMessage = ({ message, type }) => {
    if (!message) return null;

    const bgColorClass = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    }[type] || 'bg-gray-500';

    return (
        <div className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg text-white z-50 ${bgColorClass}`}>
            {message}
        </div>
    );
};

export default FeedbackMessage;