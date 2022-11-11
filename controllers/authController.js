/***** LOGIN + PROTECTION + LOG OUT *****/

const User = require('../models/User');

// to hash the password
const bcrypt = require('bcryptjs');

// to generate token
const jwt = require('jsonwebtoken');


/****** LOG IN METHOD ******/
// check email on login + compare password
module.exports.login_post = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // find user by email
    const user = await User.findOne({
        email
    });

    // check email
    if (!user) {
        return res.status(400).send('This email is not registered');
    };

    // check password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        return res.status(400).send('Invalid password');
    };

    // generate new leikode and update user
     const generateLK = require('../models/User').generateLeikode();

     let generatedCodes = await generateLK;
     let generatedCodesArr = Object.values(generatedCodes);
     const leikode = generatedCodesArr[0];
     const hashedLeikode = generatedCodesArr[1];
 
     const userLK = await User.findOneAndUpdate({
         email: user.email
     }, {
         leikode: hashedLeikode
     });
     await userLK.save();

    //  console.log('new leikode: ' + leikode + ' hashed LK: ' + hashedLeikode);


     // CREATE AND ASSIGN TOKEN (token contains user id)
    /* token should also have an expiration date, because stored in cookie that expires if session ends
    token's maxAge =  1 hour */
    const maxAge = 2 * 30 * 60;
    const token = jwt.sign({
        _id: user._id
    }, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    });


    // TOKEN IN COOKIE 
    // cookie's maxAge = 1 hour 
    // TODO: httponly for dev, and add secure for prod with https
    res.cookie('authToken', token, {
        // httpOnly: true,
        maxAge: maxAge * 1000,
        secure: true
    });

    // send user data + leikode if credentials are correct
    await res.status(201).send({
        user: user,
        generated_leikode: leikode
    });;
   
};


/****** PROTECT ROUTE METHOD ******/
module.exports.loggedRoute_get = async (req, res) => {
    await res.send({status: true, route_status: 'Access authorized', userId: req.user._id});
};

/****** LOG OUT METHOD ******/
module.exports.logout_get = async (req, res) => {
    await res.clearCookie('authToken', {
        // httpOnly: true,
        secure: true
    }).status(200).json({ message: 'User logged out successfully'});
};

