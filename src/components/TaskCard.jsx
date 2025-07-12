// src/components/TaskCard.jsx
import React from 'react';
import { FiEdit3, FiTrash2 } from 'react-icons/fi'; // Import icons

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'P1 - Critical': return 'bg-red-100 text-red-800';
        case 'P2 - High': return 'bg-orange-100 text-orange-800';
        case 'P3 - Medium': return 'bg-yellow-100 text-yellow-800';
        case 'P4 - Low': return 'bg-green-100 text-green-800';
        case 'P5 - Very Low': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getCategoryTagColor = (category) => {
    switch (category) {
        case 'Web Development': return 'bg-blue-100 text-blue-800';
        case 'Trading': return 'bg-green-100 text-green-800';
        case 'Personal': return 'bg-purple-100 text-purple-800';
        case 'Work': return 'bg-indigo-100 text-indigo-800';
        case 'Study': return 'bg-yellow-100 text-yellow-800';
        case 'Health': return 'bg-pink-100 text-pink-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getTaskCardStyles = (task) => {
    let cardBg = 'bg-white';
    let titleText = 'text-gray-800';
    let dueDateText = 'text-gray-600';

    if (task.completed) {
        cardBg = 'bg-green-50';
        titleText = 'text-green-700 line-through';
        dueDateText = 'text-green-500';
    } else if (new Date(task.dueDate) < new Date()) {
        cardBg = 'bg-red-50';
        titleText = 'text-red-700';
        dueDateText = 'text-red-500 font-bold';
    }

    return { cardBg, titleText, dueDateText };
};

const TaskCard = ({ task, onCardClick, onEdit, onDelete, toggleComplete }) => {
    const { cardBg, titleText, dueDateText } = getTaskCardStyles(task);

    return (
        <div
            className={`flex flex-col rounded-lg shadow-md p-4 transition-all duration-200 ease-in-out
            hover:shadow-lg hover:scale-[1.01] border ${task.completed ? 'border-green-200' : 'border-gray-200'} ${cardBg}`}
        >
            <div className="flex justify-between items-start mb-2">
                <h3
                    className={`text-lg font-semibold cursor-pointer ${titleText} break-words pr-4`}
                    onClick={() => onCardClick(task)}
                >
                    {task.title}
                </h3>
                {/* Checkbox for completion toggle */}
                {/* <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded cursor-pointer mt-1 flex-shrink-0"
                /> */}
            </div>

            <p className={`text-sm ${dueDateText} mb-2`}>
                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
            </p>

            <div className="flex flex-wrap gap-2 mb-3 text-xs">
                {task.priority && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                    </span>
                )}
                {task.category && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryTagColor(task.category)}`}>
                        {task.category}
                    </span>
                )}
                {task.eisenhowerQuadrant && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {task.eisenhowerQuadrant}
                    </span>
                )}
            </div>

            <p className="text-gray-700 text-sm mb-4 line-clamp-2">{task.description || 'No description.'}</p>

            <div className="flex mt-auto pt-3 border-t border-gray-200 justify-end space-x-2">
                <button
                    onClick={() => onEdit(task)}
                    className="p-2 rounded-full text-gray-500 hover:bg-yellow-100 hover:text-yellow-600 transition-colors"
                    title="Edit Task"
                >
                    <FiEdit3 className="text-lg" />
                </button>
                <button
                    onClick={() => onDelete(task._id)}
                    className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Delete Task"
                >
                    <FiTrash2 className="text-lg" />
                </button>
            </div>
        </div>
    );
};

export default TaskCard;