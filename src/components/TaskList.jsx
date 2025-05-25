import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function TaskList({ onEditTask, refreshTrigger }) {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('dueDateAsc');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [eisenhowerFilter, setEisenhowerFilter] = useState('all');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDeleteId, setTaskToDeleteId] = useState(null);

    const categories = ['All', 'General', 'Web Development', 'Trading', 'Personal', 'Work', 'Study', 'Health'];

    const fetchTasks = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (categoryFilter && categoryFilter !== 'all') {
                queryParams.append('category', categoryFilter);
            }
            const url = `https://mydiffprojects.onrender.com/api/tasks?${queryParams.toString()}`;
            const res = await axios.get(url);
            setTasks(res.data);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
            console.error('Failed to load tasks.');
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [filter, sortOrder, searchTerm, categoryFilter, eisenhowerFilter, refreshTrigger]);

    const toggleComplete = async (task) => {
        try {
            await axios.put(`https://mydiffprojects.onrender.com/api/tasks/${task._id}`, {
                ...task, completed: !task.completed
            });
            console.log(`Task marked as ${task.completed ? 'pending' : 'completed'}!`);
            fetchTasks();
        } catch (err) {
            console.error('Failed to update task status:', err);
            console.error('Failed to update task status.');
        }
    };

    const handleDeleteClick = (id) => {
        setTaskToDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`https://mydiffprojects.onrender.com/api/tasks/${taskToDeleteId}`);
            console.log('Task deleted successfully!');
            fetchTasks();
            setShowDeleteConfirm(false);
            setTaskToDeleteId(null);
        } catch (err) {
            console.error('Failed to delete task:', err);
            console.error('Failed to delete task.');
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setTaskToDeleteId(null);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'P1 - Critical': return 'bg-red-200 text-red-800 ring-red-300';
            case 'P2 - High': return 'bg-orange-100 text-orange-700 ring-orange-200';
            case 'P3 - Medium': return 'bg-yellow-100 text-yellow-700 ring-yellow-200';
            case 'P4 - Low': return 'bg-green-100 text-green-700 ring-green-200';
            case 'P5 - Very Low': return 'bg-blue-100 text-blue-700 ring-blue-200';
            default: return 'bg-gray-100 text-gray-700 ring-gray-200';
        }
    };

    const getCategoryTagColor = (category) => {
        switch (category) {
            case 'Web Development': return 'bg-blue-50 text-blue-700 ring-blue-100';
            case 'Trading': return 'bg-purple-50 text-purple-700 ring-purple-100';
            case 'Personal': return 'bg-pink-50 text-pink-700 ring-pink-100';
            case 'Work': return 'bg-indigo-50 text-indigo-700 ring-indigo-100';
            case 'Study': return 'bg-orange-50 text-orange-700 ring-orange-100';
            case 'Health': return 'bg-teal-50 text-teal-700 ring-teal-100';
            default: return 'bg-gray-50 text-gray-700 ring-gray-100';
        }
    };

    const getTaskRowStyles = (task) => {
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < now && !task.completed;
        const isDueSoon = !task.completed && dueDate >= now && (dueDate.getTime() - now.getTime()) < (3 * 24 * 60 * 60 * 1000);

        let classes = {
            rowBg: 'bg-white',
            titleText: 'text-gray-900',
            dueDateText: 'text-gray-800'
        };

        if (task.completed) {
            classes.rowBg = 'bg-green-50';
            classes.titleText = 'text-gray-500 line-through';
        } else if (isOverdue) {
            classes.rowBg = 'bg-red-100';
            classes.titleText = 'text-red-800 font-bold';
            classes.dueDateText = 'text-red-700 font-bold';
        } else if (task.eisenhowerQuadrant === 'Urgent/Important' || task.priority === 'P1 - Critical' || task.priority === 'P2 - High') {
            classes.rowBg = 'bg-yellow-50';
            classes.titleText = 'text-orange-800 font-semibold';
        } else if (isDueSoon) {
            classes.rowBg = 'bg-blue-50';
            classes.titleText = 'text-blue-800 font-semibold';
        }
        return classes;
    };

    const sortTasks = (taskList) => {
        return [...taskList].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            const getUrgencyScore = (task) => {
                let score = 0;
                const now = new Date();
                const dueDate = new Date(task.dueDate);

                if (dueDate < now && !task.completed) {
                    score += 1000;
                }

                if (task.eisenhowerQuadrant === 'Urgent/Important') {
                    score += 500;
                } else if (task.eisenhowerQuadrant === 'Urgent/Not Important') {
                    score += 200;
                } else if (task.eisenhowerQuadrant === 'Important/Not Urgent') {
                    score += 100;
                }

                const priorityMapping = {
                    'P1 - Critical': 50, 'P2 - High': 40, 'P3 - Medium': 30, 'P4 - Low': 20, 'P5 - Very Low': 10,
                };
                score += priorityMapping[task.priority] || 0;

                const diffTime = dueDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 1 && diffDays >= 0 && !task.completed) {
                    score += 80;
                } else if (diffDays > 1 && diffDays <= 3 && !task.completed) {
                    score += 60;
                }

                return score;
            };

            const urgencyA = getUrgencyScore(a);
            const urgencyB = getUrgencyScore(b);

            if (urgencyA !== urgencyB) {
                return urgencyB - urgencyA;
            }

            const priorityOrder = {
                'P1 - Critical': 5, 'P2 - High': 4, 'P3 - Medium': 3, 'P4 - Low': 2, 'P5 - Very Low': 1,
            };

            if (sortOrder === 'dueDateAsc') {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            if (sortOrder === 'dueDateDesc') {
                return new Date(b.dueDate) - new Date(a.dueDate);
            }
            if (sortOrder === 'priorityHigh') {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            if (sortOrder === 'priorityLow') {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return 0;
        });
    };

    const clientFilteredTasks = tasks.filter(t => {
        const matchesStatus = (filter === 'completed' && t.completed) ||
            (filter === 'pending' && !t.completed) ||
            filter === 'all';
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEisenhower = (eisenhowerFilter === 'all' || t.eisenhowerQuadrant === eisenhowerFilter);

        return matchesStatus && matchesSearch && matchesEisenhower;
    });

    const displayedTasks = sortTasks(clientFilteredTasks);

    return (
        <div className="bg-white shadow-2xl rounded-xl p-4 md:p-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 gap-3 md:gap-5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 text-center sm:text-left mb-4 sm:mb-0">Your Tasks Overview</h2>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
                    {/* Search Bar */}
                    <div className="relative flex-grow min-w-[120px] sm:min-w-[150px]">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-9 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>

                    {/* Category Filter */}
                    <div className="relative flex-grow min-w-[110px] sm:min-w-[120px]">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base appearance-none pr-8 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat === 'All' ? 'all' : cat}>{cat}</option>
                            ))}
                        </select>
                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 12.586a2 2 0 0 0 2.828 0l3.172-3.172a2 2 0 0 0 0-2.828L15.414 4.586a2 2 0 0 0-2.828 0L9.414 7.758a2 2 0 0 0 0 2.828L12.586 12.586z"></path><path d="M19 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7"></path></svg>
                    </div>

                    {/* Completion Status Filter */}
                    <div className="relative flex-grow min-w-[110px] sm:min-w-[120px]">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base appearance-none pr-8 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    </div>

                    {/* Eisenhower Matrix Filter */}
                    <div className="relative flex-grow min-w-[140px] sm:min-w-[150px]">
                        <select
                            value={eisenhowerFilter}
                            onChange={(e) => setEisenhowerFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base appearance-none pr-8 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer"
                        >
                            <option value="all">All Quadrants</option>
                            <option value="Urgent/Important">Urgent & Important</option>
                            <option value="Important/Not Urgent">Important & Not Urgent</option>
                            <option value="Urgent/Not Important">Urgent & Not Important</option>
                            <option value="Not Urgent/Not Important">Not Urgent & Not Important</option>
                        </select>
                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 12.586a2 2 0 0 0 2.828 0l3.172-3.172a2 2 0 0 0 0-2.828L15.414 4.586a2 2 0 0 0-2.828 0L9.414 7.758a2 2 0 0 0 0 2.828L12.586 12.586z"></path><path d="M19 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7"></path></svg>
                    </div>

                    {/* Sort Order */}
                    <div className="relative flex-grow min-w-[110px] sm:min-w-[120px]">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base appearance-none pr-8 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer"
                        >
                            <option value="dueDateAsc">Due Date (Soonest)</option>
                            <option value="dueDateDesc">Due Date (Latest)</option>
                            <option value="priorityHigh">Priority (Highest first)</option>
                            <option value="priorityLow">Priority (Lowest first)</option>
                        </select>
                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                </div>
            </div>

            {displayedTasks.length === 0 ? (
                <div className="text-center py-12 md:py-16 text-gray-500 text-lg md:text-xl bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
                    <svg className="text-4xl md:text-5xl mb-3 md:mb-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p className="font-semibold">No tasks found!</p>
                    <p className="text-sm">Try adjusting your filters or adding a new task above.</p>
                </div>
            ) : (
                // Table View for larger screens, stacked for smaller screens
                <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eisenhower</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedTasks.map(task => {
                                const rowStyles = getTaskRowStyles(task);
                                return (
                                    <tr key={task._id} className={`${rowStyles.rowBg} transition-colors duration-200 hover:bg-gray-100`}>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${rowStyles.titleText}`}>
                                            {task.title}
                                        </td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${rowStyles.dueDateText}`}>
                                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ring-1 ${getPriorityColor(task.priority)}`}>
                                                {task.priority.split(' - ')[0]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {task.category && (
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ring-1 ${getCategoryTagColor(task.category)}`}>
                                                    {task.category}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {task.eisenhowerQuadrant ? task.eisenhowerQuadrant.split('/')[0].slice(0, 1) + '. ' + task.eisenhowerQuadrant.split('/')[1].slice(0, 1) + '.' : '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => toggleComplete(task)}
                                                    className={`p-1 rounded-full transition-colors duration-200 transform hover:scale-110 active:scale-95
                                                    ${task.completed ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                                                    title={task.completed ? 'Mark as Pending' : 'Mark as Completed'}
                                                >
                                                    {task.completed ? (
                                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => onEditTask(task)}
                                                    className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200 transform hover:scale-110 active:scale-95"
                                                    title="Edit Task"
                                                >
                                                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(task._id)}
                                                    className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200 transform hover:scale-110 active:scale-95"
                                                    title="Delete Task"
                                                >
                                                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Stacked Cards for Mobile View */}
                    <div className="md:hidden flex flex-col gap-3 p-2">
                        {displayedTasks.map(task => {
                            const rowStyles = getTaskRowStyles(task);
                            return (
                                <div key={task._id} className={`${rowStyles.rowBg} border rounded-lg shadow-sm p-3`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`${rowStyles.titleText} font-bold text-base`}>
                                            {task.title}
                                        </h3>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => toggleComplete(task)}
                                                className={`p-1 rounded-full transition-colors duration-200
                                                ${task.completed ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}
                                                title={task.completed ? 'Mark as Pending' : 'Mark as Completed'}
                                            >
                                                {task.completed ? (
                                                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                                ) : (
                                                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => onEditTask(task)}
                                                className="p-1 rounded-full bg-blue-100 text-blue-600"
                                                title="Edit Task"
                                            >
                                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(task._id)}
                                                className="p-1 rounded-full bg-red-100 text-red-600"
                                                title="Delete Task"
                                            >
                                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                        <div>
                                            <span className="font-semibold">Due Date:</span>{' '}
                                            <span className={`${rowStyles.dueDateText}`}>
                                                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Priority:</span>{' '}
                                            <span className={`px-1 py-0.5 rounded-full ring-1 ${getPriorityColor(task.priority)}`}>
                                                {task.priority.split(' - ')[0]}
                                            </span>
                                        </div>
                                        {task.category && (
                                            <div>
                                                <span className="font-semibold">Category:</span>{' '}
                                                <span className={`px-1 py-0.5 rounded-full ring-1 ${getCategoryTagColor(task.category)}`}>
                                                    {task.category}
                                                </span>
                                            </div>
                                        )}
                                        {task.eisenhowerQuadrant && (
                                            <div>
                                                <span className="font-semibold">Quadrant:</span>{' '}
                                                <span className={`px-1 py-0.5 rounded-full ring-1 bg-indigo-50 text-indigo-700 ring-indigo-100`}>
                                                    {task.eisenhowerQuadrant.split('/')[0].slice(0, 1)}. {task.eisenhowerQuadrant.split('/')[1].slice(0, 1)}.
                                                </span>
                                            </div>
                                        )}
                                        {task.description && (
                                            <div className="col-span-2 text-gray-700 mt-1">
                                                <span className="font-semibold">Desc:</span> {task.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm md:max-w-md text-center transform transition-all duration-300 scale-100 opacity-100">
                        <svg className="text-5xl md:text-6xl mx-auto mb-4 text-red-500" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">Confirm Deletion</h3>
                        <p className="text-gray-600 text-sm md:text-base mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
                        <div className="flex justify-center space-x-3 md:space-x-4">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 md:px-6 md:py-3 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors duration-200 text-sm md:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 md:px-6 md:py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200 text-sm md:text-base"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}