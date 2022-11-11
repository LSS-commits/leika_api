const mongoose = require('mongoose');

// One user can have several accounts
// One user can have several beneficiaries

// to hash leikode
const bcrypt = require('bcryptjs');

// User schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    // Generated on each login
    leikode: String,
    // add accounts ref
    accounts: [{ type: mongoose.Types.ObjectId, ref: 'account' }],

    // postal address for BIS (RIB), for ex ['85 bd de Monteux', '13005 Marseille' , 'FRANCE']
    address: [String],

    // recipient/beneficiary of wire transfer
    transferBeneficiaries: [{ 
        type: mongoose.Types.ObjectId, 
        ref: 'beneficiary' 
    }]
}, {
    timestamps: true
});


// Generated on each login
userSchema.statics.generateLeikode = async function generateLeikode() {
    // generate leikode
    const chars = "0123456789ABCDEFGHIJKLMNOPQSTUVWXYZabcdefghijklmnpqrstuvwxyz";
    const codeLength = 5;
    let createCode = "";

    for (let i = 0; i <= codeLength; i++) {
        let randomNumber = Math.floor(Math.random() * chars.length);
        createCode += chars.substring(randomNumber, randomNumber + 1);
    }

    // HASH LEIKODE
    const saltLK = await bcrypt.genSalt(8);
    const hashedLeikode = await bcrypt.hash(createCode, saltLK);

    // console.log('code = ' + createCode + '  hashedLK = ' + hashedLeikode);
    return ({
        createCode,
        hashedLeikode
    });
};

module.exports = mongoose.model('user', userSchema);