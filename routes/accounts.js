const router = require('express').Router();

const accountCrudController = require('../controllers/accountCrudController');

// NB: full route is /api/accounts/...


// GET ALL ACCOUNTS
router.get('/', accountCrudController.getAccounts_get);


// GET WITH FILTERS //
// get one account by its id
router.get('/:id', accountCrudController.getAccountById_get);

// get all accounts of one user
router.get('/user/:userId', accountCrudController.getUserAccounts_get);

// CREATE USER ACCOUNT WITH USER ID
router.post('/user/:userId', accountCrudController.createAccount_post);

// DELETE ACCOUNT WITH ACCOUNT ID
router.delete('/delete/:id', accountCrudController.deleteAccount_delete);


module.exports = router;