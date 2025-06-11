const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for users (replace with database in production)
let users = [
  {
    id: 1,
    name: 'John Doe',
    age: 30,
    post: 'Software Engineer',
    salary: 75000
  }
];
let nextId = 2;

// Get all users
app.get('/api/users', (req, res) => {
  try {
    console.log('GET /api/users - Fetching all users');
    console.log('Current users:', users);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add a new user
app.post('/api/users', (req, res) => {
  try {
    console.log('POST /api/users - Adding new user');
    console.log('Request body:', req.body);
    
    const { name, age, post, salary } = req.body;
    
    // Validate required fields
    if (!name || !age || !post || !salary) {
      console.log('Error: All fields are required');
      return res.status(400).json({ 
        error: 'All fields (name, age, post, salary) are required' 
      });
    }

    // Validate data types
    if (typeof age !== 'number' || typeof salary !== 'number') {
      return res.status(400).json({ 
        error: 'Age and salary must be numbers' 
      });
    }
    
    const newUser = {
      id: nextId++,
      name,
      age,
      post,
      salary
    };
    
    users.push(newUser);
    console.log('New user added:', newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Update a user
app.put('/api/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, age, post, salary } = req.body;
    
    console.log(`PUT /api/users/${userId} - Updating user`);
    console.log('Request body:', req.body);

    // Validate required fields
    if (!name || !age || !post || !salary) {
      return res.status(400).json({ 
        error: 'All fields (name, age, post, salary) are required' 
      });
    }

    // Validate data types
    if (typeof age !== 'number' || typeof salary !== 'number') {
      return res.status(400).json({ 
        error: 'Age and salary must be numbers' 
      });
    }

    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = {
      id: userId,
      name,
      age,
      post,
      salary
    };

    users[userIndex] = updatedUser;
    console.log('User updated:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
app.delete('/api/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log(`DELETE /api/users/${userId} - Deleting user`);

    // Find the user first
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      console.log(`User with ID ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Store the user before deleting
    const deletedUser = users[userIndex];
    
    // Remove the user from the array
    users = users.filter(user => user.id !== userId);
    
    console.log('User deleted:', deletedUser);
    console.log('Remaining users:', users);
    
    // Send the deleted user back in the response
    res.json(deletedUser);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test the server at: http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- GET    /api/users');
  console.log('- POST   /api/users');
  console.log('- PUT    /api/users/:id');
  console.log('- DELETE /api/users/:id');
});
