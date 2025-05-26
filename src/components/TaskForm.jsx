import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCalendar, FiTrash2, FiSave, FiXCircle, FiPlusCircle, FiTag, FiClock } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function TaskForm({ selectedTask, onTaskAdded, onCancelEdit }) {
  const categories = ['General', 'Web Development', 'Trading', 'Personal', 'Work', 'Study', 'Health'];
  // Expanded priorities with more levels for P1, P2, P3, etc.
  const priorities = ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low', 'P5 - Very Low'];

  const [task, setTask] = useState(selectedTask || {
    title: '',
    description: '',
    dueDate: null,
    priority: 'P3 - Medium', // Default to a medium P-level
    completed: false,
    category: 'General',
    eisenhowerQuadrant: 'Important/Not Urgent' // New field for Eisenhower Matrix
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
      priority: 'P3 - Medium', // Default to a medium P-level
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
      // Reset task to default values after submission
      setTask({ title: '', description: '', dueDate: null, priority: 'P3 - Medium', completed: false, category: 'General', eisenhowerQuadrant: 'Important/Not Urgent' });
      setIsEditing(false);
      onTaskAdded();
      if (onCancelEdit) onCancelEdit();
    } catch (err) {
      console.error('Error saving task:', err);
      toast.error('Failed to save task.');
    }
  };

  const handleClearForm = () => {
    setTask({ title: '', description: '', dueDate: null, priority: 'P3 - Medium', completed: false, category: 'General', eisenhowerQuadrant: 'Important/Not Urgent' });
    setIsEditing(false);
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-xl p-8 space-y-6 mb-10 border border-gray-100 transform transition-all duration-300 hover:scale-[1.005]">
      <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3 border-b pb-4 mb-4 border-gray-200">
        {isEditing ? <FiSave className="text-blue-500" /> : <FiPlusCircle className="text-green-500" />}
        {isEditing ? 'Update Your Task' : 'Add a New Task'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
          <input
            id="title"
            name="title"
            value={task.title}
            onChange={handleChange}
            placeholder="e.g., Complete React project refactor"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg placeholder-gray-400 transition-all duration-200"
            maxLength="100"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            value={task.description}
            onChange={handleChange}
            placeholder="Provide a detailed explanation of the task..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent min-h-[100px] text-base placeholder-gray-400 transition-all duration-200"
            rows="4"
            maxLength="500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
            <DatePicker
              id="dueDate"
              selected={task.dueDate}
              onChange={handleDateChange}
              dateFormat="yyyy/MM/dd"
              placeholderText="Select due date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg pr-10 cursor-pointer transition-all duration-200"
              minDate={new Date()}
              isClearable
              required
            />
            <FiCalendar className="absolute right-3 top-1/2 mt-2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="relative">
              <select
                id="category-select"
                name="category"
                value={task.category}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base appearance-none pr-10 transition-all duration-200 cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <FiTag className="absolute right-3 top-1/2 mt-2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="priority-select" className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
          <div className="relative">
            <select
              id="priority-select"
              name="priority"
              value={task.priority}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base appearance-none pr-10 transition-all duration-200 cursor-pointer"
            >
              {priorities.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <FiClock className="absolute right-3 top-1/2 mt-2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Eisenhower Matrix Selector (New Addition) */}
        <div>
          <label htmlFor="eisenhower-select" className="block text-sm font-medium text-gray-700 mb-1">Eisenhower Quadrant</label>
          <div className="relative">
            <select
              id="eisenhower-select"
              name="eisenhowerQuadrant"
              value={task.eisenhowerQuadrant}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base appearance-none pr-10 transition-all duration-200 cursor-pointer"
            >
              <option value="Urgent/Important">Urgent & Important (Do)</option>
              <option value="Important/Not Urgent">Important & Not Urgent (Schedule)</option>
              <option value="Urgent/Not Important">Urgent & Not Important (Delegate)</option>
              <option value="Not Urgent/Not Important">Not Urgent & Not Important (Delete)</option>
            </select>
            <FiTag className="absolute right-3 top-1/2 mt-2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>


        <div className="flex justify-end space-x-4 pt-4">
          {isEditing && (
            <button
              type="button"
              onClick={handleClearForm}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors duration-200 shadow-sm font-medium"
            >
              <FiXCircle className="text-lg" /> Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isEditing ? <FiSave className="text-lg" /> : <FiPlusCircle className="text-lg" />}
            {isEditing ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
}