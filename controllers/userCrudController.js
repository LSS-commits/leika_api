/***** USER CRUD *****/

const User = require('../models/User');

const Account = require('../models/Account');

const Beneficiary = require('../models/Beneficiary');

// to hash the password
const bcrypt = require('bcryptjs');


// GET ALL USERS
module.exports.getUsers_get = async (req, res) => {
    const users = await User.find({}).populate("accounts").populate("transferBeneficiaries");

    
    if (users) {
        await res.status(201).json(users);
    } else {
        await res.status(400).send('No user found')
    }
};

// GET USER BY ID
module.exports.getUserById_get = async (req, res) => {
    const id = req.params.id;
    const loggedUser = await User.findById({_id : id}).populate("accounts").populate("transferBeneficiaries");
    await res.send(loggedUser);
};

// REGISTER ONE USER (FOR APP TESTS)
// USER ALREADY HAS USERNAME EMAIL PASSWORD AND LEIKODE, GENERATE NEW LEIKODE ON EACH LOGIN
module.exports.registerUser_post = async (req, res) => {
    const {
        username,
        email,
        password,
        address
    } = req.body;

    // CUSTOM VALIDATION BEFORE CREATION
    // all fields given ?
    if (!username || !email || !password || !address) {
        res.send('User was not created, one or several fields missing');
        return;
    }

    // email is valid ?
    // Email validation pattern
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const validEmail = emailRegex.test(email);

    if (!validEmail) {
        return res.status(400).send('Please enter a valid email');

    }

    // user already exists in the db ?
    const emailExists = await User.findOne({
        email
    });

    if (emailExists) {
        return res.status(400).send('This user is already registered');
    };


    // password is at least 8 ?
    if (password.length < 8) {
        return res.status(400).send('Password should be at least 8 characters');
    };

    // END VALIDATION


    // HASH THE PASSWORD (create a salt and hash the pw, pw = salt + hash with the salt, that only bcrypt can decrypt)
    const saltPW = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltPW);

    // create new user
    const user = new User({
        username,
        email,
        password: hashedPassword,
        address
    });

    // save user
    await user.save();

    await res.status(201).send({
        created_user: user.id
    });

};


// TODO: chain deletion CHECK
// DELETE ONE USER (by id)
module.exports.deleteUser_delete = async (req, res) => {
    const id = req.params.id;

    try {
        const deleteUser = await User.deleteOne({
            _id: id
        });

        // TODO: delete account CHECK
        const deleteAccount = await Account.deleteMany({ userId: id });

        // TODO: delete beneficiary CHECK
        const deleteBeneficiaries = await Beneficiary.deleteMany({ userId: id })


        await  res.status(201).json({deleteUser, deleteAccount, deleteBeneficiaries});

    } catch (err) {
        await  res.status(400).send('An error occurred, user was not deleted');
    }
};
