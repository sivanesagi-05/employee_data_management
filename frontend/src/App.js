// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import './App.css';

// API base URL
const API_BASE_URL = 'http://localhost:3005';

function App() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    post: '',
    salary: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/users`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }
      
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Convert age and salary to numbers, but handle empty values
    if (name === 'age' || name === 'salary') {
      processedValue = value === '' ? '' : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate form data
      if (!formData.name || !formData.age || !formData.post || !formData.salary) {
        setError('All fields are required');
        return;
      }

      const userData = {
        name: formData.name,
        age: Number(formData.age),
        post: formData.post,
        salary: Number(formData.salary)
      };

      console.log('Sending data to server:', userData);

      const url = editingUser 
        ? `${API_BASE_URL}/api/users/${editingUser.id}`
        : `${API_BASE_URL}/api/users`;
      
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const savedUser = await response.json();
      console.log('Server response:', savedUser);

      if (editingUser) {
        setUsers(users.map(user => 
          user.id === savedUser.id ? savedUser : user
        ));
      } else {
        setUsers([...users, savedUser]);
      }

      // Reset form
      setFormData({
        name: '',
        age: '',
        post: '',
        salary: ''
      });
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.message || 'Failed to save user. Please try again.');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      age: user.age,
      post: user.post,
      salary: user.salary
    });
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      console.log(`Attempting to delete user with ID: ${userId}`);
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const deletedUser = await response.json();
      console.log('Successfully deleted user:', deletedUser);
      
      // Update the users list
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setError(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(`Failed to delete user: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      age: '',
      post: '',
      salary: ''
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Employee Management System</h1>
      
      {error && <div className="error">{error}</div>}
      
      <div className="form-container">
        <h2>{editingUser ? 'Edit Employee' : 'Add New Employee'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="age">Age:</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Enter age"
              min="18"
              max="100"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="post">Position:</label>
            <input
              type="text"
              id="post"
              name="post"
              value={formData.post}
              onChange={handleInputChange}
              placeholder="Enter position"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="salary">Salary:</label>
            <input
              type="number"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              placeholder="Enter salary"
              min="0"
              required
            />
          </div>
          
          <div className="button-group">
            <button type="submit" className="submit-btn">
              {editingUser ? 'Update Employee' : 'Add Employee'}
            </button>
            {editingUser && (
              <button type="button" onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="users-container">
        <h2>Employee List</h2>
        {users.length === 0 ? (
          <p>No employees found</p>
        ) : (
          <div className="users-grid">
            {users.map(user => (
              <div key={user.id} className="user-card">
                <h3>{user.name}</h3>
                <div className="user-details">
                  <p><strong>Age:</strong> {user.age} years</p>
                  <p><strong>Position:</strong> {user.post}</p>
                  <p><strong>Salary:</strong> ${user.salary.toLocaleString()}</p>
                </div>
                <div className="user-actions">
                  <button 
                    onClick={() => handleEdit(user)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

