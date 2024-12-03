import { Router } from 'express';
import bcrypt from 'bcrypt'; // สำหรับการเข้ารหัสรหัสผ่าน

const router = Router();

// Mock data storage for users
let users = []; // Array for storing user data

// Insert one user
const createUser = async (req, res) => {
    const { Email, Password, Role } = req.body;

    if (!Email || !Password || !Role) {
        return res.status(400).json({ error: 'Email, Password, and Role are required.' });
    }

    try {
        const newUser = {
            UserID: users.length + 1, // Auto-increment UserID
            Email,
            Password: await bcrypt.hash(Password, 10),
            Role,
        };
        
        users.push(newUser); // Add new user to the mock data array
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'An error occurred while creating the user.', details: err.message });
    }
};

// Update one user
const updateUser = async (req, res) => {
    const { id } = req.params; // Extract UserID from URL parameters
    const { Email, Password, Role } = req.body;

    const userIndex = users.findIndex(user => user.UserID === Number(id));

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found!' });
    }

    const dataToUpdate = {
        Email: Email ?? users[userIndex].Email,
        Role: Role ?? users[userIndex].Role,
    };

    // Only hash password if it is provided
    if (Password) {
        dataToUpdate.Password = await bcrypt.hash(Password, 10);
    }

    users[userIndex] = {
        ...users[userIndex],
        ...dataToUpdate
    };

    res.status(200).json(users[userIndex]);
};

// Delete user by id
const deleteUser = async (req, res) => {
    const id = req.params.id;
    const userIndex = users.findIndex(user => user.UserID === Number(id));

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found!' });
    }

    const deletedUser = users.splice(userIndex, 1);
    res.status(200).json(deletedUser[0]);
};

// Get all users
const getUsers = async (req, res) => {
    res.status(200).json(users);
};

// Get a user by id
const getUser = async (req, res) => {
    const id = req.params.id;
    const user = users.find(user => user.UserID === Number(id));

    if (!user) {
        return res.status(404).json({ message: 'User not found!' });
    }

    res.status(200).json(user);
};

// Search users by Email
const searchUsersByEmail = async (req, res) => {
    const searchTerm = req.params.term.trim(); // Trim leading/trailing spaces

    if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required.' });
    }

    const filteredUsers = users.filter(user => user.Email.includes(searchTerm));

    if (filteredUsers.length === 0) {
        return res.status(404).json({ message: 'No users found with the provided email!' });
    }

    res.status(200).json(filteredUsers);
};

// Define routes
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/users/:id', getUser);
router.get('/users', getUsers);
router.get('/users/q/:term', searchUsersByEmail);

export default router;
