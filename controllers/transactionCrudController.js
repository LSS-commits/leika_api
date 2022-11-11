/***** TRANSACTION CRUD *****/

const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const Account = require('../models/Account');

// TODO: update balance of account = sum of all associated transactions (including transfer made or received)
// TODO: update transferHistory in beneficiary

// TODO: wire transfer method
/* wire transfer is either made on a leika bank = change balance of sender account and recipient account
or made on an external account = change balance of sender account 
+ set new amount in beneficiary account
+ no wire transfer possible on someone else's savings account !!!
*/

// GET ALL TRANSACTIONS
module.exports.getTransactions_get = async (req, res) => {
    const transactions = await Transaction.find({}).populate("accountRef");

    if (transactions) {
        await res.status(201).json(transactions);
    } else {
        await res.status(400).send('No transaction found');
    };
};

// GET TRANSACTIONS BY ACCOUNT
module.exports.getAccountTransactions_get = async (req, res) => {
    const accountRef = req.params.accountRef;

    const transactions = await Transaction.find({ accountRef }).populate("accountRef");

    if (transactions) {
        await res.status(201).json(transactions);
    } else {
        await res.status(400).send('No transaction found');
    };
};

// GET TRANSACTIONS BY ACCOUNT, STATUS AND DATE (desc)
module.exports.getAccountTransactionsFiltered_get = async (req, res) => {
    // account and status as params
    const { accountRef, transactionStatus } = req.params;

    // sort by date in descending order and populate
    const transactions = await Transaction.find({ accountRef, transactionStatus}).sort({submissionDate: 'desc'}).populate("accountRef");
    
    if (transactions) {
        await  res.status(201).json(transactions);
    } else {
        await  res.status(400).send('No transaction found');
    };
};

// TEST WITH CREDIT ACCOUNT OF test4 = 62cb4275e74bedd85397c329
// CREATE TRANSACTIONS = PAST, INCOMING, PENDING (not transfer), REJECTED (not transfer) 
module.exports.createGenericTransaction_post = async (req, res) => {
    const accountRef = req.params.accountRef;

    const {
        title,
        amount,
        submissionDate,
        transactionType,
        transactionRef,
        transactionStatus,
        estimatedDate,
        category,
        // FOR FAKE REJECTED TRANSACTIONS
        rejectionReason
    } = req.body;

    // account type can't be Savings 
    const checkAccountType = await Account.findById({ _id: accountRef});
    if(checkAccountType.accountType == "Savings"){
        return res.status(400).send('This type of transaction can\'t be performed with a Savings account');
    };

    // set isAmountNegative boolean
    // [or if Math.sign(amount) == -1 (negative number)]
    const isAmountNegative = (amount < 0 ? true : false);

    // check submissionDate
    const currentDate = new Date;
    const setSubmissionDate = new Date(submissionDate);

    // NO VALIDATION BECAUSE PREVENTS FROM CREATING FUTURE TRANSACTIONS
    // validate submissionDate (can't be future) OK
    // if (setSubmissionDate > currentDate) {
    //     return res.status(400).send('Submission date is incorrect (can\'t be in the future)');
    // };


    // transactionType can't be wire transfer
    if (transactionType == "Wire Transfer") {
        return res.status(400).send('Wire transfers can\'t be initiated here');
    };


    // if transactionType = Card, check that cardNumber exists + card is valid 
    if (transactionType == "Card") {
        const findCard = await Card.findOne({
            cardNumber: transactionRef
        });

        if (findCard) {
            if (findCard.cardStatus !== "Valid") {
                return res.status(400).send('Transaction can\'t be associated to an invalid card (card is either blocked or expired)');
            };
        } else {
            return res.status(400).send('This card is not registered');
        }
    };

    // IF STATUS IS PENDING: transactionType must be card + valid card
    if (transactionStatus == "Pending") {
        const findCard = await Card.findOne({
            cardNumber: transactionRef
        });

        if (transactionType !== "Card") {
            return res.status(400).send('Pending transaction must be associated to a card');
        };

        if (findCard) {
            if (findCard.cardStatus !== "Valid") {
                return res.status(400).send('Pending transaction can\'t be associated to an invalid card (card is either blocked or expired)');
            };
        } else {
            return res.status(400).send('This card is not registered');
        };
    };


    // check emissionDate
    // IF STATUS IS INCOMING: estimatedDate can't be in the past + must be after submissionDate 
    let setEstimatedDate = "";
    if (estimatedDate) {
        setEstimatedDate = new Date(estimatedDate);
        if (setEstimatedDate <= setSubmissionDate) {
            return res.status(400).send('Estimated date must be later than submission date');
        };

        if (setEstimatedDate <= currentDate) {
            return res.status(400).send('Estimated date must be future');
        };
    };


    // FOR FAKE REJECTED TRANSACTIONS: rejectionReason = Insufficient Funds

    const transaction = new Transaction({
        title,
        amount,
        isAmountNegative,
        submissionDate: setSubmissionDate,
        accountRef,
        transactionType,
        transactionRef,
        transactionStatus,
        estimatedDate: setEstimatedDate,
        category,
        rejectionReason
    });

    await transaction.save();

    // TODO: check limit/bank overdraft (300 for credit, 10 for savings) 

    // update account balance (only for Past transactions)
    if (transaction.transactionStatus == "Past") {
        const updateAccountBalance = await Account.findOneAndUpdate({
            _id: accountRef
        }, {
            $inc: {
                balance: amount
            }
        });

        await updateAccountBalance.save();
    }

    await res.status(201).send({
        created_transaction: transaction.id
    });
};



// TODO: CREATE WIRE TRANSFERS (with credit and savings account)
// wire transfer becomes incoming
/* TODO: title = accountName or number, submissionDate = now, transactionType = wire transfer, targetAccount = param, transactionRef = body, category = select category in front form, estimatedDate, bankValidationStatus */
// update beneficiary transferHistory


// VALIDATE PENDING TRANSACTION IN LEIKODE CONTROLLER






// TODO: UPDATE INCOMING TRANSACTION = CHECK ESTIMATED DATE + CHANGE ACCOUNT BALANCE










// TODO: chain deletion
// DELETE TRANSACTION
module.exports.deleteTransaction_delete = async (req, res) => {
    const id = req.params.id;

    try {
        // find transaction and update account and beneficiaries before deletion
        const findTransaction = await Transaction.findOne({
            _id: id
        });

        //TODO: update account balance (if transactionStatus = Past) CHECK
        if (findTransaction.transactionStatus == 'Past') {
            const updateAccountBalance = await Account.findOneAndUpdate({
                _id: findTransaction.accountRef
            }, {
                $inc: {
                    balance: -findTransaction.amount
                }
            });

            await updateAccountBalance.save();
        }


        // TODO: update beneficiary (wire transfer)


        // delete transaction
        const deleteTransaction = await Transaction.deleteOne({
            _id: id
        });

        await res.status(201).json(deleteTransaction);
    } catch (err) {
        await res.status(400).send('An error occurred, transaction was not deleted');
    }
};