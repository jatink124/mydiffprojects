import React, { useState } from 'react';
import TaskForm from './components/TaskForm'; // Adjust path if necessary
import TaskList from './components/TaskList'; // Adjust path if necessary
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshTasks, setRefreshTasks] = useState(0); // State to trigger task list refresh

  const handleTaskAdded = () => {
    setRefreshTasks(prev => prev + 1); // Increment to trigger TaskList useEffect
    setSelectedTask(null); // Clear selected task after add/update
  };

  const handleEditTask = (task) => {
    setSelectedTask(task); // Set the task to be edited in the form
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to show form
  };

  const handleCancelEdit = () => {
    setSelectedTask(null); // Clear the selected task
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10">
          Advanced Task Manager
        </h1>
        <TaskList
          refreshTrigger={refreshTasks} // Pass refreshTrigger to TaskList
          onEditTask={handleEditTask}
        />
        <TaskForm
          selectedTask={selectedTask}
          onTaskAdded={handleTaskAdded}
          onCancelEdit={handleCancelEdit}
        />
     
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default App;