// components/TaskForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCalendar, FiSave, FiXCircle, FiPlusCircle, FiTag, FiClock } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function TaskForm({ selectedTask, onSaveSuccess, onCancel }) {
    const categories = ['General', 'Web Development', 'Trading', 'Personal', 'Work', 'Study', 'Health'];
    const priorities = ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low', 'P5 - Very Low'];
    const eisenhowerQuadrants = ['Urgent/Important', 'Important/Not Urgent', 'Urgent/Not Important', 'Not Urgent/Not Important'];

    const [task, setTask] = useState(selectedTask || {
        title: '',
        description: '',
        dueDate: null,
        priority: 'P3 - Medium',
        completed: false,
        category: 'General',
        eisenhowerQuadrant: 'Important/Not Urgent'
    });
    const [isEditing, setIsEditing] = useState(!!selectedTask);

    useEffect(() => {
        setTask(selectedTask ? {
            ...selectedTask,
            dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : null
        } : {
            title: '',
            description: '',
            dueDate: null,
            priority: 'P3 - Medium',
            completed: false,
            category: 'General',
            eisenhowerQuadrant: 'Important/Not Urgent'
        });
        setIsEditing(!!selectedTask);
    }, [selectedTask]);

    const handleChange = e => {
        setTask({ ...task, [e.target.name]: e.target.value });
    };

    const handleDateChange = date => {
        setTask({ ...task, dueDate: date });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!task.title.trim()) {
            toast.error('Task title is required!');
            return;
        }
        if (!task.dueDate) {
            toast.error('Due Date is required!');
            return;
        }

        try {
            if (task._id) {
                await axios.put(`https://mydiffprojects.onrender.com/api/tasks/${task._id}`, task);
                toast.success('Task updated successfully!');
            } else {
                await axios.post('https://mydiffprojects.onrender.com/api/tasks', task);
                toast.success('Task added successfully!');
            }
            setTask({ title: '', description: '', dueDate: null, priority: 'P3 - Medium', completed: false, category: 'General', eisenhowerQuadrant: 'Important/Not Urgent' });
            setIsEditing(false);
            if (onSaveSuccess) onSaveSuccess(); // Notify parent on successful save
        } catch (err) {
            console.error('Error saving task:', err);
            toast.error('Failed to save task.');
        }
    };

    const handleClearForm = () => {
        setTask({ title: '', description: '', dueDate: null, priority: 'P3 - Medium', completed: false, category: 'General', eisenhowerQuadrant: 'Important/Not Urgent' });
        setIsEditing(false);
        if (onCancel) onCancel(); // Notify parent on cancel
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-xl
                        p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12
                        space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7 xl:space-y-8
                        mb-8 sm:mb-10 md:mb-12 lg:mb-14 xl:mb-16
                        border border-gray-100 transform transition-all duration-300 hover:scale-[1.005]">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl
                            font-extrabold text-gray-800 flex items-center
                            gap-2 sm:gap-3 md:gap-4
                            border-b pb-3 sm:pb-4 md:pb-5
                            mb-3 sm:mb-4 md:mb-5 border-gray-200">
                {isEditing ? <FiSave className="text-blue-500 text-lg sm:text-xl md:text-2xl lg:text-3xl" /> : <FiPlusCircle className="text-green-500 text-lg sm:text-xl md:text-2xl lg:text-3xl" />}
                {isEditing ? 'Update Your Task' : 'Add a New Task'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
                    <input
                        id="title"
                        name="title"
                        value={task.title}
                        onChange={handleChange}
                        placeholder="e.g., Complete React project refactor"
                        className="w-full p-2.5 sm:p-3 md:p-3.5 lg:p-4
                                    border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent
                                    text-base sm:text-lg md:text-xl placeholder-gray-400 transition-all duration-200"
                        maxLength="100"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={task.description}
                        onChange={handleChange}
                        placeholder="Provide a detailed explanation of the task..."
                        className="w-full p-2.5 sm:p-3 md:p-3.5 lg:p-4
                                    border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent
                                    min-h-[80px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[150px]
                                    text-sm sm:text-base md:text-lg placeholder-gray-400 transition-all duration-200"
                        rows="4"
                        maxLength="500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                    <div className="relative">
                        <label htmlFor="dueDate" className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
                        <DatePicker
                            id="dueDate"
                            selected={task.dueDate}
                            onChange={handleDateChange}
                            dateFormat="yyyy/MM/dd"
                            placeholderText="Select due date"
                            className="w-full p-2.5 sm:p-3 md:p-3.5 lg:p-4
                                        border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent
                                        text-base sm:text-lg md:text-xl pr-9 sm:pr-10 md:pr-11 lg:pr-12
                                        cursor-pointer transition-all duration-200"
                            minDate={new Date()}
                            isClearable
                            required
                        />
                        <FiCalendar className="absolute right-3 top-1/2 mt-0.5 sm:mt-1 md:mt-2 -translate-y-1/2
                                             text-gray-500 pointer-events-none text-base sm:text-lg md:text-xl" />
                    </div>

                    <div>
                        <label htmlFor="category-select" className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1">Category</label>
                        <div className="relative">
                            <select
                                id="category-select"
                                name="category"
                                value={task.category}
                                onChange={handleChange}
                                className="w-full p-2.5 sm:p-3 md:p-3.5 lg:p-4
                                            border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent
                                            text-sm sm:text-base md:text-lg appearance-none pr-9 sm:pr-10 md:pr-11 lg:pr-12
                                            transition-all duration-200 cursor-pointer"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <FiTag className="absolute right-3 top-1/2 mt-0.5 sm:mt-1 md:mt-2 -translate-y-1/2
                                               text-gray-500 pointer-events-none text-base sm:text-lg md:text-xl" />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="priority-select" className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1">Priority Level</label>
                    <div className="relative">
                        <select
                            id="priority-select"
                            name="priority"
                            value={task.priority}
                            onChange={handleChange}
                            className="w-full p-2.5 sm:p-3 md:p-3.5 lg:p-4
                                        border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent
                                        text-sm sm:text-base md:text-lg appearance-none pr-9 sm:pr-10 md:pr-11 lg:pr-12
                                        transition-all duration-200 cursor-pointer"
                        >
                            {priorities.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <FiClock className="absolute right-3 top-1/2 mt-0.5 sm:mt-1 md:mt-2 -translate-y-1/2
                                             text-gray-500 pointer-events-none text-base sm:text-lg md:text-xl" />
                    </div>
                </div>

                <div>
                    <label htmlFor="eisenhower-select" className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1">Eisenhower Quadrant</label>
                    <div className="relative">
                        <select
                            id="eisenhower-select"
                            name="eisenhowerQuadrant"
                            value={task.eisenhowerQuadrant}
                            onChange={handleChange}
                            className="w-full p-2.5 sm:p-3 md:p-3.5 lg:p-4
                                        border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent
                                        text-sm sm:text-base md:text-lg appearance-none pr-9 sm:pr-10 md:pr-11 lg:pr-12
                                        transition-all duration-200 cursor-pointer"
                        >
                            {eisenhowerQuadrants.map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                        <FiTag className="absolute right-3 top-1/2 mt-0.5 sm:mt-1 md:mt-2 -translate-y-1/2
                                         text-gray-500 pointer-events-none text-base sm:text-lg md:text-xl" />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end
                                 space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-5 lg:space-x-6
                                 pt-3 sm:pt-4 md:pt-5">
                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleClearForm}
                            className="w-full sm:w-auto flex items-center justify-center
                                        gap-2 px-5 py-2.5 sm:px-6 sm:py-3 md:px-7 md:py-3.5 lg:px-8 lg:py-4
                                        rounded-lg text-gray-700 bg-gray-100 border border-gray-300
                                        hover:bg-gray-200 transition-colors duration-200 shadow-sm
                                        font-medium text-base sm:text-lg"
                        >
                            <FiXCircle className="text-lg sm:text-xl" /> Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="w-full sm:w-auto flex items-center justify-center
                                    gap-2 px-7 py-2.5 sm:px-8 sm:py-3 md:px-9 md:py-3.5 lg:px-10 lg:py-4
                                    rounded-lg bg-blue-600 text-white font-semibold shadow-md
                                    hover:bg-blue-700 transition-colors duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                                    text-base sm:text-lg"
                    >
                        {isEditing ? <FiSave className="text-lg sm:text-xl" /> : <FiPlusCircle className="text-lg sm:text-xl" />}
                        {isEditing ? 'Update Task' : 'Add Task'}
                    </button>
                </div>
            </form>
        </div>
    );
}