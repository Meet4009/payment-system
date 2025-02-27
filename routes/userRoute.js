const express = require('express');
const router = express.Router();

// Routes for user authentication

const userController = require('../controllers/userController');

const services = require('../services/userServices');

const auth = require('../middleware/auth');


// API routes

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/logout', auth.authMiddleware, userController.logout);
router.get('/profile', auth.authMiddleware, userController.getProfile);
router.put('/profile-update', auth.authMiddleware, userController.updateProfile);
router.put('/update-password', auth.authMiddleware, userController.updatePassword);
router.get('/delete', auth.authMiddleware, userController.deleteProfile);
// router.post('/forgot-password', userController.forgotPassword);
// router.put('/reset-password/:token', userController.resetPassword);

router.get('/', auth.authMiddleware, auth.authorizeRoles("admin"), userController.getAllUsers);
router.get('/:id', auth.authMiddleware, auth.authorizeRoles("admin"), userController.getUserById);
router.put('/:id', auth.authMiddleware, auth.authorizeRoles("admin"), userController.updateUser);
router.delete('/:id', auth.authMiddleware, auth.authorizeRoles("admin"), userController.deleteUser);

module.exports = router;