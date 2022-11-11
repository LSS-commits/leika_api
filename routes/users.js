const router = require('express').Router();

const userCrudController = require('../controllers/userCrudController');

// to protect a route, use authMiddleware
// const { requireAuth } = require('../middlewares/authMiddleware');

// DON'T USE SAME ROUTES FOR SAME METHODS = for example get /:id blocks get /:email

// NB: full route is .../api/users/...


// GET ALL USERS
router.get('/', userCrudController.getUsers_get);

// GET USER LOGGED BY ID
router.get('/:id', userCrudController.getUserById_get);

// REGISTER (for test)
router.post('/register', userCrudController.registerUser_post);

// DELETE ONE USER
router.delete('/delete/:id', userCrudController.deleteUser_delete);


module.exports = router;