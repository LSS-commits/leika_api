const router = require('express').Router();

const beneficiaryCrudController = require('../controllers/beneficiaryCrudController');

// NB: full route is /api/beneficiaries/...

// GET ALL BENEFICIARIES
router.get('/', beneficiaryCrudController.getBeneficiaries_get);

// GET WITH FILTERS //
// get one beneficiary by its id
router.get('/:id', beneficiaryCrudController.getBeneficiaryById_get);

// CREATE A BENEFICIARY
router.post('/user/:userId', beneficiaryCrudController.createBeneficiary_post);

// DELETE BENEFICIARY WITH ACCOUNT ID
router.delete('/delete/:id', beneficiaryCrudController.deleteBeneficiary_delete);

module.exports = router;