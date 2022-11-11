const mongoose = require('mongoose');

// One user can have several beneficiaries (wire transfer recipients)
// One beneficiary can be linked to one user

const beneficiarySchema = new mongoose.Schema({

    // for ex FR4520067895325685472T25786
    accountIBAN: String,

    // these two can be the same
    beneficiaryName: String,
    accountTitle: String,

    // populate with info from transfer transaction
    transferHistory: [{
        type: mongoose.Types.ObjectId,
        ref: 'transaction'
    }],

    // put associated user id
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    }
},{
    timestamps: true
});

module.exports = mongoose.model('beneficiary', beneficiarySchema);