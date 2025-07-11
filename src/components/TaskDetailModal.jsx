// components/TaskDetailModal.jsx
import React, { useEffect } from 'react';
import { FiEdit3, FiTrash2 } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

const TaskDetailModal = ({ task, aiAnalysis, loadingAI, onClose, onEditTask, onDeleteTask, toggleComplete }) => {
    if (!task) return null; // Don't render if no task is selected

    const handleEditClick = () => {
        onClose(); // Close the detail modal first
        onEditTask(task); // Then trigger edit in parent
    };

    const handleDeleteClick = () => {
        onClose(); // Close the detail modal first
        onDeleteTask(task._id); // Then trigger delete confirmation in parent
    };

    const handleCheckboxChange = () => {
        toggleComplete(task); // Toggle complete status directly
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800">{task.title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-5 space-y-4 text-gray-700">
                    <p className="text-sm">
                        <strong className="font-semibold">Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                        <strong className="font-semibold">Priority:</strong> {task.priority}
                    </p>
                    <p className="text-sm">
                        <strong className="font-semibold">Category:</strong> {task.category}
                    </p>
                    {task.eisenhowerQuadrant && (
                        <p className="text-sm">
                            <strong className="font-semibold">Eisenhower Quadrant:</strong> {task.eisenhowerQuadrant}
                        </p>
                    )}
                    <div className="flex items-center text-sm">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={handleCheckboxChange}
                            className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
                        />
                        <label className="font-semibold">Completed:</label> {task.completed ? 'Yes' : 'No'}
                    </div>

                    <p className="text-gray-800 font-medium text-lg mt-4">Description:</p>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{task.description || 'No description provided.'}</p>

                    {/* AI Analysis Section */}
                    <div className="mt-6 border-t border-gray-200 pt-4">
                        <h4 className="text-lg font-bold text-blue-700 mb-2">AI Analysis</h4>
                        {loadingAI ? (
                            <div className="flex items-center text-blue-600">
                                <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Generating AI analysis...</span>
                            </div>
                        ) : (
                            <div className="prose max-w-none text-sm text-gray-600">
                                <ReactMarkdown>{aiAnalysis || 'No AI analysis available for this task.'}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-5 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        onClick={handleEditClick}
                        className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                    >
                        <FiEdit3 className="mr-2" /> Edit
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        <FiTrash2 className="mr-2" /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;