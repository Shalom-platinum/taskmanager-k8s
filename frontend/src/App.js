import React, { useState, useEffect } from 'react';
import './App.css';

// Use relative URL so nginx can proxy to backend
const API_URL = process.env.REACT_APP_API_URL || '/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask })
      });
      const task = await response.json();
      setTasks([task, ...tasks]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t._id === id ? updatedTask : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="App">
      <div className="container">
        <h1>📝 Task Manager</h1>
        <p className="subtitle">Powered by Kubernetes</p>
        
        <form onSubmit={addTask} className="add-task-form">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter a new task..."
            className="task-input"
          />
          <button type="submit" className="add-btn">Add Task</button>
        </form>

        <div className="tasks-list">
          {tasks.length === 0 ? (
            <p className="no-tasks">No tasks yet. Add one above!</p>
          ) : (
            tasks.map(task => (
              <div key={task._id} className="task-item">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task._id, task.completed)}
                />
                <span className={task.completed ? 'completed' : ''}>
                  {task.title}
                </span>
                <button onClick={() => deleteTask(task._id)} className="delete-btn">
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;