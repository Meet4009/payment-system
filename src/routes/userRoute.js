const express = require('express');
const router = express.Router();

// Routes for user authentication

const {
    register,
    login,
    logout,
    updateProfile,
    getProfile,
    updatePassword,
    deleteProfile,
    forgotPassword,
    resetPassword,
    getAllUsers,
    getUserById
} = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', authMiddleware, logout);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile-update', authMiddleware, updateProfile);
router.put('/update-password', authMiddleware, updatePassword);
router.get('/delete', authMiddleware, deleteProfile);
// router.post('/forgot-password', forgotPassword);
// router.put('/reset-password/:token', resetPassword);

router.get('/users', authMiddleware, authorizeRoles("admin"), getAllUsers);
router.get('/user/:id', authMiddleware, authorizeRoles("admin"), getUserById);

module.exports = router;