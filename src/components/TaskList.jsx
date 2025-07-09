// TaskList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // Install: npm install react-markdown

export default function TaskList({ onEditTask, refreshTrigger }) {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('dueDateAsc');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [eisenhowerFilter, setEisenhowerFilter] = useState('all');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDeleteId, setTaskToDeleteId] = useState(null);
    const [activeTab, setActiveTab] = useState('All');
    const [selectedTask, setSelectedTask] = useState(null);
    const [manualRefreshKey, setManualRefreshKey] = useState(0);

    // --- New AI-related states (unchanged, just context) ---
    const [categoryInsights, setCategoryInsights] = useState({});
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [selectedTaskAIAnalysis, setSelectedTaskAIAnalysis] = useState('');
    const [loadingTaskAI, setLoadingTaskAI] = useState(false);
    // --- End New AI-related states ---

    const categories = ['All', 'General', 'Web Development', 'Trading', 'Personal', 'Work', 'Study', 'Health'];

    // Base URL for your backend API
    const API_BASE_URL = 'https://mydiffprojects.onrender.com/api'; // Ensure this matches your deployed backend URL
   const API_BASE = 'http://localhost:5000/api'; // Ensure this matches your deployed backend URL
    const fetchTasks = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (activeTab && activeTab !== 'All') {
                queryParams.append('category', activeTab);
            }
            const url = `${API_BASE_URL}/tasks?${queryParams.toString()}`;
            const res = await axios.get(url);
            setTasks(res.data);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
            // Optionally, show a user-friendly error message
        }
    };

    // Function to fetch AI insights for a given category using Gemini
    const fetchAIInsights = useCallback(async (category) => {
        if (category === 'All') {
            setCategoryInsights(prev => ({ ...prev, [category]: 'Please select a specific task category above to get AI insights.' }));
            return;
        }

        setLoadingInsights(true);
        try {
            const tasksForPrompt = tasks.filter(task => task.category === category);
            const taskSummaries = tasksForPrompt.map(task =>
                `- Title: ${task.title}\n  Description: ${task.description || 'N/A'}\n  Due: ${new Date(task.dueDate).toLocaleDateString()}, Priority: ${task.priority}`
            ).join('\n\n');

            const prompt = `Analyze the following tasks in the "${category}" category. Provide a brief summary, identify any key themes or recurring challenges, and suggest a strategic approach for managing them effectively. Be concise and focus on actionable advice, structured clearly with bullet points or numbered lists.
            \n---
            Tasks:\n${taskSummaries || 'No specific tasks found in this category. Suggest general strategies for this type of category.'}`;

            // Call your backend endpoint for Gemini analysis
            const res = await axios.post(`${API_BASE}/gemini/gemini-analysis`, { prompt });
            setCategoryInsights(prev => ({ ...prev, [category]: res.data }));
        } catch (err) {
            console.error(`Failed to fetch Gemini insights for ${category}:`, err);
            setCategoryInsights(prev => ({ ...prev, [category]: 'Failed to load Gemini insights. Please try again or check server connection.' }));
        } finally {
            setLoadingInsights(false);
        }
    }, [tasks]);

    // Function to fetch AI strategy for a selected task using Gemini
    const fetchTaskAIStrategy = async (task) => {
        setLoadingTaskAI(true);
        setSelectedTaskAIAnalysis('');

        try {
            const prompt = `Generate a detailed step-by-step plan or strategic approach to effectively complete the following task. Focus on practical steps, potential challenges, and optimal workflow. Provide the plan as a clear numbered list or bullet points.

            \n---
            Task Details:
            Title: "${task.title}"
            Description: "${task.description || 'No description provided.'}"
            Due Date: "${new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}"
            Priority: "${task.priority}"
            Category: "${task.category || 'General'}"
            Eisenhower Quadrant: "${task.eisenhowerQuadrant || 'Not Classified'}"
            \n---
            Strategic Plan:`;

            // Call your backend endpoint for Gemini analysis
            const res = await axios.post(`${API_BASE}/gemini/gemini-analysis`, { prompt });
            setSelectedTaskAIAnalysis(res.data);
        } catch (err) {
            console.error('Failed to fetch Gemini strategy for task:', err);
            setSelectedTaskAIAnalysis('Failed to generate Gemini strategy. Please try again or check server connection.');
        } finally {
            setLoadingTaskAI(false);
        }
    };


    useEffect(() => {
        fetchTasks();
    }, [filter, sortOrder, searchTerm, activeTab, eisenhowerFilter, refreshTrigger, manualRefreshKey]);

    useEffect(() => {
        if (tasks.length > 0 || activeTab === 'All') {
             fetchAIInsights(activeTab);
        } else if (activeTab !== 'All') {
            setCategoryInsights(prev => ({ ...prev, [activeTab]: 'No tasks in this category to analyze. Showing general advice.' }));
            fetchAIInsights(activeTab);
        }
    }, [activeTab, tasks, fetchAIInsights]);


    const handleManualRefresh = () => {
        setManualRefreshKey(prevKey => prevKey + 1);
    };

    const toggleComplete = async (task) => {
        try {
            await axios.put(`${API_BASE_URL}/tasks/${task._id}`, {
                ...task, completed: !task.completed
            });
            console.log(`Task marked as ${task.completed ? 'pending' : 'completed'}!`);
            fetchTasks();
            if (selectedTask && selectedTask._id === task._id) {
                setSelectedTask(prev => ({ ...prev, completed: !prev.completed }));
            }
        } catch (err) {
            console.error('Failed to update task status:', err);
        }
    };

    const handleDeleteClick = (id) => {
        setTaskToDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/tasks/${taskToDeleteId}`);
            console.log('Task deleted successfully!');
            fetchTasks();
            setShowDeleteConfirm(false);
            setTaskToDeleteId(null);
            setSelectedTask(null);
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setTaskToDeleteId(null);
    };

    const handleCardClick = (task) => {
        setSelectedTask(task);
        fetchTaskAIStrategy(task); // Trigger Gemini analysis for the selected task
    };

    const closeDetailModal = () => {
        setSelectedTask(null);
        setSelectedTaskAIAnalysis('');
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
            case 'General': return 'bg-gray-50 text-gray-700 ring-gray-100';
            default: return 'bg-gray-50 text-gray-700 ring-gray-100';
        }
    };

    const getTaskCardStyles = (task) => {
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < now && !task.completed;
        const isDueSoon = !task.completed && dueDate >= now && (dueDate.getTime() - now.getTime()) < (3 * 24 * 60 * 60 * 1000);

        let classes = {
            cardBg: 'bg-white',
            titleText: 'text-gray-900',
            dueDateText: 'text-gray-800'
        };

        if (task.completed) {
            classes.cardBg = 'bg-green-50';
            classes.titleText = 'text-gray-500 line-through';
        } else if (isOverdue) {
            classes.cardBg = 'bg-red-100';
            classes.titleText = 'text-red-800 font-bold';
            classes.dueDateText = 'text-red-700 font-bold';
        } else if (task.eisenhowerQuadrant === 'Urgent/Important' || task.priority === 'P1 - Critical' || task.priority === 'P2 - High') {
            classes.cardBg = 'bg-yellow-50';
            classes.titleText = 'text-orange-800 font-semibold';
        } else if (isDueSoon) {
            classes.cardBg = 'bg-blue-50';
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
            t.description?.toLowerCase().includes(searchTerm.toLowerCase());
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

                    {/* Manual Refresh Button */}
                    <button
                        onClick={handleManualRefresh}
                        className="p-2.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-1 min-w-[40px] sm:min-w-[unset]"
                        title="Refresh Tasks"
                    >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6"></path><path d="M2.5 22v-6h6"></path><path d="M21.5 12c0 3.9-3.1 7-7 7H7c-3.9 0-7-3.1-7-7s3.1-7 7-7h7c1.7 0 3.4.6 4.7 1.7"></path></svg>
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 md:gap-3 mb-6 border-b border-gray-200 pb-2 overflow-x-auto justify-center md:justify-start">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveTab(category)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap
                            ${activeTab === category
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                            }
                        `}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* AI Insights for Category */}
            {/* {activeTab && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-bold text-blue-800 mb-2">
                        AI Insights for "{activeTab}" Category
                    </h3>
                    {loadingInsights ? (
                        <div className="flex items-center text-blue-700">
                            <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Generating category insights...</span>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none text-blue-900">
                             <ReactMarkdown>{categoryInsights[activeTab] || 'No AI insights available. Select a category.'}</ReactMarkdown>
                        </div>
                    )}
                </div>
            )} */}


            {displayedTasks.length === 0 ? (
                <div className="text-center py-12 md:py-16 text-gray-500 text-lg md:text-xl bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
                    <svg className="text-4xl md:text-5xl mb-3 md:mb-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p className="font-semibold">No tasks found!</p>
                    <p className="text-sm">Try adjusting your filters or adding a new task above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {displayedTasks.map(task => {
                        const cardStyles = getTaskCardStyles(task);
                        return (
                            <div
                                key={task._id}
                                className={`${cardStyles.cardBg} border border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-between
                                    hover:shadow-lg transition-shadow duration-200 cursor-pointer relative group`}
                                onClick={() => handleCardClick(task)}
                            >
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 rounded-lg"></div>

                                <div>
                                    <h3 className={`${cardStyles.titleText} font-bold text-lg mb-2`}>
                                        {task.title}
                                    </h3>
                                    {task.description && (
                                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2 mb-3 text-xs font-medium">
                                        <span className={`px-2 py-0.5 rounded-full ring-1 ${getPriorityColor(task.priority)}`}>
                                            {task.priority.split(' - ')[0]}
                                        </span>
                                        {task.category && (
                                            <span className={`px-2 py-0.5 rounded-full ring-1 ${getCategoryTagColor(task.category)}`}>
                                                {task.category}
                                            </span>
                                        )}
                                        {task.eisenhowerQuadrant && (
                                            <span className={`px-2 py-0.5 rounded-full ring-1 bg-indigo-50 text-indigo-700 ring-indigo-100`}>
                                                {task.eisenhowerQuadrant.split('/')[0].slice(0, 1)}. {task.eisenhowerQuadrant.split('/')[1].slice(0, 1)}.
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span className="font-semibold">Due:</span>{' '}
                                        <span className={`${cardStyles.dueDateText}`}>
                                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleComplete(task); }}
                                        className={`p-2 rounded-full transition-colors duration-200 transform hover:scale-110 active:scale-95
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
                                        onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200 transform hover:scale-110 active:scale-95"
                                        title="Edit Task"
                                    >
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(task._id); }}
                                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200 transform hover:scale-110 active:scale-95"
                                        title="Delete Task"
                                    >
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md md:max-w-lg lg:max-w-xl transform scale-100 opacity-100 animate-zoom-in relative">
                        <button
                            onClick={closeDetailModal}
                            className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                            title="Close"
                        >
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4 break-words">{selectedTask.title}</h3>

                        {selectedTask.description && (
                            <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                                <p className="font-semibold text-gray-700 mb-1">Description:</p>
                                <p className="text-gray-800 whitespace-pre-wrap">{selectedTask.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <div>
                                <p className="font-semibold text-gray-700 mb-1">Due Date:</p>
                                <p className="text-gray-800 text-base">
                                    {new Date(selectedTask.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700 mb-1">Priority:</p>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ring-1 ${getPriorityColor(selectedTask.priority)}`}>
                                    {selectedTask.priority}
                                </span>
                            </div>
                            {selectedTask.category && (
                                <div>
                                    <p className="font-semibold text-gray-700 mb-1">Category:</p>
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ring-1 ${getCategoryTagColor(selectedTask.category)}`}>
                                        {selectedTask.category}
                                    </span>
                                </div>
                            )}
                            {selectedTask.eisenhowerQuadrant && (
                                <div>
                                    <p className="font-semibold text-gray-700 mb-1">Eisenhower Quadrant:</p>
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ring-1 bg-indigo-50 text-indigo-700 ring-indigo-100`}>
                                        {selectedTask.eisenhowerQuadrant}
                                    </span>
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-gray-700 mb-1">Status:</p>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${selectedTask.completed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {selectedTask.completed ? 'Completed' : 'Pending'}
                                </span>
                            </div>
                        </div>

                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-bold text-blue-800 mb-2">AI Strategic Plan:</h4>
                            {loadingTaskAI ? (
                                <div className="flex items-center text-blue-700">
                                    <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span>Generating strategic plan...</span>
                                </div>
                            ) : (
                                <div className="prose prose-sm max-w-none text-blue-900">
                                    <ReactMarkdown>{selectedTaskAIAnalysis || 'No AI strategic plan available for this task.'}</ReactMarkdown>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-5">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEditTask(selectedTask); closeDetailModal(); }}
                                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                Edit Task
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(selectedTask._id); closeDetailModal(); }}
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                Delete Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform scale-100 opacity-100 animate-zoom-in">
                        <h3 className="text-xl font-bold text-red-800 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-700 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
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