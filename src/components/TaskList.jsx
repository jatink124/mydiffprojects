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

  // Fetches tasks from the backend, applying category filter if selected.
  const fetchTasks = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'all') {
        queryParams.append('category', categoryFilter);
      }
      const url = `http://localhost:5000/api/tasks?${queryParams.toString()}`;
      const res = await axios.get(url);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      // Removed toast.error, replaced with console log
      console.error('Failed to load tasks.');
    }
  };

  // Effect hook to re-fetch tasks whenever filters, sort order, search term, or refreshTrigger change.
  useEffect(() => {
    fetchTasks();
  }, [filter, sortOrder, searchTerm, categoryFilter, eisenhowerFilter, refreshTrigger]);

  // Toggles the completion status of a task.
  const toggleComplete = async (task) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${task._id}`, {
        ...task, completed: !task.completed
      });
      // Removed toast.success, replaced with console log
      console.log(`Task marked as ${task.completed ? 'pending' : 'completed'}!`);
      fetchTasks(); // Re-fetch tasks to update the list
    } catch (err) {
      console.error('Failed to update task status:', err);
      // Removed toast.error, replaced with console log
      console.error('Failed to update task status.');
    }
  };

  // Initiates the delete confirmation modal.
  const handleDeleteClick = (id) => {
    setTaskToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Confirms and executes the task deletion.
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskToDeleteId}`);
      // Removed toast.success, replaced with console log
      console.log('Task deleted successfully!');
      fetchTasks(); // Re-fetch tasks to update the list
      setShowDeleteConfirm(false); // Close the modal
      setTaskToDeleteId(null); // Clear the task ID
    } catch (err) {
      console.error('Failed to delete task:', err);
      // Removed toast.error, replaced with console log
      console.error('Failed to delete task.');
    }
  };

  // Cancels the delete operation and closes the modal.
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setTaskToDeleteId(null);
  };

  // Returns Tailwind CSS classes for priority tags.
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

  // Returns Tailwind CSS classes for category tags.
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

  // Determines the urgency-based styling for a task card.
  const getTaskUrgencyStyles = (task) => {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const isOverdue = dueDate < now && !task.completed;
    // Task is due within the next 3 days (inclusive of today) and not overdue
    const isDueSoon = !task.completed && dueDate >= now && (dueDate.getTime() - now.getTime()) < (3 * 24 * 60 * 60 * 1000);

    let classes = {
      cardBg: 'bg-white',
      border: 'border-blue-400 border-l-4', // Default border
      shadow: 'shadow-md',
      animation: '',
      titleText: 'text-gray-900',
      descriptionText: 'text-gray-700',
      dueDateText: 'text-gray-800'
    };

    if (task.completed) {
      classes.cardBg = 'bg-green-50';
      classes.border = 'border-green-400 border-l-4';
      classes.titleText = 'text-gray-500 line-through';
      classes.descriptionText = 'text-gray-500 line-through';
    } else if (isOverdue) {
      classes.cardBg = 'bg-red-100'; // More intense red
      classes.border = 'border-red-600 border-l-8'; // Thicker, darker red border
      classes.shadow = 'shadow-xl ring-2 ring-red-500'; // Stronger shadow, red ring
      classes.animation = 'animate-pulse-subtle'; // Custom subtle pulse animation
      classes.titleText = 'text-red-800 font-extrabold text-xl md:text-2xl'; // Larger, bolder
      classes.descriptionText = 'text-red-700';
      classes.dueDateText = 'text-red-700 font-bold';
    } else if (task.eisenhowerQuadrant === 'Urgent/Important' || task.priority === 'P1 - Critical' || task.priority === 'P2 - High') {
      classes.cardBg = 'bg-yellow-50'; // Yellowish tint for high urgency but not overdue
      classes.border = 'border-orange-500 border-l-8'; // Orange border
      classes.shadow = 'shadow-lg ring-1 ring-orange-400'; // Orange ring
      classes.animation = isDueSoon ? 'animate-pulse-subtle' : ''; // Pulse if due soon
      classes.titleText = 'text-orange-800 font-bold text-lg md:text-xl';
      classes.descriptionText = 'text-orange-700';
    } else if (isDueSoon) {
      classes.cardBg = 'bg-blue-50';
      classes.border = 'border-blue-500 border-l-4';
      classes.shadow = 'shadow-md';
      classes.titleText = 'text-blue-800 font-semibold';
    }

    return classes;
  };

  // Sorts tasks based on completion status, urgency score, and user-selected criteria.
  const sortTasks = (taskList) => {
    return [...taskList].sort((a, b) => {
      // 1. Primary Sort: Completed tasks always go to the end
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1; // Completed tasks are "less urgent"
      }

      // For incomplete tasks, determine urgency based on multiple factors
      const getUrgencyScore = (task) => {
        let score = 0;
        const now = new Date();
        const dueDate = new Date(task.dueDate);

        // Overdue tasks are most urgent
        if (dueDate < now && !task.completed) {
          score += 1000; // Highest score for overdue
        }

        // Eisenhower Quadrant urgency
        if (task.eisenhowerQuadrant === 'Urgent/Important') {
          score += 500;
        } else if (task.eisenhowerQuadrant === 'Urgent/Not Important') {
          score += 200;
        } else if (task.eisenhowerQuadrant === 'Important/Not Urgent') {
          score += 100;
        }

        // Priority Level urgency (higher P-level = higher score)
        const priorityMapping = {
          'P1 - Critical': 50,
          'P2 - High': 40,
          'P3 - Medium': 30,
          'P4 - Low': 20,
          'P5 - Very Low': 10,
        };
        score += priorityMapping[task.priority] || 0;

        // Due date proximity (closer due date = higher score, but less than explicit urgency)
        const diffTime = dueDate.getTime() - now.getTime(); // Difference in milliseconds
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1 && diffDays >= 0 && !task.completed) { // Due today or tomorrow
          score += 80;
        } else if (diffDays > 1 && diffDays <= 3 && !task.completed) { // Due within 3 days
          score += 60;
        }

        return score;
      };

      const urgencyA = getUrgencyScore(a);
      const urgencyB = getUrgencyScore(b);

      // Sort by urgency score (descending - higher score first)
      if (urgencyA !== urgencyB) {
        return urgencyB - urgencyA;
      }

      // If urgency scores are equal, apply secondary sort based on user's choice
      const priorityOrder = {
        'P1 - Critical': 5,
        'P2 - High': 4,
        'P3 - Medium': 3,
        'P4 - Low': 2,
        'P5 - Very Low': 1,
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
      return 0; // Fallback if no specific sort order applies
    });
  };

  // Client-side filtering for status, search, and Eisenhower quadrant.
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
    <div className="bg-white shadow-2xl rounded-xl p-8 border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-5">
        <h2 className="text-3xl font-extrabold text-gray-800">Your Tasks Overview</h2>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          {/* Search Bar */}
          <div className="relative flex-grow sm:flex-grow-0 min-w-[150px]">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-9 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            />
            {/* Search Icon */}
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>

          {/* Category Filter */}
          <div className="relative flex-grow sm:flex-grow-0 min-w-[120px]">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-base appearance-none pr-8 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'All' ? 'all' : cat}>{cat}</option>
              ))}
            </select>
            {/* Tag Icon */}
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 12.586a2 2 0 0 0 2.828 0l3.172-3.172a2 2 0 0 0 0-2.828L15.414 4.586a2 2 0 0 0-2.828 0L9.414 7.758a2 2 0 0 0 0 2.828L12.586 12.586z"></path><path d="M19 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7"></path></svg>
          </div>

          {/* Completion Status Filter */}
          <div className="relative flex-grow sm:flex-grow-0 min-w-[120px]">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-base appearance-none pr-8 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            {/* Filter Icon */}
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </div>

          {/* Eisenhower Matrix Filter */}
          <div className="relative flex-grow sm:flex-grow-0 min-w-[150px]">
            <select
              value={eisenhowerFilter}
              onChange={(e) => setEisenhowerFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-base appearance-none pr-8 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="all">All Quadrants</option>
              <option value="Urgent/Important">Urgent & Important</option>
              <option value="Important/Not Urgent">Important & Not Urgent</option>
              <option value="Urgent/Not Important">Urgent & Not Important</option>
              <option value="Not Urgent/Not Important">Not Urgent & Not Important</option>
            </select>
            {/* Tag Icon */}
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 12.586a2 2 0 0 0 2.828 0l3.172-3.172a2 2 0 0 0 0-2.828L15.414 4.586a2 2 0 0 0-2.828 0L9.414 7.758a2 2 0 0 0 0 2.828L12.586 12.586z"></path><path d="M19 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7"></path></svg>
          </div>

          {/* Sort Order */}
          <div className="relative flex-grow sm:flex-grow-0 min-w-[120px]">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-base appearance-none pr-8 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="dueDateAsc">Due Date (Soonest)</option>
              <option value="dueDateDesc">Due Date (Latest)</option>
              <option value="priorityHigh">Priority (Highest first)</option>
              <option value="priorityLow">Priority (Lowest first)</option>
            </select>
            {/* Clock Icon */}
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
        </div>
      </div>

      {displayedTasks.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-xl bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
          {/* Alert Circle Icon */}
          <svg className="text-5xl mb-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p className="font-semibold">No tasks found!</p>
          <p className="text-sm">Try adjusting your filters or adding a new task above.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedTasks.map(task => {
            const urgencyStyles = getTaskUrgencyStyles(task);

            return (
              <li
                key={task._id}
                className={`p-6 rounded-xl transition-all duration-300 transform hover:scale-[1.01]
                  ${urgencyStyles.cardBg} ${urgencyStyles.border} ${urgencyStyles.shadow} ${urgencyStyles.animation}
                  flex flex-col justify-between`}
              >
                <div>
                  <h3 className={`${urgencyStyles.titleText} font-bold mb-2`}>
                    {task.title}
                  </h3>
                  <p className={`${urgencyStyles.descriptionText} text-sm mb-3`}>{task.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-auto pt-3 border-t border-gray-100">
                  <p className="flex items-center gap-1 text-gray-700">
                    {/* Calendar Icon */}
                    <svg className="text-lg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Due:
                    <span className={`${urgencyStyles.dueDateText}`}>
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </p>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getPriorityColor(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  {task.category && (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getCategoryTagColor(task.category)} flex items-center gap-1`}>
                      {/* Tag Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 12.586a2 2 0 0 0 2.828 0l3.172-3.172a2 2 0 0 0 0-2.828L15.414 4.586a2 2 0 0 0-2.828 0L9.414 7.758a2 2 0 0 0 0 2.828L12.586 12.586z"></path><path d="M19 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7"></path></svg>
                      {task.category}
                    </span>
                  )}
                  {task.eisenhowerQuadrant && (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 bg-indigo-50 text-indigo-700 ring-indigo-100 flex items-center gap-1`}>
                      {/* Zap Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                      {task.eisenhowerQuadrant.split('/')[0].slice(0, 1)}. {task.eisenhowerQuadrant.split('/')[1].slice(0, 1)}.
                    </span>
                  )}
                  {urgencyStyles.animation.includes('animate-pulse-subtle') && !task.completed && (
                    <span className="text-red-600 flex items-center gap-1 font-semibold animate-pulse">
                      {/* Alert Circle Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      Urgent!
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3 mt-5 pt-3 border-t border-gray-100 justify-end">
                  <button
                    onClick={() => toggleComplete(task)}
                    className={`p-3 rounded-full transition-colors duration-200 transform hover:scale-110 active:scale-95
                      ${task.completed ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                    title={task.completed ? 'Mark as Pending' : 'Mark as Completed'}
                  >
                    {task.completed ? (
                      // X Circle Icon
                      <svg className="text-xl" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    ) : (
                      // Check Circle Icon
                      <svg className="text-xl" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    )}
                  </button>
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200 transform hover:scale-110 active:scale-95"
                    title="Edit Task"
                  >
                    {/* Edit Icon */}
                    <svg className="text-xl" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(task._id)}
                    className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200 transform hover:scale-110 active:scale-95"
                    title="Delete Task"
                  >
                    {/* Trash Icon */}
                    <svg className="text-xl" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-center transform transition-all duration-300 scale-100 opacity-100">
            {/* Alert Circle Icon */}
            <svg className="text-red-500 text-6xl mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelDelete}
                className="px-6 py-3 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
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
