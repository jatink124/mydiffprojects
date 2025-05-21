import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';

const DailyPlanner = () => {
  // State management
  const [plansData, setPlansData] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [dragEnabled, setDragEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showWidgetOptions, setShowWidgetOptions] = useState(false);
  const [fileHandle, setFileHandle] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // File operations
  const saveToFile = async (data) => {
    try {
      setIsSaving(true);
      let handle = fileHandle;
      
      // If we don't have a file handle, prompt user to save
      if (!handle && 'showSaveFilePicker' in window) {
        handle = await window.showSaveFilePicker({
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          }],
          suggestedName: 'daily-planner-data.json',
        });
        setFileHandle(handle);
      }

      if (handle) {
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();
      } else {
        // Fallback for browsers without File System Access API
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'daily-planner-data.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error saving file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const loadFromFile = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          }],
          multiple: false,
        });
        setFileHandle(handle);
        const file = await handle.getFile();
        const content = await file.text();
        return JSON.parse(content);
      } else {
        // Fallback for browsers without File System Access API
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve(JSON.parse(event.target.result));
            };
            reader.readAsText(file);
          };
          input.click();
        });
      }
    } catch (error) {
      console.error('Error loading file:', error);
      return null;
    }
  };

  // Initialize the app
  useEffect(() => {
    const initializeApp = async () => {
      // Load theme preference from localStorage
      const savedTheme = localStorage.getItem('theme') || 'light';
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);

      // Load settings from localStorage
      const savedDrag = localStorage.getItem('dragEnabled');
      if (savedDrag !== null) setDragEnabled(savedDrag === 'true');

      const savedAnimations = localStorage.getItem('animationsEnabled');
      if (savedAnimations !== null) setAnimationsEnabled(savedAnimations === 'true');

      // Try to load data from file
      try {
        const loadedData = await loadFromFile();
        if (loadedData) {
          setPlansData(loadedData);
        } else {
          // Initialize with default categories if no file is loaded
          setPlansData({
            [currentDate]: {
              categories: {
                'web-development': {
                  name: 'Web Development',
                  tasks: []
                },
                'nifty-options': {
                  name: 'Nifty Options Trading',
                  tasks: []
                }
              }
            }
          });
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        // Initialize with default categories if loading fails
        setPlansData({
          [currentDate]: {
            categories: {
              'web-development': {
                name: 'Web Development',
                tasks: []
              },
              'nifty-options': {
                name: 'Nifty Options Trading',
                tasks: []
              }
            }
          }
        });
      }

      // PWA install prompt
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };

    initializeApp();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [currentDate]);

  // Save data to file whenever it changes
  useEffect(() => {
    if (Object.keys(plansData).length > 0) {
      saveToFile(plansData);
    }
  }, [plansData]);

  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Load plans for a specific date
  const loadPlansForDate = (date) => {
    if (!plansData[date]) {
      setPlansData(prev => ({
        ...prev,
        [date]: { categories: {} }
      }));
    }
  };

  // Category management
  const openCategoryModal = (categoryId = null) => {
    setEditingCategoryId(categoryId);
    setCategoryName(categoryId ? plansData[currentDate]?.categories[categoryId]?.name : '');
    setShowCategoryModal(true);
  };

  const saveCategory = () => {
    if (categoryName.trim()) {
      if (editingCategoryId) {
        // Update existing category
        setPlansData(prev => ({
          ...prev,
          [currentDate]: {
            ...prev[currentDate],
            categories: {
              ...prev[currentDate]?.categories,
              [editingCategoryId]: {
                ...prev[currentDate]?.categories[editingCategoryId],
                name: categoryName
              }
            }
          }
        }));
      } else {
        // Create new category
        const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
        setPlansData(prev => ({
          ...prev,
          [currentDate]: {
            ...prev[currentDate],
            categories: {
              ...prev[currentDate]?.categories,
              [categoryId]: {
                name: categoryName,
                tasks: []
              }
            }
          }
        }));
      }
      setShowCategoryModal(false);
    }
  };

  const deleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category and all its tasks?')) {
      const newCategories = { ...plansData[currentDate].categories };
      delete newCategories[categoryId];
      setPlansData(prev => ({
        ...prev,
        [currentDate]: {
          ...prev[currentDate],
          categories: newCategories
        }
      }));
    }
  };

  // Task management
  const openTaskModal = (categoryId, taskId = null) => {
    setEditingTaskId(taskId !== null ? { categoryId, taskId } : null);
    setTaskName(taskId !== null ? plansData[currentDate]?.categories[categoryId]?.tasks[taskId]?.description : '');
    setSelectedCategory(taskId !== null ? categoryId : '');
    setShowTaskModal(true);
  };

  const saveTask = () => {
    if (taskName.trim() && selectedCategory) {
      if (editingTaskId) {
        // If editing an existing task
        const { categoryId: oldCategoryId, taskId } = editingTaskId;
        
        if (oldCategoryId !== selectedCategory) {
          // Move task to new category
          const task = { ...plansData[currentDate].categories[oldCategoryId].tasks[taskId] };
          task.description = taskName;
          
          setPlansData(prev => {
            const newCategories = { ...prev[currentDate].categories };
            // Remove from old category
            newCategories[oldCategoryId].tasks = newCategories[oldCategoryId].tasks.filter((_, i) => i !== taskId);
            // Add to new category
            newCategories[selectedCategory].tasks = [...newCategories[selectedCategory].tasks, task];
            
            return {
              ...prev,
              [currentDate]: {
                ...prev[currentDate],
                categories: newCategories
              }
            };
          });
        } else {
          // Just update description
          setPlansData(prev => ({
            ...prev,
            [currentDate]: {
              ...prev[currentDate],
              categories: {
                ...prev[currentDate].categories,
                [selectedCategory]: {
                  ...prev[currentDate].categories[selectedCategory],
                  tasks: prev[currentDate].categories[selectedCategory].tasks.map((task, i) => 
                    i === taskId ? { ...task, description: taskName } : task
                  )
                }
              }
            }
          }));
        }
      } else {
        // Add new task
        const newTask = {
          description: taskName,
          completed: false
        };
        
        setPlansData(prev => ({
          ...prev,
          [currentDate]: {
            ...prev[currentDate],
            categories: {
              ...prev[currentDate].categories,
              [selectedCategory]: {
                ...prev[currentDate].categories[selectedCategory],
                tasks: [...prev[currentDate].categories[selectedCategory].tasks, newTask]
              }
            }
          }
        }));
      }
      setShowTaskModal(false);
    }
  };

  const toggleTaskComplete = (categoryId, taskId) => {
    setPlansData(prev => ({
      ...prev,
      [currentDate]: {
        ...prev[currentDate],
        categories: {
          ...prev[currentDate].categories,
          [categoryId]: {
            ...prev[currentDate].categories[categoryId],
            tasks: prev[currentDate].categories[categoryId].tasks.map((task, i) => 
              i === taskId ? { ...task, completed: !task.completed } : task
            )
          }
        }
      }
    }));
  };

  const deleteTask = (categoryId, taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setPlansData(prev => ({
        ...prev,
        [currentDate]: {
          ...prev[currentDate],
          categories: {
            ...prev[currentDate].categories,
            [categoryId]: {
              ...prev[currentDate].categories[categoryId],
              tasks: prev[currentDate].categories[categoryId].tasks.filter((_, i) => i !== taskId)
            }
          }
        }
      }));
    }
  };

  // File operations UI
  const handleSaveAsClick = async () => {
    await saveToFile(plansData);
  };

  const handleLoadClick = async () => {
    const loadedData = await loadFromFile();
    if (loadedData) {
      setPlansData(loadedData);
    }
  };

  // PWA installation
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Daily Planner</title>
        <meta name="description" content="Daily Planner PWA with customizable dashboard" />
        <meta name="theme-color" content="#3498db" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="manifest" href="/manifest.json" />
      </Helmet>

      <div className={`min-h-screen p-4 md:p-6 transition-colors duration-300 ${currentTheme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <div className={`max-w-4xl mx-auto rounded-lg shadow-lg p-4 md:p-6 transition-all duration-300 ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left text-blue-500">
              Daily Planner
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`px-4 py-2 rounded-full flex items-center gap-2 ${currentTheme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
              >
                {currentTheme === 'dark' ? '☀️' : '🌙'}
                <span>{currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
                >
                  Install App
                </button>
              )}
            </div>
          </div>

          {/* File Operations */}
          <div className="flex justify-end gap-2 mb-4">
            <button
              onClick={handleSaveAsClick}
              disabled={isSaving}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save As...'}
            </button>
            <button
              onClick={handleLoadClick}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm transition-colors"
            >
              Load File
            </button>
          </div>

          {/* Date Selector */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <label htmlFor="plan-date" className="font-medium">
              Select Date:
            </label>
            <input
              type="date"
              id="plan-date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => loadPlansForDate(currentDate)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              Load Plans
            </button>
          </div>

          {/* Widget Controls */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowWidgetOptions(!showWidgetOptions)}
              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm transition-colors"
            >
              Customize Dashboard
            </button>
          </div>

          {/* Widget Options */}
          {showWidgetOptions && (
            <div className={`p-4 mb-6 rounded-lg ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h4 className="font-bold mb-3">Widget Options</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="drag-toggle"
                    checked={dragEnabled}
                    onChange={(e) => {
                      setDragEnabled(e.target.checked);
                      localStorage.setItem('dragEnabled', e.target.checked);
                    }}
                    className="mr-2"
                  />
                  <label htmlFor="drag-toggle">Enable drag-and-drop</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="animations-toggle"
                    checked={animationsEnabled}
                    onChange={(e) => {
                      setAnimationsEnabled(e.target.checked);
                      localStorage.setItem('animationsEnabled', e.target.checked);
                    }}
                    className="mr-2"
                  />
                  <label htmlFor="animations-toggle">Enable animations</label>
                </div>
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {plansData[currentDate]?.categories && Object.keys(plansData[currentDate].categories).length > 0 ? (
              Object.entries(plansData[currentDate].categories).map(([categoryId, categoryData]) => (
                <div
                  key={categoryId}
                  className={`p-4 rounded-lg shadow transition-all duration-300 hover:shadow-md ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-blue-500">{categoryData.name}</h3>
                    <button
                      onClick={() => openCategoryModal(categoryId)}
                      className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Task List */}
                  <ul className="space-y-2 mb-4 min-h-[50px]">
                    {categoryData.tasks.map((task, index) => (
                      <li
                        key={index}
                        className={`p-3 rounded flex justify-between items-center transition-all duration-300 ${task.completed ? 'opacity-70 line-through' : ''} ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
                      >
                        <span>{task.description}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleTaskComplete(categoryId, index)}
                            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                          >
                            {task.completed ? 'Undo' : 'Complete'}
                          </button>
                          <button
                            onClick={() => openTaskModal(categoryId, index)}
                            className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTask(categoryId, index)}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Add Task */}
                  <div className="flex mt-4">
                    <input
                      type="text"
                      placeholder="Add new task"
                      className={`flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      currentTheme === 'dark' 
        ? 'bg-gray-700 text-white placeholder-gray-300 border-gray-600' 
        : 'bg-white text-gray-800 placeholder-gray-400 border-gray-300'
    }`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          const newTask = {
                            description: e.target.value,
                            completed: false
                          };
                          setPlansData(prev => ({
                            ...prev,
                            [currentDate]: {
                              ...prev[currentDate],
                              categories: {
                                ...prev[currentDate].categories,
                                [categoryId]: {
                                  ...prev[currentDate].categories[categoryId],
                                  tasks: [...prev[currentDate].categories[categoryId].tasks, newTask]
                                }
                              }
                            }
                          }));
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector(`input[placeholder="Add new task"]`);
                        if (input?.value) {
                          const newTask = {
                            description: input.value,
                            completed: false
                          };
                          setPlansData(prev => ({
                            ...prev,
                            [currentDate]: {
                              ...prev[currentDate],
                              categories: {
                                ...prev[currentDate].categories,
                                [categoryId]: {
                                  ...prev[currentDate].categories[categoryId],
                                  tasks: [...prev[currentDate].categories[categoryId].tasks, newTask]
                                }
                              }
                            }
                          }));
                          input.value = '';
                        }
                      }}
                       className={`flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    currentTheme === 'dark' 
      ? 'bg-gray-700 text-white placeholder-gray-300 border-gray-600' 
      : 'bg-white text-gray-800 placeholder-gray-400 border-gray-300'
  }`}
                    >
                      Add
                    </button>
                  </div>

                  <button
                    onClick={() => deleteCategory(categoryId)}
                    className="mt-3 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                  >
                    Delete Category
                  </button>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-center py-4">
                No categories found. Add a category to get started.
              </p>
            )}
          </div>

          {/* Add Category Button */}
          <div className="flex justify-center">
            <button
              onClick={() => openCategoryModal()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              Add New Category
            </button>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl w-full max-w-md ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-xl font-semibold mb-4">
              {editingCategoryId ? 'Edit Category' : 'Add New Category'}
            </h3>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category name"
              className="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCategory}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl w-full max-w-md ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-xl font-semibold mb-4">
              {editingTaskId ? 'Edit Task' : 'Add New Task'}
            </h3>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Task description"
              className="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {plansData[currentDate]?.categories && Object.entries(plansData[currentDate].categories).map(([id, category]) => (
                <option key={id} value={id}>{category.name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTask}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DailyPlanner;