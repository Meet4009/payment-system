const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const upload = require("../middleware/multerConfig");

// Import routes

// ✅ User Authentication Routes
router.post('/register',upload.single("profileImage"), userController.register);
router.post('/login', userController.login);
router.get('/logout', authMiddleware, userController.logout);

// ✅ User Profile Routes (Protected)
router
    .route('/profile')
    .get(authMiddleware, userController.getProfile)
    .put(authMiddleware, userController.updateProfile)
    .delete(authMiddleware, userController.deleteProfile);

router.put('/update-password', authMiddleware, userController.updatePassword);

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
