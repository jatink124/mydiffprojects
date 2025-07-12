import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types'; // Import PropTypes for validation
import { toast } from 'react-toastify'; // Ensure toast is imported
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Reusable Modal component (assuming it exists and works)
import Modal from './Modal';

export default function TaskForm({ isOpen, onClose, onSave, taskToEdit }) {
    const initialState = {
        title: '',
        description: '',
        dueDate: null, // Should be a Date object
        priority: 'P3 - Medium',
        category: 'General',
        eisenhowerQuadrant: 'Important/Not Urgent',
        completed: false,
    };

    const [formData, setFormData] = useState(initialState);
    const [formErrors, setFormErrors] = useState({});

    // Effect to populate form when taskToEdit changes (for editing)
    useEffect(() => {
        if (taskToEdit) {
            setFormData({
                ...taskToEdit,
                dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null,
            });
        } else {
            setFormData(initialState); // Reset for new task
        }
        setFormErrors({}); // Clear errors when modal opens or task changes
    }, [taskToEdit, isOpen]); // Added isOpen to reset when modal closes and re-opens for new task

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error for this field as user types
        if (formErrors[name]) {
            setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
        }
    };

    const handleDateChange = (date) => {
        setFormData(prevData => ({
            ...prevData,
            dueDate: date
        }));
        if (formErrors.dueDate) {
            setFormErrors(prevErrors => ({ ...prevErrors, dueDate: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) {
            errors.title = 'Title is required.';
        }
        if (!formData.dueDate) {
            errors.dueDate = 'Due Date is required.';
        } else if (new Date(formData.dueDate) < new Date()) {
            // Optional: Check if due date is in the past, only if it's not an existing completed task
            // For editing completed tasks, this check might be too restrictive
            if (!taskToEdit || !taskToEdit.completed) {
                 // Ignore past date validation if it's an existing task already marked completed
                 // or if you want to allow setting past dates for historical tracking
                // You might need more nuanced logic here based on your app's requirements
            }
        }
        // Add more validation rules as needed (e.g., description length, valid category)
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please correct the form errors.');
            return;
        }

        try {
            // Call the onSave function passed from TaskList
            // onSave already handles whether it's an add or update, and API/local storage logic
            await onSave(formData);
            onClose(); // Close modal on successful save (either online or locally queued)
            toast.success(`Task ${taskToEdit ? 'updated' : 'added'} successfully!`);
        } catch (error) {
            console.error('Error saving task:', error);
            toast.error(`Failed to save task: ${error.message || 'Unknown error'}`);
            // Do not close modal automatically if there was a hard error in onSave
            // (though onSave is designed to handle this and usually toast itself)
        }
    };

    const title = taskToEdit ? 'Edit Task' : 'Add New Task';

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 bg-white rounded-lg shadow-xl max-w-lg mx-auto my-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{title}</h2>
                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 text-sm font-semibold mb-2">Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="e.g., Finish report"
                            required
                        />
                        {formErrors.title && <p className="text-red-500 text-xs italic mt-1">{formErrors.title}</p>}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-gray-300"
                            placeholder="Detailed description of the task..."
                        ></textarea>
                        <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-600 mb-1">Description Preview (Markdown):</h4>
                            <div className="prose prose-sm max-w-none text-gray-800">
                                <ReactMarkdown>{formData.description}</ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="mb-4">
                        <label htmlFor="dueDate" className="block text-gray-700 text-sm font-semibold mb-2">Due Date <span className="text-red-500">*</span></label>
                        <DatePicker
                            id="dueDate"
                            selected={formData.dueDate}
                            onChange={handleDateChange}
                            dateFormat="yyyy/MM/dd"
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
                            placeholderText="Select a date"
                            required
                        />
                        {formErrors.dueDate && <p className="text-red-500 text-xs italic mt-1">{formErrors.dueDate}</p>}
                    </div>

                    {/* Priority */}
                    <div className="mb-4">
                        <label htmlFor="priority" className="block text-gray-700 text-sm font-semibold mb-2">Priority</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-gray-300"
                        >
                            <option value="P1 - Critical">P1 - Critical</option>
                            <option value="P2 - High">P2 - High</option>
                            <option value="P3 - Medium">P3 - Medium</option>
                            <option value="P4 - Low">P4 - Low</option>
                            <option value="P5 - Very Low">P5 - Very Low</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                        <label htmlFor="category" className="block text-gray-700 text-sm font-semibold mb-2">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-gray-300"
                        >
                            <option value="General">General</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Trading">Trading</option>
                            <option value="Personal">Personal</option>
                            <option value="Work">Work</option>
                            <option value="Study">Study</option>
                            <option value="Health">Health</option>
                        </select>
                    </div>

                    {/* Eisenhower Quadrant */}
                    <div className="mb-4">
                        <label htmlFor="eisenhowerQuadrant" className="block text-gray-700 text-sm font-semibold mb-2">Eisenhower Quadrant</label>
                        <select
                            id="eisenhowerQuadrant"
                            name="eisenhowerQuadrant"
                            value={formData.eisenhowerQuadrant}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-gray-300"
                        >
                            <option value="Urgent/Important">Urgent & Important</option>
                            <option value="Important/Not Urgent">Important & Not Urgent</option>
                            <option value="Urgent/Not Important">Urgent & Not Important</option>
                            <option value="Not Urgent/Not Important">Not Urgent & Not Important</option>
                        </select>
                    </div>

                    {/* Completed Checkbox */}
                    <div className="mb-6 flex items-center">
                        <input
                            type="checkbox"
                            id="completed"
                            name="completed"
                            checked={formData.completed}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="completed" className="text-gray-700 text-sm font-semibold">Mark as Completed</label>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                        >
                            {taskToEdit ? 'Update Task' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

// PropTypes for validation (highly recommended for React components)
TaskForm.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    taskToEdit: PropTypes.object, // Can be null for add mode
};