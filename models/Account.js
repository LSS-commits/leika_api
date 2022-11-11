const mongoose = require('mongoose');


// One user can have several accounts
// One account can have several operations
// One credit account can have two cards max


const accountSchema = new mongoose.Schema({
    // DO NOT SET DOCUMENT ID, IT'S AUTOMATIC

    // for ex Main, Secondary, Savings, Shared
    accountName: String,

    // balance = sum of all associated transactions
    // set to 10 by default and increment/decrement
    // TODO: set bank overdraft (300 for credit and 10 for savings)
    balance: {
        type: Number,
        default: 10
    },

    // info for bank id statement (RIB) //
    // établissement for ex 56898
    branchCode: String,
    // guichet for ex 01258
    counterCode: String,
    // n° de compte for ex 1245786T912
    accountNumber: String,
    // clé RIB for ex 46
    keyBIS: String,
    // domiciliation for ex LEIKA BANK BORDEAUX FINANCIAL CENTRE
    domiciliation: String,
    ////////////////////////////////////

    // ONLY FOR CREDIT ACCOUNT !
    // for ex FR4520067895325685472T25786
    accountIBAN: String,
    // for ex PSSTFRPPBOR for LEIKA BANK FR
    accountBIC: String,

    // accountType = credit or savings (if accountType = savings, no card)
    accountType: {
        type: String,
        enum: ['Credit', 'Savings']
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },

    // user can have 2 cards max by credit account (cards array)
    cardsRef: [{
        type: mongoose.Types.ObjectId,
        ref: 'card'
    }],

    // if user already has two cards linked to a credit account, canAddCard = false
    canAddCard: Boolean
}, {
    timestamps: true
});


module.exports = mongoose.model('account', accountSchema);