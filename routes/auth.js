const router = require('express').Router();

const authController = require('../controllers/authController');

// to protect a route, use authMiddleware
const { requireAuth } = require('../middlewares/authMiddleware');

// DON'T USE SAME ROUTES FOR SAME METHODS = for example get /logged blocks get /logout

// NB: full route is .../api/auth/...

// LOGIN
// check email + password on login + generate leikode and cookie with token  on login
router.post('/login', authController.login_post);

// PROTECTED ROUTE
router.get('/protected/logged', requireAuth, authController.loggedRoute_get);


// TODO: PROTECT THIS ROUTE ???
/* TODO: there should be a log out method as POST for when user clicks on the button (but what is sent as payload to the server ???)
 and a log out method as GET when the user is automatically logged out ? */

// LOG OUT 
router.get('/logout', authController.logout_get);


module.exports = router;