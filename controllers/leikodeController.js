const User = require('../models/User');
// to decrypt leikode
const bcrypt = require('bcryptjs');

// VALIDATE PENDING TRANSACTION
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// CHECK USER'S LEIKODE TO VALIDATE TRANSACTIONS
module.exports.leikode_post = async (req, res) => {
    const user = await User.findById({
        _id: req.user._id
    });

    const leikode = req.body.leikode;

    if (!leikode) {
        return res.status(400).send('Please enter your Leikode');
    }

    const validLeikode = await bcrypt.compare(leikode, user.leikode);
    if (!validLeikode) {
        return res.status(400).send('Invalid Leikode');
    }
    await res.status(201).send({
        message: 'Your transaction has been validated'
    });
};


// VALIDATE PENDING TRANSACTION (LEIKODE VALIDATION)
module.exports.validatePendingTransaction_post = async (req, res) => {
    // get pending transaction + userId (in front, click on validate transaction)
    // transaction id + userId as params
    const {
        id,
        userId
    } = req.params;

    // get user leikode to compare with leikode in db
    const user = await User.findById({
        _id: userId
    });

    const {
        leikode,
        userValidationStatus
    } = req.body;


    // TODO: create fake notification in front to get leikode

    // leikode validation
    // if form is empty
    if (!leikode) {
        return res.status(400).send('Please enter your Leikode');
    };

    // check leikode
    const validLeikode = await bcrypt.compare(leikode, user.leikode);

    // leikode is invalid
    if (!validLeikode) {

        const blockedTransaction = await Transaction.findByIdAndUpdate({
            _id: id
        }, {
            transactionStatus: 'Rejected',
            bankValidationStatus: false,
            rejectionReason: 'Invalid Leikode'
        });

        await blockedTransaction.save();
        return res.send({
            message: 'Invalid Leikode. Transaction is rejected'
        });
    };


    // user cancels (send cancelled status via click on cancel button)
    if (userValidationStatus == "Cancelled") {

        const cancelledTransaction = await Transaction.findByIdAndUpdate({
            _id: id
        }, {
            userValidationStatus: 'Cancelled',
            transactionStatus: 'Rejected',
            rejectionReason: 'User Declined'
        });

        await cancelledTransaction.save();
        return res.send({
            message: 'You\'ve declined the transaction. Transaction is rejected'
        });
    };


    const checkTransaction = await Transaction.findById({
        _id: id
    });


    // check account balance (-300 max)
    const checkAccountBalance = await Account.findById({_id: checkTransaction.accountRef._id});

   if (checkAccountBalance.balance <= -299) {
    const rejectedTransaction = await Transaction.findByIdAndUpdate({
        _id: id
    }, {
        transactionStatus: 'Rejected',
        bankValidationStatus: false,
        rejectionReason: 'Insufficient Funds'
    });

    await rejectedTransaction.save();
    return res.send({
        message: 'Insufficient Funds. Transaction is rejected'
    });
   };

   // set estimatedDate = 5 days after validation
   const estimatedDate = new Date();
   estimatedDate.setDate(estimatedDate.getDate() + 5);

    // if success 
    const validateTransaction = await Transaction.findByIdAndUpdate({
        _id: id
    }, {
        transactionStatus: 'Incoming',
        userValidationStatus: 'Validated',
        bankValidationStatus: true,
        estimatedDate
    });
    await validateTransaction.save();


    await res.status(201).send({
        message: 'Your transaction has been validated'
    });
};
