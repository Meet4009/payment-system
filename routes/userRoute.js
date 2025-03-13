const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userServices = require('../services/userServices');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// page Render

router.get('/', userServices.renderHome);
router.get('/register', userServices.renderRegister);
router.get('/login', userServices.renderLogin);

// Import routes

// ✅ User Authentication Routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/logout', authMiddleware, userController.logout);

// ✅ User Profile Routes (Protected)
router
    .route('/profile')
    .get(authMiddleware, userController.getProfile)
    .put(authMiddleware, userController.updateProfile)
    .delete(authMiddleware, userController.deleteProfile);

router.put('/update-password', authMiddleware, userController.updatePassword);

// ✅ Password Reset Routes (Optional)
// router.post('/forgot-password', userController.forgotPassword);
// router.put('/reset-password/:token', userController.resetPassword);

// ✅ Admin Routes (Protected & Restricted)
router.use(authMiddleware, authorizeRoles("admin"));

router.route('/')
    .get(userController.getAllUsers); // Get all users

router
    .route('/:id')
    .get(userController.getUserById)  // Get single user
    .put(userController.updateUser)   // Update user
    .delete(userController.deleteUser); // Delete user

module.exports = router;



// http://localhost:5656/api/v1/user/
