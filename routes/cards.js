const router = require('express').Router();

const cardCrudController = require('../controllers/cardCrudController');

// route = /api/cards/

// GET ALL Cards
router.get('/', cardCrudController.getCards_get);

// GET WITH FILTERS //
// get one card by its id
router.get('/:id', cardCrudController.getCardById_get);

// get all cards by user
router.get('/user/:cardHolder', cardCrudController.getUserCards_get);

// get all cards by account
router.get('/account/:accountRef', cardCrudController.getAccountCards_get);

// CREATE ACCOUNT CARD (for user, associated to account)
router.post('/user/:cardHolder/account/:accountRef', cardCrudController.createCard_post);

// DELETE CARD WITH CARD ID
router.delete('/delete/:id', cardCrudController.deleteCard_delete);

module.exports = router;