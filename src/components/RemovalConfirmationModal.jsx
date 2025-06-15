import React from 'react';

const RemovalConfirmationModal = ({ show, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
                <p className="text-lg font-semibold mb-6 text-gray-800">Are you sure you want to remove this component?</p>
                <div className="flex space-x-4">
                    <button
                        id="confirm-remove"
                        className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition duration-200"
                        onClick={onConfirm}
                    >
                        Yes, Remove
                    </button>
                    <button
                        id="cancel-remove"
                        className="bg-gray-300 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-400 transition duration-200"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RemovalConfirmationModal;