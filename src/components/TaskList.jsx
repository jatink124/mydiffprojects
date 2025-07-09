import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FiEdit, FiTrash2, FiCheckCircle, FiCircle, FiX, FiInfo, FiSearch, FiFilter, FiList, FiRefreshCcw, FiClock } from 'react-icons/fi'; // FiClock added here

export default function TaskList({ onEditTask, refreshTrigger }) {
  // State for managing tasks and UI filters/sorts
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // Filter by completion status
  const [sortOrder, setSortOrder] = useState('dueDateAsc'); // Sort order for tasks
  const [searchTerm, setSearchTerm] = useState(''); // Search term for task titles/descriptions
  const [eisenhowerFilter, setEisenhowerFilter] = useState('all'); // Filter by Eisenhower Quadrant
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation modal
  const [taskToDeleteId, setTaskToDeleteId] = useState(null); // ID of task to be deleted
  const [activeTab, setActiveTab] = useState('All'); // Active category tab
  const [selectedTask, setSelectedTask] = useState(null); // Task selected for detail view
  const [manualRefreshKey, setManualRefreshKey] = useState(0); // Key to force manual refresh

  // AI-related states
  const [categoryInsights, setCategoryInsights] = useState({}); // AI insights for categories
  const [loadingInsights, setLoadingInsights] = useState(false); // Loading state for category insights
  const [selectedTaskAIAnalysis, setSelectedTaskAIAnalysis] = useState(''); // AI analysis for selected task
  const [loadingTaskAI, setLoadingTaskAI] = useState(false); // Loading state for task AI analysis

  // Define available task categories
  const categories = ['All', 'General', 'Web Development', 'Trading', 'Personal', 'Work', 'Study', 'Health'];

  // Base URL for your backend API (ensure this matches your deployed backend URL)
  const API_BASE_URL = 'https://mydiffprojects.onrender.com/api';
  const API_BASE = 'https://mydiffprojects.onrender.com/api'; // Assuming your Gemini endpoint is also here

  // Function to fetch tasks from the backend
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

      const res = await axios.post(`${API_BASE}/gemini/gemini-analysis`, { prompt });
      setCategoryInsights(prev => ({ ...prev, [category]: res.data }));
    } catch (err) {
      console.error(`Failed to fetch Gemini insights for ${category}:`, err);
      setCategoryInsights(prev => ({ ...prev, [category]: 'Failed to load Gemini insights. Please try again or check server connection.' }));
    } finally {
      setLoadingInsights(false);
    }
  }, [tasks]); // Dependency array includes tasks to re-run when tasks change

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

      const res = await axios.post(`${API_BASE}/gemini/gemini-analysis`, { prompt });
      setSelectedTaskAIAnalysis(res.data);
    } catch (err) {
      console.error('Failed to fetch Gemini strategy for task:', err);
      setSelectedTaskAIAnalysis('Failed to generate Gemini strategy. Please try again or check server connection.');
    } finally {
      setLoadingTaskAI(false);
    }
  };

  // Effect hook to fetch tasks whenever filters, sort order, search term, active tab, refreshTrigger, or manualRefreshKey changes
  useEffect(() => {
    fetchTasks();
  }, [filter, sortOrder, searchTerm, activeTab, eisenhowerFilter, refreshTrigger, manualRefreshKey]);

  // Effect hook to fetch AI insights for the active category
  useEffect(() => {
    if (tasks.length > 0 || activeTab === 'All') {
      fetchAIInsights(activeTab);
    } else if (activeTab !== 'All') {
      // If no tasks in category, still show general advice
      setCategoryInsights(prev => ({ ...prev, [activeTab]: 'No tasks in this category to analyze. Showing general advice.' }));
      fetchAIInsights(activeTab);
    }
  }, [activeTab, tasks, fetchAIInsights]);

  // Handler for manual refresh button
  const handleManualRefresh = () => {
    setManualRefreshKey(prevKey => prevKey + 1); // Increment key to trigger useEffect
  };

  // Handler to toggle task completion status
  const toggleComplete = async (task) => {
    try {
      await axios.put(`${API_BASE_URL}/tasks/${task._id}`, {
        ...task, completed: !task.completed
      });
      console.log(`Task marked as ${task.completed ? 'pending' : 'completed'}!`);
      fetchTasks(); // Re-fetch tasks to update UI
      if (selectedTask && selectedTask._id === task._id) {
        setSelectedTask(prev => ({ ...prev, completed: !prev.completed })); // Update selected task in modal
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  // Handler to show delete confirmation modal
  const handleDeleteClick = (id) => {
    setTaskToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Handler to confirm and delete task
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskToDeleteId}`);
      console.log('Task deleted successfully!');
      fetchTasks(); // Re-fetch tasks to update UI
      setShowDeleteConfirm(false); // Close modal
      setTaskToDeleteId(null); // Clear ID
      setSelectedTask(null); // Close detail modal if open for this task
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Handler to cancel delete operation
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setTaskToDeleteId(null);
  };

  // Handler for clicking on a task card to open detail modal
  const handleCardClick = (task) => {
    setSelectedTask(task);
    fetchTaskAIStrategy(task); // Trigger Gemini analysis for the selected task
  };

  // Handler to close the task detail modal
  const closeDetailModal = () => {
    setSelectedTask(null);
    setSelectedTaskAIAnalysis(''); // Clear AI analysis when closing
  };

  // Helper function to get priority tag color
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

  // Helper function to get category tag color
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

  // Helper function to get task card styles based on status and urgency
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

  // Function to sort tasks based on current sortOrder and urgency
  const sortTasks = (taskList) => {
    return [...taskList].sort((a, b) => {
      // Completed tasks always go to the bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // Calculate urgency score for advanced sorting
      const getUrgencyScore = (task) => {
        let score = 0;
        const now = new Date();
        const dueDate = new Date(task.dueDate);

        if (dueDate < now && !task.completed) {
          score += 1000; // Overdue tasks get highest urgency
        }

        // Eisenhower Quadrant contributes to urgency
        if (task.eisenhowerQuadrant === 'Urgent/Important') {
          score += 500;
        } else if (task.eisenhowerQuadrant === 'Urgent/Not Important') {
          score += 200;
        } else if (task.eisenhowerQuadrant === 'Important/Not Urgent') {
          score += 100;
        }

        // Priority level contributes to urgency
        const priorityMapping = {
          'P1 - Critical': 50, 'P2 - High': 40, 'P3 - Medium': 30, 'P4 - Low': 20, 'P5 - Very Low': 10,
        };
        score += priorityMapping[task.priority] || 0;

        // Due date proximity contributes to urgency
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1 && diffDays >= 0 && !task.completed) {
          score += 80; // Due today or tomorrow
        } else if (diffDays > 1 && diffDays <= 3 && !task.completed) {
          score += 60; // Due within 3 days
        }

        return score;
      };

      const urgencyA = getUrgencyScore(a);
      const urgencyB = getUrgencyScore(b);

      // Prioritize by urgency score first
      if (urgencyA !== urgencyB) {
        return urgencyB - urgencyA;
      }

      // Fallback to selected sort order if urgency is same
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
      return 0; // No change in order
    });
  };

  // Client-side filtering based on status, search term, and Eisenhower quadrant
  const clientFilteredTasks = tasks.filter(t => {
    const matchesStatus = (filter === 'completed' && t.completed) ||
      (filter === 'pending' && !t.completed) ||
      filter === 'all';
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEisenhower = (eisenhowerFilter === 'all' || t.eisenhowerQuadrant === eisenhowerFilter);

    return matchesStatus && matchesSearch && matchesEisenhower;
  });

  // Apply sorting to the filtered tasks
  const displayedTasks = sortTasks(clientFilteredTasks);

  return (
    <div className="bg-white shadow-2xl rounded-xl
                    p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12
                    border border-gray-100">
      {/* Header and Filter/Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center
                      mb-6 md:mb-8 lg:mb-10
                      gap-3 md:gap-5 lg:gap-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                       font-extrabold text-gray-800
                       text-center sm:text-left mb-4 sm:mb-0">Your Tasks Overview</h2>
        <div className="flex flex-wrap items-center
                        gap-3 sm:gap-4 md:gap-5
                        w-full sm:w-auto justify-center sm:justify-end">
          {/* Search Bar */}
          <div className="relative flex-grow min-w-[120px] sm:min-w-[150px] md:min-w-[180px]">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-9 sm:p-2.5 sm:pl-10 md:p-3 md:pl-11
                         border border-gray-300 rounded-lg
                         text-sm sm:text-base md:text-lg
                         focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg" />
          </div>

          {/* Completion Status Filter */}
          <div className="relative flex-grow min-w-[110px] sm:min-w-[120px] md:min-w-[140px]">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 sm:p-2.5 md:p-3
                         border border-gray-300 rounded-lg
                         text-sm sm:text-base md:text-lg
                         appearance-none pr-8 sm:pr-9 md:pr-10
                         focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <FiFilter className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-base sm:text-lg" />
          </div>

          {/* Eisenhower Matrix Filter */}
          <div className="relative flex-grow min-w-[140px] sm:min-w-[150px] md:min-w-[180px]">
            <select
              value={eisenhowerFilter}
              onChange={(e) => setEisenhowerFilter(e.target.value)}
              className="w-full p-2 sm:p-2.5 md:p-3
                         border border-gray-300 rounded-lg
                         text-sm sm:text-base md:text-lg
                         appearance-none pr-8 sm:pr-9 md:pr-10
                         focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="all">All Quadrants</option>
              <option value="Urgent/Important">Urgent & Important</option>
              <option value="Important/Not Urgent">Important & Not Urgent</option>
              <option value="Urgent/Not Important">Urgent & Not Important</option>
              <option value="Not Urgent/Not Important">Not Urgent & Not Important</option>
            </select>
            <FiList className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-base sm:text-lg" />
          </div>

          {/* Sort Order */}
          <div className="relative flex-grow min-w-[110px] sm:min-w-[120px] md:min-w-[140px]">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full p-2 sm:p-2.5 md:p-3
                         border border-gray-300 rounded-lg
                         text-sm sm:text-base md:text-lg
                         appearance-none pr-8 sm:pr-9 md:pr-10
                         focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="dueDateAsc">Due Date (Soonest)</option>
              <option value="dueDateDesc">Due Date (Latest)</option>
              <option value="priorityHigh">Priority (Highest first)</option>
              <option value="priorityLow">Priority (Lowest first)</option>
            </select>
            <FiClock className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-base sm:text-lg" />
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            className="p-2.5 sm:p-3 md:p-3.5 rounded-lg bg-blue-500 text-white
                       hover:bg-blue-600 transition-colors duration-200
                       flex items-center justify-center gap-1
                       min-w-[40px] sm:min-w-[unset] text-sm sm:text-base"
            title="Refresh Tasks"
          >
            <FiRefreshCcw className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4
                      mb-6 border-b border-gray-200 pb-2
                      overflow-x-auto justify-center md:justify-start scrollbar-hide">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`
              px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5
              rounded-full text-xs sm:text-sm md:text-base font-medium
              transition-all duration-300 whitespace-nowrap
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
      {activeTab && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg
                        p-3 sm:p-4 md:p-5
                        mb-6 text-sm sm:text-base">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-blue-800 mb-2 flex items-center">
            <FiInfo className="mr-2 text-blue-600 text-base sm:text-lg" /> AI Insights for "{activeTab}" Category
          </h3>
          {loadingInsights ? (
            <div className="flex items-center text-blue-700">
              <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Generating category insights...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-blue-900">
              <ReactMarkdown>{categoryInsights[activeTab] || 'No AI insights available. Select a category.'}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Task List Display */}
      {displayedTasks.length === 0 ? (
        <div className="text-center
                        py-8 sm:py-12 md:py-16 lg:py-20
                        text-gray-500
                        text-base sm:text-lg md:text-xl lg:text-2xl
                        bg-gray-50 rounded-lg border border-gray-200
                        flex flex-col items-center justify-center">
          <svg className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl
                          mb-2 sm:mb-3 md:mb-4 text-gray-400"
               xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line><line x1="12" y1="8" x2="12" y2="16"></line>
          </svg>
          <p>No tasks found matching your criteria.</p>
          <p className="text-sm sm:text-base text-gray-400 mt-1">Try adjusting your filters or adding a new task!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                        gap-4 sm:gap-6 md:gap-8">
          {displayedTasks.map(task => {
            const cardStyles = getTaskCardStyles(task);
            return (
              <div
                key={task._id}
                className={`relative ${cardStyles.cardBg} rounded-lg shadow-md
                            p-4 sm:p-5 md:p-6
                            flex flex-col justify-between cursor-pointer
                            border border-gray-200 transform transition duration-200 hover:shadow-lg hover:-translate-y-1`}
                onClick={() => handleCardClick(task)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg sm:text-xl md:text-2xl font-semibold ${cardStyles.titleText} break-words pr-2`}>
                    {task.title}
                  </h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleComplete(task); }}
                    className={`p-1 rounded-full transition-colors duration-200
                                ${task.completed ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                    title={task.completed ? 'Mark as Pending' : 'Mark as Complete'}
                  >
                    {task.completed ? <FiCheckCircle className="text-xl sm:text-2xl" /> : <FiCircle className="text-xl sm:text-2xl" />}
                  </button>
                </div>

                <p className={`text-sm sm:text-base text-gray-600 mb-3 ${task.completed ? 'line-through' : ''}`}>
                  {task.description ? task.description.substring(0, 100) + (task.description.length > 100 ? '...' : '') : 'No description.'}
                </p>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getCategoryTagColor(task.category)}`}>
                    {task.category}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200">
                    {task.eisenhowerQuadrant.split('/')[0]}
                  </span>
                </div>

                <div className={`text-sm sm:text-base ${cardStyles.dueDateText} flex items-center justify-between`}>
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                      className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                      title="Edit Task"
                    >
                      <FiEdit className="text-lg" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(task._id); }}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                      title="Delete Task"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl
                          p-6 sm:p-8
                          w-full max-w-sm sm:max-w-md">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 text-sm sm:text-base"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl
                          p-6 sm:p-8 md:p-10
                          w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl
                          max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={closeDetailModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl"
            >
              <FiX />
            </button>

            <h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 ${getTaskCardStyles(selectedTask).titleText}`}>
              {selectedTask.title}
            </h3>

            <p className="text-gray-700 text-base sm:text-lg md:text-xl mb-4 sm:mb-5 whitespace-pre-wrap">
              {selectedTask.description || 'No description provided.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 mb-5 text-sm sm:text-base md:text-lg">
              <p><strong className="text-gray-700">Due Date:</strong> {new Date(selectedTask.dueDate).toLocaleDateString()}</p>
              <p><strong className="text-gray-700">Category:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryTagColor(selectedTask.category)}`}>{selectedTask.category}</span></p>
              <p><strong className="text-gray-700">Priority:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>{selectedTask.priority}</span></p>
              <p><strong className="text-gray-700">Quadrant:</strong> <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200">{selectedTask.eisenhowerQuadrant}</span></p>
              <p>
                <strong className="text-gray-700">Status:</strong>{" "}
                <span className={`font-semibold ${selectedTask.completed ? 'text-green-600' : 'text-orange-500'}`}>
                  {selectedTask.completed ? 'Completed' : 'Pending'}
                </span>
              </p>
            </div>

            <div className="mt-4 sm:mt-6 md:mt-8 bg-blue-50 border border-blue-200 rounded-lg
                            p-3 sm:p-4 md:p-5
                            text-sm sm:text-base">
              <h4 className="text-base sm:text-lg md:text-xl font-bold text-blue-800 mb-2 flex items-center">
                <FiInfo className="mr-2 text-blue-600 text-base sm:text-lg" /> AI Strategic Plan
              </h4>
              {loadingTaskAI ? (
                <div className="flex items-center text-blue-700">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Generating strategy...</span>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-blue-900">
                  <ReactMarkdown>{selectedTaskAIAnalysis || 'Click on a task to get an AI-generated strategic plan.'}</ReactMarkdown>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 sm:gap-4 md:gap-5 mt-5">
              <button
                onClick={() => { onEditTask(selectedTask); closeDetailModal(); }}
                className="flex items-center gap-1
                           px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3
                           rounded-lg bg-blue-500 text-white font-semibold
                           hover:bg-blue-600 transition-colors duration-200 text-sm sm:text-base"
              >
                <FiEdit className="text-base sm:text-lg" /> Edit
              </button>
              <button
                onClick={() => { handleDeleteClick(selectedTask._id); closeDetailModal(); }}
                className="flex items-center gap-1
                           px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3
                           rounded-lg bg-red-500 text-white font-semibold
                           hover:bg-red-600 transition-colors duration-200 text-sm sm:text-base"
              >
                <FiTrash2 className="text-base sm:text-lg" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
