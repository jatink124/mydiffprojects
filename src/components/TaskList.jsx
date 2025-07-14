// src/components/TaskList.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import icons
import { FiPlusCircle } from 'react-icons/fi';

// Import your Modal and TaskForm components
import Modal from './Modal';
import TaskForm from './TaskForm';
import TaskDetailModal from './TaskDetailModal';
import TaskCard from './TaskCard'; // Import the TaskCard component

// --- Define your API Base URL here ---
const API_BASE_URL = 'http://localhost:5000/api';
// ---

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
        const parsedData = data ? JSON.parse(data) : {};
        return {
            added: parsedData.added || [],
            updated: parsedData.updated || [],
            deleted: parsedData.deleted || []
        };
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
    const [activeTab, setActiveTab] = useState('All Tasks');
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // State for Modals
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskIdToDelete, setTaskIdToDelete] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedTaskAIAnalysis, setSelectedTaskAIAnalysis] = useState('');
    const [loadingTaskAI, setLoadingTaskAI] = useState(false);

    // State for Add/Edit Task Modal (using TaskForm)
    const [showTaskFormModal, setShowTaskFormModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);

    const [pendingChanges, setPendingChanges] = useState(getPendingChangesFromLocalStorage());

    const categories = ['All Tasks', 'General', 'Web Development', 'Trading', 'Personal', 'Work', 'Study', 'Health'];

    // Helper function to update pending changes
    const addPendingChange = useCallback((type, taskDataOrId) => {
        setPendingChanges(prevChanges => {
            const safePrevChanges = {
                added: prevChanges?.added || [],
                updated: prevChanges?.updated || [],
                deleted: prevChanges?.deleted || [],
            };

            let newChanges = { ...safePrevChanges };

            if (type === 'added') {
                newChanges.added.push(taskDataOrId);
            } else if (type === 'updated') {
                const taskId = taskDataOrId._id;
                const addedIndex = newChanges.added.findIndex(t => t._id === taskId);
                if (addedIndex !== -1) {
                    newChanges.added[addedIndex] = taskDataOrId;
                } else {
                    const updatedIndex = newChanges.updated.findIndex(t => t._id === taskId);
                    if (updatedIndex !== -1) {
                        newChanges.updated[updatedIndex] = taskDataOrId;
                    } else {
                        if (!newChanges.deleted.includes(taskId)) {
                            newChanges.updated.push(taskDataOrId);
                        }
                    }
                }
            } else if (type === 'deleted') {
                const taskId = taskDataOrId;
                newChanges.added = newChanges.added.filter(t => t._id !== taskId);
                newChanges.updated = newChanges.updated.filter(t => t._id !== taskId);
                if (!newChanges.deleted.includes(taskId)) {
                    newChanges.deleted.push(taskId);
                }
            }
            savePendingChangesToLocalStorage(newChanges);
            return newChanges;
        });
    }, []);

    const removePendingChange = useCallback((type, id) => {
        setPendingChanges(prevChanges => {
            let newChanges = { ...prevChanges };
            if (type === 'added') {
                newChanges.added = newChanges.added.filter(task => task._id !== id);
            } else if (type === 'updated') {
                newChanges.updated = newChanges.updated.filter(task => task._id !== id);
            } else if (type === 'deleted') {
                newChanges.deleted = newChanges.deleted.filter(_id => _id !== id);
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
            const response = await axios.get(`${API_BASE_URL}/tasks`);
            const fetchedTasks = response.data;
            setTasks(fetchedTasks);
            saveTasksToLocalStorage(fetchedTasks);
            toast.success('Tasks synced from server!');
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
            setError('Failed to load tasks. Please check your network connection.');
            toast.error('Failed to fetch tasks. Loading local data.');
            setTasks(getTasksFromLocalStorage());
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

        let currentPendingChanges = getPendingChangesFromLocalStorage();
        const { added, updated, deleted } = currentPendingChanges;

        if (added.length === 0 && updated.length === 0 && deleted.length === 0) {
            toast.info('No pending changes to sync.');
            return;
        }

        toast.info('Attempting to sync pending changes...');
        let successfulSync = { added: [], updated: [], deleted: [] };

        try {
            // Process deletions first
            for (const id of deleted) {
                try {
                    await axios.delete(`${API_BASE_URL}/tasks/${id}`);
                    successfulSync.deleted.push(id);
                    setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
                    removePendingChange('deleted', id); // Remove from pending
                } catch (deleteErr) {
                    console.error(`Failed to delete task ${id}:`, deleteErr);
                    toast.error(`Failed to delete task ${id}.`);
                }
            }

            // Process additions
            for (const taskData of added) {
                try {
                    const { _id: tempId, ...rest } = taskData; // Remove temporary _id
                    const response = await axios.post(`${API_BASE_URL}/tasks`, rest);
                    const serverTask = response.data;

                    setTasks(prevTasks => {
                        // Replace the locally added task (with tempId) with the one from the server (with real _id)
                        return prevTasks.map(task => task._id === tempId ? serverTask : task);
                    });
                    successfulSync.added.push(tempId);
                    removePendingChange('added', tempId); // Remove original temp ID from pending
                } catch (addErr) {
                    console.error(`Failed to add task ${taskData.title}:`, addErr);
                    toast.error(`Failed to add task ${taskData.title}.`);
                }
            }

            // Process updates
            for (const taskData of updated) {
                try {
                    await axios.put(`${API_BASE_URL}/tasks/${taskData._id}`, taskData);
                    successfulSync.updated.push(taskData._id);
                    setTasks(prevTasks => prevTasks.map(task => task._id === taskData._id ? taskData : task));
                    removePendingChange('updated', taskData._id); // Remove from pending
                } catch (updateErr) {
                    console.error(`Failed to update task ${taskData.title}:`, updateErr);
                    toast.error(`Failed to update task ${taskData.title}.`);
                }
            }

            const remainingChanges = getPendingChangesFromLocalStorage(); // Re-check after attempts
            if (remainingChanges.added.length === 0 && remainingChanges.updated.length === 0 && remainingChanges.deleted.length === 0) {
                toast.success('All pending changes synced successfully!');
            } else {
                toast.warn('Some changes could not be synced. Check console for details.');
            }
            fetchTasks(); // Re-fetch to ensure data consistency
        } catch (error) {
            console.error('Error during sync process:', error);
            toast.error('An error occurred during sync. Some changes might not have been applied.');
        }
    }, [isOnline, removePendingChange, fetchTasks]);


    // Effect to load tasks on component mount and set up online/offline listeners
    useEffect(() => {
        fetchTasks();

        const handleOnline = () => {
            setIsOnline(true);
            toast.info('You are back online!');
            // Only sync if there are actual pending changes
            if (Object.values(getPendingChangesFromLocalStorage()).flat().length > 0) {
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
    }, [fetchTasks, syncDataWithAPI]);

    // Save tasks to local storage whenever they change (this is for the main task list)
    useEffect(() => {
        saveTasksToLocalStorage(tasks);
    }, [tasks]);

    // --- CRUD Operations Handlers ---

    // Function to add a task
    const addTask = useCallback(async (newTaskData) => {
        if (isOnline) {
            try {
                const response = await axios.post(`${API_BASE_URL}/tasks`, newTaskData);
                const serverTask = response.data;
                setTasks(prevTasks => [...prevTasks, serverTask]);
                toast.success('Task added successfully (online)!');
                return true; // Indicate success
            } catch (error) {
                console.error('Failed to add task online:', error);
                toast.error('Failed to add task online. Saving locally.');
                // Fallback to local storage if API fails
                const taskWithTempId = { ...newTaskData, _id: Date.now().toString() };
                setTasks(prevTasks => [...prevTasks, taskWithTempId]);
                addPendingChange('added', taskWithTempId);
                toast.info('Task added locally (offline mode).');
                return false; // Indicate failure to add online
            }
        } else {
            const taskWithTempId = { ...newTaskData, _id: Date.now().toString() }; // Assign a temporary client-side ID
            setTasks(prevTasks => [...prevTasks, taskWithTempId]);
            addPendingChange('added', taskWithTempId);
            toast.info('Task added locally (offline mode). Syncing soon!');
            return true; // Indicate local success
        }
    }, [isOnline, addPendingChange]);

    // Function to update a task
    const updateTask = useCallback(async (updatedTaskData) => {
        if (isOnline) {
            try {
                const response = await axios.put(`${API_BASE_URL}/tasks/${updatedTaskData._id}`, updatedTaskData);
                const serverTask = response.data;
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task._id === serverTask._id ? serverTask : task
                    )
                );
                toast.success('Task updated successfully (online)!');
                return true; // Indicate success
            } catch (error) {
                console.error('Failed to update task online:', error);
                toast.error('Failed to update task online. Saving locally.');
                // Fallback to local storage if API fails
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task._id === updatedTaskData._id ? updatedTaskData : task
                    )
                );
                addPendingChange('updated', updatedTaskData);
                toast.info('Task updated locally (offline mode).');
                return false; // Indicate failure to update online
            }
        } else {
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task._id === updatedTaskData._id ? updatedTaskData : task
                )
            );
            addPendingChange('updated', updatedTaskData);
            toast.info('Task updated locally (offline mode). Syncing soon!');
            return true; // Indicate local success
        }
    }, [isOnline, addPendingChange]);

    const handleDeleteClick = useCallback((id) => {
        setTaskIdToDelete(id);
        setShowDeleteConfirm(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        setShowDeleteConfirm(false);
        if (!taskIdToDelete) return;

        // Optimistically remove from UI
        setTasks(prevTasks => prevTasks.filter(task => task._id !== taskIdToDelete));
        toast.success('Task deletion initiated. Syncing soon!');

        if (isOnline) {
            try {
                await axios.delete(`${API_BASE_URL}/tasks/${taskIdToDelete}`);
                toast.success('Task deleted successfully from server!');
                // No need to remove from pending if successful, it was never added there in online mode
            } catch (error) {
                console.error('Failed to delete task online:', error);
                toast.error('Failed to delete task online. Queuing for sync.');
                addPendingChange('deleted', taskIdToDelete); // Add to pending if online delete fails
                // Re-add the task to local state if server deletion failed and it wasn't a pending addition
                // This scenario needs careful consideration to avoid UI flicker
                // For simplicity, we'll keep it removed from UI but add to pending for next sync
            }
        } else {
            addPendingChange('deleted', taskIdToDelete);
            toast.info('Task deleted locally. Syncing when online.');
        }
        setTaskIdToDelete(null);
    }, [taskIdToDelete, isOnline, addPendingChange]);

    const handleCancelDelete = useCallback(() => {
        setShowDeleteConfirm(false);
        setTaskIdToDelete(null);
    }, []);

    // Handlers for Modals
    const handleCardClick = useCallback(async (task) => {
        setSelectedTask(task);
        setLoadingTaskAI(true);
        setSelectedTaskAIAnalysis('');
        try {
            const response = await axios.post(`${API_BASE_URL}/ai-task-analysis`, {
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

    // --- Handlers for Add/Edit Task Modal ---
    const handleAddTaskClick = useCallback(() => {
        setTaskToEdit(null);
        setShowTaskFormModal(true);
    }, []);

    const handleEditTask = useCallback((task) => {
        setTaskToEdit(task);
        setShowTaskFormModal(true);
        closeDetailModal();
    }, [closeDetailModal]);

    const handleTaskFormSaveSuccess = useCallback(async (savedTask) => {
        setShowTaskFormModal(false);
        setTaskToEdit(null);
        // The addTask/updateTask functions now handle direct API calls/local storage,
        // so we don't need fetchTasks here IF the operation was successful online.
        // However, fetchTasks provides a full sync, which is safer.
        // For a more refined UX, you'd update state directly with `savedTask` if it came from the server.
        fetchTasks(); // Still good to re-fetch to ensure consistency after any save operation
    }, [fetchTasks]); // Added fetchTasks to dependencies

    const handleTaskFormCancel = useCallback(() => {
        setShowTaskFormModal(false);
        setTaskToEdit(null);
    }, []);
    // --- END MODAL HANDLERS ---

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
                (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

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
                                <option value="dueDateAsc">Due Date (Asc)</option>
                                <option value="dueDateDesc">Due Date (Desc)</option>
                                <option value="priorityHigh">Priority (High to Low)</option>
                                <option value="priorityLow">Priority (Low to High)</option>
                            </select>
                            <svg className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                        </div>

                        {/* Manual Sync/Refresh Buttons */}
                        <div className="flex gap-3 mt-4 sm:mt-0 w-full sm:w-auto justify-center">
                            <button
                                onClick={handleManualRefresh}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors text-sm sm:text-base"
                            >
                                Refresh
                            </button>
                            {/* <button
                                onClick={syncDataWithAPI}
                                className={`flex-1 px-4 py-2 ${Object.values(pendingChanges).flat().length > 0 ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-lg shadow-sm transition-colors text-sm sm:text-base`}
                                disabled={Object.values(pendingChanges).flat().length === 0}
                            >
                                Sync ({Object.values(pendingChanges).flat().length})
                            </button> */}
                        </div>
                    </div>
                </div>

                {/* --- Category Tabs --- */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveTab(category)}
                            className={`px-5 py-2 rounded-full font-medium transition-colors duration-300 text-sm sm:text-base
                                         ${activeTab === category
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* --- Task List Display --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedTasks.length > 0 ? (
                        displayedTasks.map(task => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onCardClick={handleCardClick}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteClick}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-600 text-lg col-span-full py-8">
                            No tasks found matching your criteria.
                        </p>
                    )}
                </div>

                {/* --- Modals --- */}
                <TaskForm
                    isOpen={showTaskFormModal}
                    onClose={handleTaskFormCancel}
                    onSave={taskToEdit ? updateTask : addTask} // Pass correct function based on mode
                    taskToEdit={taskToEdit}
                />

                <TaskDetailModal
                    isOpen={!!selectedTask}
                    onClose={closeDetailModal}
                    task={selectedTask}
                    aiAnalysis={selectedTaskAIAnalysis}
                    loadingAI={loadingTaskAI}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteClick}
                />

                {/* Delete Confirmation Modal */}
                <Modal isOpen={showDeleteConfirm} onClose={handleCancelDelete}>
                    <div className="p-6 bg-white rounded-lg shadow-xl text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-700 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleCancelDelete}
                                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}