/***** ACCOUNT CRUD *****/

const Account = require('../models/Account');
const User = require('../models/User');

// GET ALL ACCOUNTS
module.exports.getAccounts_get = async (req, res) => {
    const accounts = await Account.find({}).populate("cardsRef");

    if (accounts) {
       await res.status(201).json(accounts);
    } else {
        await res.status(400).send('No account found');
    };
};

// GET ACCOUNT BY ACCOUNT ID
module.exports.getAccountById_get = async (req, res) => {
    const id = req.params.id;

    const account = await Account.findById({
        _id: id
    }).populate("cardsRef");

    if (account) {
        await res.status(201).send(account);
    } else {
        await res.status(400).send('This account doesn\'t exist');
    };
};


// GET A USER'S ACCOUNT(S) BY USER ID
module.exports.getUserAccounts_get = async (req, res) => {
    const userId = req.params.userId;

    const accounts = await Account.find({
        userId
    }).populate("cardsRef");

    await res.send(accounts);
};


// TODO: recheck validation !!!
// CREATE AN ACCOUNT
module.exports.createAccount_post = async (req, res) => {
    const userId = req.params.userId;

    const {
        accountName,
        balance,
        branchCode,
        counterCode,
        accountNumber,
        keyBIS,
        domiciliation,
        accountIBAN,
        accountBIC,
        accountType,
        canAddCard
    } = req.body;


    // check if accountName already exists for this user
    const checkAccountName = await Account.findOne({
        accountName: accountName
    });

    if (checkAccountName !== null ) {
        return res.status(400).send('An account is already registered to this name');
    };


    // check if accountNumber already exists
    const checkAccountNumber = await Account.findOne({
        accountNumber: accountNumber
    });

    if (checkAccountNumber !== null) {
        return res.status(400).send('An account is already registered to this account number');
    };

    // check if accountIBAN already exists
    const checkAccountIBAN = await Account.findOne({
        accountIBAN: accountIBAN
    });

    if (checkAccountIBAN !== null) {
        return res.status(400).send('An account is already registered to this IBAN');
    };
    console.log(checkAccountIBAN);

    // !!! balance is set to 10 by default on account creation, change amount in transactions crud or set amount in body !!!
    // cardsRef and canAddCard are updated on on card creation

    const account = new Account({
        accountName,
        balance,
        branchCode,
        counterCode,
        accountNumber,
        keyBIS,
        domiciliation,
        accountIBAN,
        accountBIC,
        accountType,
        userId,
        canAddCard
    });

    await account.save();


    // update accounts in user 
    const updateUserAccounts = await User.findByIdAndUpdate({
        _id: userId
    }, {
        $addToSet: {
            accounts: account._id
        }
    });
    await updateUserAccounts.save();

    await res.status(201).send({
        created_account: account.id,
        user_associated: account.userId
    });
};


// TODO: chain deletion
// DELETE ACCOUNT
module.exports.deleteAccount_delete = async (req, res) => {
    const id = req.params.id;

    try {
        const deleteAccount = await Account.deleteOne({
            _id: id
        });

        // TODO: update user
        // TODO: delete cards
        // TODO: delete transactions
        // TODO: update transactions ?

        await res.status(201).json(deleteAccount);
    } catch (err) {
        await res.status(400).send('An error occurred, account was not deleted');
    }
};