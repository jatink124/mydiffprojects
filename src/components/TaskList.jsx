import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import icons (assuming FiPlusCircle is from react-icons/fi)
import { FiPlusCircle } from 'react-icons/fi'; // Add this import

// Import your Modal and TaskForm components
import Modal from './Modal';
import TaskForm from './TaskForm';
import TaskDetailModal from './TaskDetailModal';

// Helper functions for Local Storage
const LOCAL_STORAGE_KEY = 'taskListData';
const LOCAL_STORAGE_PENDING_CHANGES_KEY = 'taskListPendingChanges';

const getTasksFromLocalStorage = () => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error parsing tasks from local storage:", error);
        return [];
    }
};

const saveTasksToLocalStorage = (tasks) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error("Error saving tasks to local storage:", error);
    }
};

const getPendingChangesFromLocalStorage = () => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_PENDING_CHANGES_KEY);
        return data ? JSON.parse(data) : { added: [], updated: [], deleted: [] };
    } catch (error) {
        console.error("Error parsing pending changes from local storage:", error);
        return { added: [], updated: [], deleted: [] };
    }
};

const savePendingChangesToLocalStorage = (changes) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_PENDING_CHANGES_KEY, JSON.stringify(changes));
    } catch (error) {
        console.error("Error saving pending changes to local storage:", error);
    }
};

export default function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [eisenhowerFilter, setEisenhowerFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('dueDateAsc');
    const [activeTab, setActiveTab] = useState('All Tasks'); // Default active tab
    const [categoryInsights, setCategoryInsights] = useState({});
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // State for Modals
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskIdToDelete, setTaskIdToDelete] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null); // For TaskDetailModal
    const [selectedTaskAIAnalysis, setSelectedTaskAIAnalysis] = useState('');
    const [loadingTaskAI, setLoadingTaskAI] = useState(false);

    // State for Add/Edit Task Modal (using TaskForm)
    const [showTaskFormModal, setShowTaskFormModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null); // The task object being edited

    const [pendingChanges, setPendingChanges] = useState(getPendingChangesFromLocalStorage());

    const categories = ['All Tasks', 'General', 'Web Development', 'Trading', 'Personal', 'Work', 'Study', 'Health'];

    // Helper function to update pending changes
    const addPendingChange = useCallback((type, taskData) => {
        setPendingChanges(prevChanges => {
            let newChanges = { ...prevChanges };

            if (type === 'added') {
                newChanges.added.push(taskData);
            } else if (type === 'updated') {
                // If an item is in 'added' and now updated, update it there.
                // Otherwise, add/update in 'updated' list.
                const addedIndex = newChanges.added.findIndex(t => t._id === taskData._id);
                if (addedIndex !== -1) {
                    newChanges.added[addedIndex] = taskData;
                } else {
                    const updatedIndex = newChanges.updated.findIndex(t => t._id === taskData._id);
                    if (updatedIndex !== -1) {
                        newChanges.updated[updatedIndex] = taskData;
                    } else {
                        newChanges.updated.push(taskData);
                    }
                }
            } else if (type === 'deleted') {
                // Remove from 'added' if it was pending add
                newChanges.added = newChanges.added.filter(t => t._id !== taskData);
                // Remove from 'updated' if it was pending update
                newChanges.updated = newChanges.updated.filter(t => t._id !== taskData);
                // Add to 'deleted'
                if (!newChanges.deleted.includes(taskData)) {
                    newChanges.deleted.push(taskData);
                }
            }
            savePendingChangesToLocalStorage(newChanges);
            return newChanges;
        });
    }, []);

    // Fetch tasks from API
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('https://mydiffprojects.onrender.com/api/tasks');
            const fetchedTasks = response.data;
            setTasks(fetchedTasks);
            saveTasksToLocalStorage(fetchedTasks);
            toast.success('Tasks synced from server!');
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
            setError('Failed to load tasks. Please check your network connection.');
            toast.error('Failed to fetch tasks. Loading local data.');
            setTasks(getTasksFromLocalStorage()); // Load from local storage on fetch error
        } finally {
            setLoading(false);
        }
    }, []);

    // Sync data with API
    const syncDataWithAPI = useCallback(async () => {
        if (!isOnline) {
            toast.warn('You are offline. Cannot sync data.');
            return;
        }

        const { added, updated, deleted } = pendingChanges;
        if (added.length === 0 && updated.length === 0 && deleted.length === 0) {
            toast.info('No pending changes to sync.');
            return;
        }

        try {
            // Process deletions first
            for (const id of deleted) {
                await axios.delete(`https://mydiffprojects.onrender.com/api/tasks/${id}`);
                setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
            }

            // Process additions
            for (const taskData of added) {
                const { _id, ...rest } = taskData; // Remove temporary _id
                const response = await axios.post('https://mydiffprojects.onrender.com/api/tasks', rest);
                setTasks(prevTasks => {
                    // Replace the locally added task with the one from the server (which has a real _id)
                    return prevTasks.map(task => task._id === _id ? response.data : task);
                });
            }

            // Process updates
            for (const taskData of updated) {
                await axios.put(`https://mydiffprojects.onrender.com/api/tasks/${taskData._id}`, taskData);
                setTasks(prevTasks => prevTasks.map(task => task._id === taskData._id ? taskData : task));
            }

            // Clear pending changes after successful sync
            setPendingChanges({ added: [], updated: [], deleted: [] });
            savePendingChangesToLocalStorage({ added: [], updated: [], deleted: [] });
            toast.success('All pending changes synced successfully!');
            fetchTasks(); // Re-fetch to ensure data consistency
        } catch (error) {
            console.error('Error syncing data with API:', error);
            toast.error('Failed to sync some changes. Please try again.');
        }
    }, [pendingChanges, isOnline, fetchTasks]);


    // Effect to load tasks on component mount and set up online/offline listeners
    useEffect(() => {
        fetchTasks();

        const handleOnline = () => {
            setIsOnline(true);
            toast.info('You are back online!');
            // Optionally, trigger sync immediately when back online
            if (Object.values(pendingChanges).flat().length > 0) {
                syncDataWithAPI();
            }
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast.warn('You are offline. Changes will be saved locally.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [fetchTasks, syncDataWithAPI, pendingChanges]); // Add pendingChanges to dependencies

    // Save tasks to local storage whenever they change
    useEffect(() => {
        saveTasksToLocalStorage(tasks);
    }, [tasks]);

    // Handle network status changes
    useEffect(() => {
        setIsOnline(navigator.onLine);
    }, []);

    // Fetch AI insights for a given category
    const fetchCategoryInsights = useCallback(async (category) => {
        if (category === 'All Tasks' || categoryInsights[category]) {
            setLoadingInsights(false);
            return;
        }

        setLoadingInsights(true);
        try {
            const response = await axios.post('https://mydiffprojects.onrender.com/api/ai-insights', { category });
            setCategoryInsights(prev => ({ ...prev, [category]: response.data.insight }));
        } catch (error) {
            console.error(`Error fetching insights for ${category}:`, error);
            setCategoryInsights(prev => ({ ...prev, [category]: 'Failed to load insights for this category.' }));
            toast.error(`Failed to load AI insights for ${category}.`);
        } finally {
            setLoadingInsights(false);
        }
    }, [categoryInsights]);

    // Effect to fetch insights when the active tab changes
    useEffect(() => {
        fetchCategoryInsights(activeTab);
    }, [activeTab, fetchCategoryInsights]);


    // --- CRUD Operations Handlers ---

    // Function to add a task (could be called from TaskForm after adding)
    const addTask = useCallback((newTaskData) => {
        // Assign a temporary client-side ID if it's a new task, for local tracking before API sync
        const taskWithTempId = { ...newTaskData, _id: Date.now().toString() };
        setTasks(prevTasks => [...prevTasks, taskWithTempId]);
        addPendingChange('added', taskWithTempId);
        toast.success('Task added locally. Syncing soon!');
    }, [addPendingChange]);

    // Function to update a task (could be called from TaskForm after updating)
    const updateTask = useCallback((updatedTaskData) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task._id === updatedTaskData._id ? updatedTaskData : task
            )
        );
        addPendingChange('updated', updatedTaskData);
        toast.success('Task updated locally. Syncing soon!');
    }, [addPendingChange]);


    const handleDeleteClick = useCallback((id) => {
        setTaskIdToDelete(id);
        setShowDeleteConfirm(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        setShowDeleteConfirm(false);
        if (!taskIdToDelete) return;

        setTasks(prevTasks => prevTasks.filter(task => task._id !== taskIdToDelete));
        addPendingChange('deleted', taskIdToDelete);
        toast.success('Task deleted locally. Syncing soon!');
        setTaskIdToDelete(null); // Clear the ID after deletion or cancellation
    }, [taskIdToDelete, addPendingChange]);

    const handleCancelDelete = useCallback(() => {
        setShowDeleteConfirm(false);
        setTaskIdToDelete(null);
    }, []);

    const toggleComplete = useCallback((task) => {
        const updatedTask = { ...task, completed: !task.completed };
        setTasks(prevTasks =>
            prevTasks.map(t => (t._id === task._id ? updatedTask : t))
        );
        addPendingChange('updated', updatedTask);
        toast.info(`Task "${task.title}" marked as ${updatedTask.completed ? 'completed' : 'pending'}.`);
    }, [addPendingChange]);

    // Handlers for Modals
    const handleCardClick = useCallback(async (task) => {
        setSelectedTask(task);
        setLoadingTaskAI(true);
        setSelectedTaskAIAnalysis(''); // Clear previous analysis
        try {
            const response = await axios.post('https://mydiffprojects.onrender.com/api/ai-task-analysis', {
                taskTitle: task.title,
                taskDescription: task.description,
                taskDueDate: task.dueDate,
                taskPriority: task.priority,
                taskCategory: task.category,
                taskEisenhowerQuadrant: task.eisenhowerQuadrant,
                taskCompleted: task.completed,
            });
            setSelectedTaskAIAnalysis(response.data.analysis);
        } catch (error) {
            console.error("Error fetching AI task analysis:", error);
            setSelectedTaskAIAnalysis('Failed to load AI analysis for this task.');
            toast.error('Failed to load AI analysis for this task.');
        } finally {
            setLoadingTaskAI(false);
        }
    }, []);

    const closeDetailModal = useCallback(() => {
        setSelectedTask(null);
        setSelectedTaskAIAnalysis('');
    }, []);

    // --- NEW: Handlers for Add/Edit Task Modal ---
    const handleAddTaskClick = useCallback(() => {
        setTaskToEdit(null); // No task selected means it's an add operation
        setShowTaskFormModal(true);
    }, []);

    const handleEditTask = useCallback((task) => {
        setTaskToEdit(task); // Set the task to be edited
        setShowTaskFormModal(true);
        closeDetailModal(); // Close detail modal if open
    }, [closeDetailModal]);

    const handleTaskFormSaveSuccess = useCallback(() => {
        setShowTaskFormModal(false);
        setTaskToEdit(null);
        fetchTasks(); // Re-fetch all tasks to update the list from server after save
    }, [fetchTasks]);

    const handleTaskFormCancel = useCallback(() => {
        setShowTaskFormModal(false);
        setTaskToEdit(null);
    }, []);
    // --- END NEW MODAL HANDLERS ---

    const handleLoadFromLocalStorage = () => {
        const localTasks = getTasksFromLocalStorage();
        setTasks(localTasks);
        toast.info('Tasks loaded from local storage!');
    };

    const handleManualRefresh = () => {
        fetchTasks();
        toast.info('Manually refreshing tasks...');
    };

    // Filtering and Sorting Logic
    const getPriorityValue = (priority) => {
        switch (priority) {
            case 'P1 - Critical': return 1;
            case 'P2 - High': return 2;
            case 'P3 - Medium': return 3;
            case 'P4 - Low': return 4;
            case 'P5 - Very Low': return 5;
            default: return 99;
        }
    };

    const sortedAndFilteredTasks = [...tasks]
        .filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'completed' && task.completed) ||
                (statusFilter === 'pending' && !task.completed);

            const matchesEisenhower = eisenhowerFilter === 'all' ||
                task.eisenhowerQuadrant === eisenhowerFilter;

            const matchesCategory = activeTab === 'All Tasks' || task.category === activeTab;

            return matchesSearch && matchesStatus && matchesEisenhower && matchesCategory;
        })
        .sort((a, b) => {
            if (sortOrder === 'dueDateAsc') {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            if (sortOrder === 'dueDateDesc') {
                return new Date(b.dueDate) - new Date(a.dueDate);
            }
            if (sortOrder === 'priorityHigh') {
                return getPriorityValue(a.priority) - getPriorityValue(b.priority);
            }
            if (sortOrder === 'priorityLow') {
                return getPriorityValue(b.priority) - getPriorityValue(a.priority);
            }
            return 0;
        });

    // Styles for Task Cards
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'P1 - Critical': return 'bg-red-50 text-red-700 ring-red-200';
            case 'P2 - High': return 'bg-orange-50 text-orange-700 ring-orange-200';
            case 'P3 - Medium': return 'bg-yellow-50 text-yellow-700 ring-yellow-200';
            case 'P4 - Low': return 'bg-green-50 text-green-700 ring-green-200';
            case 'P5 - Very Low': return 'bg-blue-50 text-blue-700 ring-blue-200';
            default: return 'bg-gray-50 text-gray-700 ring-gray-200';
        }
    };

    const getCategoryTagColor = (category) => {
        switch (category) {
            case 'Web Development': return 'bg-blue-50 text-blue-700 ring-blue-200';
            case 'Trading': return 'bg-green-50 text-green-700 ring-green-200';
            case 'Personal': return 'bg-purple-50 text-purple-700 ring-purple-200';
            case 'Work': return 'bg-indigo-50 text-indigo-700 ring-indigo-200';
            case 'Study': return 'bg-yellow-50 text-yellow-700 ring-yellow-200';
            case 'Health': return 'bg-pink-50 text-pink-700 ring-pink-200';
            default: return 'bg-gray-50 text-gray-700 ring-gray-200';
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

    const displayedTasks = activeTab === 'All Tasks'
        ? sortedAndFilteredTasks
        : sortedAndFilteredTasks.filter(task => task.category === activeTab);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-lg text-gray-700">Loading tasks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <p className="text-red-600 text-xl font-semibold mb-4">{error}</p>
                <button
                    onClick={fetchTasks}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                    Try to reconnect
                </button>
                <button
                    onClick={handleLoadFromLocalStorage}
                    className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors"
                >
                    Load from Local Storage
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 sm:mb-8 text-center">
                    My Task Dashboard 🚀
                </h1>

                {/* Add New Task Button (Always visible) */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={handleAddTaskClick}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg
                                   hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-[1.03] active:scale-[0.97]"
                    >
                        <FiPlusCircle className="text-xl" /> Add New Task
                    </button>
                </div>

                {/* --- Filters and Actions Bar --- */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Filters & Actions</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-wrap">
                        {/* Search Input */}
                        <div className="relative flex-grow sm:flex-grow-0 sm:w-1/2 md:w-auto min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base pr-8 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                            />
                            <svg className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>

                        {/* Status Filter */}
                        <div className="relative flex-grow min-w-[120px] sm:min-w-[130px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
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

                        {/* Get Data from Local Storage Button */}
                        <button
                            onClick={handleLoadFromLocalStorage}
                            className="p-2.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center gap-1 min-w-[40px] sm:min-w-[unset]"
                            title="Load from Local Storage"
                        >
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V6.5A2.5 2.5 0 0 0 17.5 4h-11A2.5 2.5 0 0 0 4 6.5v13z"></path></svg>
                            <span className="hidden sm:inline">Local Data</span>
                        </button>

                        {/* Sync Data with API Button */}
                        {Object.values(pendingChanges).flat().length > 0 && (
                            <button
                                onClick={syncDataWithAPI}
                                className={`p-2.5 rounded-lg ${isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'} text-white transition-colors duration-200 flex items-center justify-center gap-1 min-w-[40px] sm:min-w-[unset]`}
                                title={isOnline ? "Sync Pending Changes" : "Offline - Cannot Sync"}
                                disabled={!isOnline}
                            >
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10m5.2-3.2L12 2l-5.2 6.8M21 12c0 4.4-3.6 8-8 8s-8-3.6-8-8c0-2.4 1.1-4.6 2.8-6M3 12h18"></path></svg>
                                <span className="hidden sm:inline">Sync ({Object.values(pendingChanges).flat().length})</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* --- Category Tabs --- */}
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

                {/* --- AI Insights for Category --- */}
                {activeTab && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-bold text-blue-800 mb-2">
                            AI Insights for "{activeTab}" Category
                        </h3>
                        {loadingInsights ? (
                            <div className="flex items-center text-blue-700">
                                <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Generating category insights...</span>
                            </div>
                        ) : (
                            <div className="prose max-w-none">
                                <ReactMarkdown>{categoryInsights[activeTab] || 'No insights available for this category.'}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                )}

                {/* --- Task List Display --- */}
                {displayedTasks.length === 0 ? (
                    <p className="text-center text-gray-500 text-lg py-10">No tasks found matching your criteria.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedTasks.map(task => {
                            const { cardBg, titleText, dueDateText } = getTaskCardStyles(task);
                            return (
                                <div
                                    key={task._id}
                                    className={`relative ${cardBg} p-5 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between h-auto transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg group`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3
                                            className={`text-xl font-semibold cursor-pointer ${titleText} break-words pr-2`}
                                            onClick={() => handleCardClick(task)}
                                        >
                                            {task.title}
                                        </h3>
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => toggleComplete(task)}
                                            className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                            title={task.completed ? "Mark as Pending" : "Mark as Complete"}
                                        />
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3 hidden md:block">{task.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-4 hidden md:flex">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${getCategoryTagColor(task.category)}`}>
                                            {task.category}
                                        </span>
                                        {task.eisenhowerQuadrant && (
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-200">
                                                {task.eisenhowerQuadrant}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm ${dueDateText} font-medium mb-4 hidden md:block`}>
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </p>
                                    <div className="flex space-x-2 hidden md:flex">
                                        <button
                                            onClick={() => handleEditTask(task)} 
                                            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(task._id)}
                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- Delete Confirmation Modal --- */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                        <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full text-center">
                            <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h3>
                            <p className="text-gray-700 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
                            <div className="flex justify-around gap-4">
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={handleCancelDelete}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Task Detail Modal (for mobile/on-click) --- */}
                <TaskDetailModal
                    task={selectedTask}
                    aiAnalysis={selectedTaskAIAnalysis}
                    loadingAI={loadingTaskAI}
                    onClose={closeDetailModal}
                    onEditTask={handleEditTask} // Pass handleEditTask to the detail modal
                    onDeleteTask={handleDeleteClick}
                    toggleComplete={toggleComplete}
                />

                {/* --- Task Form Modal (for Add/Edit) --- */}
                <Modal isOpen={showTaskFormModal} onClose={handleTaskFormCancel}>
                    <TaskForm
                        selectedTask={taskToEdit} // Pass the task to edit, or null for new
                        onSaveSuccess={addTask} // Changed to addTask for new tasks
                        onUpdateSuccess={updateTask} // New prop for update success
                        onCancel={handleTaskFormCancel}
                    />
                </Modal>
            </div>
        </div>
    );
}