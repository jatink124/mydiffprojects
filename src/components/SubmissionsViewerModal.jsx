import React from 'react';

const SubmissionsViewerModal = ({ show, submissions, onExport, onClose }) => {
    if (!show) return null;

    // Get headers from the first submission, if any
    const headers = submissions.length > 0 ? Object.keys(submissions[0]) : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Form Submissions</h2>
                    <button
                        className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-200"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
                <div className="overflow-auto flex-grow mb-6 border border-gray-200 rounded-lg">
                    {submissions.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    {headers.map(key => (
                                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {submissions.map((submission, index) => (
                                    <tr key={index}>
                                        {headers.map((key, idx) => (
                                            <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {typeof submission[key] === 'boolean' ? (submission[key] ? 'Yes' : 'No') : String(submission[key])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="p-6 text-gray-500 text-center">No submissions yet for this form.</p>
                    )}
                </div>
                <button
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md"
                    onClick={onExport}
                >
                    Export Submissions (JSON)
                </button>
            </div>
        </div>
    );
};

export default SubmissionsViewerModal;