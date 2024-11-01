const express = require('express');
const router = express.Router();

// Routes for user authentication

const {
    register,
    login,
    logout,
    dataGet,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/data', dataGet);
// router.put('/update-profile', authMiddleware, updateProfile);
// router.put('/update-password', authMiddleware, updatePassword);
// router.post('/forgot-password', forgotPassword);
// router.put('/reset-password/:token', resetPassword);

module.exports = router;