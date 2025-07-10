import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // Install: npm install react-markdown

// Helper functions for Local Storage
const LOCAL_STORAGE_KEY = 'taskListData';
const LOCAL_STORAGE_PENDING_CHANGES_KEY = 'taskListPendingChanges';

const getTasksFromLocalStorage = () => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error reading from local storage", error);
        return [];
    }
};

const saveTasksToLocalStorage = (tasks) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error("Error saving to local storage", error);
    }
};

const getPendingChangesFromLocalStorage = () => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_PENDING_CHANGES_KEY);
        return data ? JSON.parse(data) : { new: [], updated: [], deleted: [] };
    } catch (error) {
        console.error("Error reading pending changes from local storage", error);
        return { new: [], updated: [], deleted: [] };
    }
};

const savePendingChangesToLocalStorage = (changes) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_PENDING_CHANGES_KEY, JSON.stringify(changes));
    } catch (error) {
        console.error("Error saving pending changes to local storage", error);
    }
};

// --- TaskDetailModal Component ---
// This component will display all task details when a task title is clicked on mobile
const TaskDetailModal = ({ task, aiAnalysis, loadingAI, onClose, onEditTask, onDeleteTask, toggleComplete }) => {
    if (!task) return null; // Don't render if no task is selected

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

    return (
        // Modal Overlay - fixed position, covers whole screen, dark background
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4" onClick={onClose}>
            {/* Modal Content - white background, rounded corners, max width, scrollable */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800">{task.title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                {/* Modal Body */}
                <div className="p-5 space-y-4 text-gray-700">
                    <div>
                        <p className="font-semibold text-gray-900">Description:</p>
                        <p>{task.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ${getCategoryTagColor(task.category)}`}>
                            {task.category}
                        </span>
                        {task.eisenhowerQuadrant && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 ring-indigo-200">
                                {task.eisenhowerQuadrant}
                            </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${task.completed ? 'bg-green-100 text-green-700 ring-green-200' : 'bg-red-100 text-red-700 ring-red-200'}`}>
                            {task.completed ? 'Completed' : 'Pending'}
                        </span>
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleComplete(task)} // Use passed toggleComplete
                            className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer ml-auto"
                            title={task.completed ? "Mark as Pending" : "Mark as Complete"}
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">Due Date:</p>
                        <p>{new Date(task.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {task.completedAt && (
                        <div>
                            <p className="font-semibold text-gray-900">Completed At:</p>
                            <p>{new Date(task.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    )}

                    <div className="mt-4 border-t border-gray-200 pt-4">
                        <h4 className="text-lg font-bold text-gray-800 mb-2">AI Strategy:</h4>
                        {loadingAI ? (
                            <div className="flex items-center text-blue-700">
                                <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Generating AI strategy...</span>
                            </div>
                        ) : (
                            aiAnalysis ? (
                                <div className="prose max-w-none">
                                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-gray-500">No AI strategy available.</p>
                            )
                        )}
                    </div>

                    <div className="flex space-x-2 mt-5 border-t border-gray-200 pt-5">
                        <button
                            onClick={() => { onEditTask(task); onClose(); }} // Pass task to onEditTask and close modal
                            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => { onDeleteTask(task._id); onClose(); }} // Pass id to onDeleteTask and close modal
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- End TaskDetailModal Component ---


export default function TaskList({ onEditTask, refreshTrigger }) {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('dueDateAsc');
    const [searchTerm, setSearchTerm] = useState('');
    const [eisenhowerFilter, setEisenhowerFilter] = useState('all');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDeleteId, setTaskToDeleteId] = useState(null);
    const [activeTab, setActiveTab] = useState('All');
    const [selectedTask, setSelectedTask] = useState(null); // State to hold the task selected for modal view
    const [manualRefreshKey, setManualRefreshKey] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingChanges, setPendingChanges] = useState(getPendingChangesFromLocalStorage());

    // --- New AI-related states ---
    const [categoryInsights, setCategoryInsights] = useState({});
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [selectedTaskAIAnalysis, setSelectedTaskAIAnalysis] = useState(''); // AI analysis for the selected task
    const [loadingTaskAI, setLoadingTaskAI] = useState(false); // Loading state for single task AI analysis
    // --- End New AI-related states ---

    const categories = ['All', 'General', 'Web Development', 'Trading', 'Personal', 'Work', 'Study', 'Health'];

    // Base URL for your backend API
    const API_BASE_URL = 'https://mydiffprojects.onrender.com/api'; // Ensure this matches your deployed backend URL

    // --- Data Fetching Logic ---
    const fetchTasks = async (useLocalStorageOnly = false) => {
        setIsOnline(navigator.onLine); // Check online status before fetching
        if (useLocalStorageOnly || !isOnline) {
            console.log("Fetching tasks from local storage...");
            setTasks(getTasksFromLocalStorage());
            return;
        }

        try {
            const queryParams = new URLSearchParams();
            if (activeTab && activeTab !== 'All') {
                queryParams.append('category', activeTab);
            }
            const url = `${API_BASE_URL}/tasks?${queryParams.toString()}`;
            const res = await axios.get(url);
            setTasks(res.data);
            saveTasksToLocalStorage(res.data); // Save fetched data to local storage
            console.log("Tasks fetched from API and saved to local storage.");
        } catch (err) {
            console.error('Failed to fetch tasks from API, loading from local storage:', err);
            setTasks(getTasksFromLocalStorage()); // Fallback to local storage
            // Optionally, show a user-friendly error message
        }
    };

    // Function to fetch AI insights for a given category using Gemini (assuming this is backend call)
    const fetchAIInsights = useCallback(async (category) => {
        if (category === 'All') {
            setCategoryInsights(prev => ({ ...prev, [category]: 'Please select a specific task category above to get AI insights.' }));
            return;
        }

        setLoadingInsights(true);
        try {
            const tasksForPrompt = tasks.filter(task => task.category === category);
            const taskSummaries = tasksForPrompt.map(task =>
                `- Title: ${task.title}\n Description: ${task.description || 'N/A'}\n Due: ${new Date(task.dueDate).toLocaleDateString()}, Priority: ${task.priority}`
            ).join('\n\n');

            const prompt = `Analyze the following tasks in the "${category}" category. Provide a brief summary, identify any key themes or recurring challenges, and suggest a strategic approach for managing them effectively. Be concise and focus on actionable advice, structured clearly with bullet points or numbered lists.
            \n---
            Tasks:\n${taskSummaries || 'No specific tasks found in this category. Suggest general strategies for this type of category.'}`;

            // --- Uncomment and use your backend endpoint for Gemini analysis when ready ---
            // const res = await axios.post(`${API_BASE_URL}/gemini/gemini-analysis`, { prompt });
            // setCategoryInsights(prev => ({ ...prev, [category]: res.data }));
            setCategoryInsights(prev => ({ ...prev, [category]: `AI analysis for ${category} (simulated): Focusing on ${tasksForPrompt.length} tasks. Consider prioritizing "Urgent" items.` })); // Simulated response
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
        setSelectedTaskAIAnalysis(''); // Clear previous analysis

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

            // --- Uncomment and use your backend endpoint for Gemini analysis when ready ---
            // const res = await axios.post(`${API_BASE_URL}/gemini/gemini-analysis`, { prompt });
            // setSelectedTaskAIAnalysis(res.data);
            setSelectedTaskAIAnalysis(`Simulated AI strategy for "${task.title}":\n\n1. Break down into smaller steps.\n2. Dedicate focused time slots.\n3. Eliminate distractions. `); // Simulated response
        } catch (err) {
            console.error('Failed to fetch Gemini strategy for task:', err);
            setSelectedTaskAIAnalysis('Failed to generate Gemini strategy. Please try again or check server connection.');
        } finally {
            setLoadingTaskAI(false);
        }
    };

    // --- Effects for Data Loading and Syncing ---
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [filter, sortOrder, searchTerm, activeTab, eisenhowerFilter, refreshTrigger, manualRefreshKey, isOnline]); // Added isOnline to trigger refetch when connectivity changes

    useEffect(() => {
        if (tasks.length > 0 || activeTab === 'All') {
             fetchAIInsights(activeTab);
        } else if (activeTab !== 'All') {
            setCategoryInsights(prev => ({ ...prev, [activeTab]: 'No tasks in this category to analyze. Showing general advice.' }));
            fetchAIInsights(activeTab);
        }
    }, [activeTab, tasks, fetchAIInsights]);

    // --- Offline Sync Logic ---
    const addPendingChange = (type, task) => {
        setPendingChanges(prev => {
            const newChanges = { ...prev };
            // Remove from other categories if already present to avoid duplicates/conflicts
            newChanges.new = newChanges.new.filter(t => t._id !== task._id);
            newChanges.updated = newChanges.updated.filter(t => t._id !== task._id);
            newChanges.deleted = newChanges.deleted.filter(id => id !== task._id); // Ensure no old delete entry exists

            if (type === 'new') {
                newChanges.new.push(task);
            } else if (type === 'updated') {
                // If it was originally a new task (offline created), keep it in 'new'. Otherwise, add to 'updated'.
                if (!prev.new.some(t => t._id === task._id)) {
                    newChanges.updated.push(task);
                }
            } else if (type === 'deleted') {
                newChanges.deleted.push(task._id);
            }
            savePendingChangesToLocalStorage(newChanges);
            return newChanges;
        });
    };

    const clearPendingChanges = (type, id) => {
        setPendingChanges(prev => {
            const newChanges = { ...prev };
            if (type === 'new') {
                newChanges.new = newChanges.new.filter(task => task._id !== id);
            } else if (type === 'updated') {
                newChanges.updated = newChanges.updated.filter(task => task._id !== id);
            } else if (type === 'deleted') {
                newChanges.deleted = newChanges.deleted.filter(_id => _id !== id);
            }
            savePendingChangesToLocalStorage(newChanges);
            return newChanges;
        });
    };

    const syncDataWithAPI = async () => {
        if (!isOnline) {
            alert('You are currently offline. Cannot sync data.');
            return;
        }

        console.log('Attempting to sync data with API...');
        let syncSuccess = true;

        // Process deletions first
        for (const taskId of pendingChanges.deleted) {
            try {
                await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
                clearPendingChanges('deleted', taskId);
                console.log(`Synced deleted task: ${taskId}`);
            } catch (err) {
                console.error(`Failed to sync deletion for task ${taskId}:`, err);
                syncSuccess = false;
            }
        }

        // Process new tasks
        for (const newTask of pendingChanges.new) {
            try {
                // Remove the temporary _id for new tasks if your backend generates IDs
                // Assuming your backend will assign a new _id upon creation
                const { _id, ...taskData } = newTask;
                await axios.post(`${API_BASE_URL}/tasks`, taskData);
                clearPendingChanges('new', _id); // Clear using the temporary _id
                console.log(`Synced new task: ${newTask.title}`);
            } catch (err) {
                console.error(`Failed to sync new task ${newTask.title}:`, err);
                syncSuccess = false;
            }
        }

        // Process updated tasks
        for (const updatedTask of pendingChanges.updated) {
            try {
                await axios.put(`${API_BASE_URL}/tasks/${updatedTask._id}`, updatedTask);
                clearPendingChanges('updated', updatedTask._id);
                console.log(`Synced updated task: ${updatedTask.title}`);
            } catch (err) {
                console.error(`Failed to sync update for task ${updatedTask.title}:`, err);
                syncSuccess = false;
            }
        }

        if (syncSuccess) {
            alert('Data synchronized successfully!');
            fetchTasks(); // Re-fetch all tasks from API to get the latest state
        } else {
            alert('Synchronization complete, but some items failed to sync. Please check console for details.');
        }
    };

    // --- Event Handlers ---
    const handleManualRefresh = () => {
        setManualRefreshKey(prevKey => prevKey + 1);
        fetchTasks(); // Explicitly fetch from API on manual refresh
    };

    const handleLoadFromLocalStorage = () => {
        fetchTasks(true); // Load only from local storage
        alert('Tasks loaded from local storage!');
    };

    const toggleComplete = async (task) => {
        const updatedTask = { ...task, completed: !task.completed };
        // Optimistically update UI
        setTasks(prevTasks => prevTasks.map(t => t._id === task._id ? updatedTask : t));
        if (selectedTask && selectedTask._id === task._id) {
            setSelectedTask(updatedTask); // Update task in modal if it's open
        }

        if (isOnline) {
            try {
                await axios.put(`${API_BASE_URL}/tasks/${task._id}`, updatedTask);
                console.log(`Task marked as ${task.completed ? 'pending' : 'completed'}!`);
                fetchTasks(); // Re-fetch to ensure consistency with API
            } catch (err) {
                console.error('Failed to update task status via API, saving to pending changes:', err);
                addPendingChange('updated', updatedTask);
                alert('API update failed. Change saved locally for sync later.');
            }
        } else {
            addPendingChange('updated', updatedTask);
            alert('You are offline. Task status updated locally. Sync when online.');
        }
    };

    const handleDeleteClick = (id) => {
        setTaskToDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        const idToDelete = taskToDeleteId;
        // Optimistically remove from UI
        setTasks(prevTasks => prevTasks.filter(t => t._id !== idToDelete));
        setShowDeleteConfirm(false);
        setTaskToDeleteId(null);
        setSelectedTask(null); // Close modal if deleted task was open

        if (isOnline) {
            try {
                await axios.delete(`${API_BASE_URL}/tasks/${idToDelete}`);
                console.log('Task deleted successfully via API!');
                fetchTasks(); // Re-fetch to ensure consistency with API
            } catch (err) {
                console.error('Failed to delete task via API, saving to pending changes:', err);
                addPendingChange('deleted', idToDelete);
                alert('API deletion failed. Deletion saved locally for sync later.');
            }
        } else {
            addPendingChange('deleted', idToDelete);
            alert('You are offline. Task deleted locally. Sync when online.');
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setTaskToDeleteId(null);
    };

    // --- Modal related handlers ---
    const handleCardClick = (task) => {
        setSelectedTask(task);
        fetchTaskAIStrategy(task); // Trigger Gemini analysis for the selected task
    };

    const closeDetailModal = () => {
        setSelectedTask(null);
        setSelectedTaskAIAnalysis(''); // Clear AI analysis when closing modal
    };

    // --- Styling Helper Functions ---
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
        const isDueSoon = !task.completed && dueDate >= now && (dueDate.getTime() - now.getTime()) < (3 * 24 * 60 * 60 * 1000); // Within 3 days

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

    // --- Task Sorting Logic ---
    const sortTasks = (taskList) => {
        return [...taskList].sort((a, b) => {
            // Completed tasks always go to the bottom
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            const getUrgencyScore = (task) => {
                let score = 0;
                const now = new Date();
                const dueDate = new Date(task.dueDate);

                // Overdue tasks get highest urgency
                if (dueDate < now && !task.completed) {
                    score += 1000;
                }

                // Eisenhower Quadrant contributes to urgency
                if (task.eisenhowerQuadrant === 'Urgent/Important') {
                    score += 500;
                } else if (task.eisenhowerQuadrant === 'Urgent/Not Important') {
                    score += 200;
                } else if (task.eisenhowerQuadrant === 'Important/Not Urgent') {
                    score += 100;
                }

                // Priority contributes to urgency
                const priorityMapping = {
                    'P1 - Critical': 50, 'P2 - High': 40, 'P3 - Medium': 30, 'P4 - Low': 20, 'P5 - Very Low': 10,
                };
                score += priorityMapping[task.priority] || 0;

                // Tasks due soon get higher urgency
                const diffTime = dueDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 1 && diffDays >= 0 && !task.completed) {
                    score += 80; // Due within 1 day
                } else if (diffDays > 1 && diffDays <= 3 && !task.completed) {
                    score += 60; // Due within 3 days
                }

                return score;
            };

            const urgencyA = getUrgencyScore(a);
            const urgencyB = getUrgencyScore(b);

            // Primary sort by urgency (highest first)
            if (urgencyA !== urgencyB) {
                return urgencyB - urgencyA;
            }

            // Secondary sort based on user's selected sort order if urgencies are equal
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
            return 0; // No change in order if all criteria are equal
        });
    };

    // --- Task Filtering Logic ---
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

    // --- Component Render ---
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
                                        onClick={() => handleCardClick(task)} // Click title to open modal
                                    >
                                        {task.title}
                                    </h3>
                                    {/* Checkbox visible on all screens */}
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleComplete(task)}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                        title={task.completed ? "Mark as Pending" : "Mark as Complete"}
                                    />
                                </div>
                                {/* These details are hidden on small screens, shown on medium and up */}
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
                                {/* Edit and Delete buttons hidden on small screens, shown on medium and up */}
                                <div className="flex space-x-2 hidden md:flex">
                                    <button
                                        onClick={() => onEditTask(task)}
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
                onEditTask={onEditTask} // Pass onEditTask to the modal
                onDeleteTask={handleDeleteClick} // Pass handleDeleteClick to the modal
                toggleComplete={toggleComplete} // Pass toggleComplete to the modal
            />
        </div>
    );
}