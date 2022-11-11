const mongoose = require('mongoose');

// One user can have several accounts 
// One account can have several operations
// One operation can be linked to one account

const transactionSchema = new mongoose.Schema({
    // DO NOT SET DOCUMENT ID, IT'S AUTOMATIC 

    // can be recipient account for wire transfer
    title: {
        type: String
    },
    amount: {
        type: Number
    },
    isAmountNegative: Boolean,

    submissionDate: {
        // Date = 2022-07-01 00:00:00
        type: Date
    },

    // associated account (parameter of request)
    accountRef: {
        type: mongoose.Types.ObjectId,
        ref: 'account'
    },

    // transactionType = card or direct debit or wire transfer
    transactionType: {
        type: String,
        enum: ['Card', 'Direct Debit', 'Wire Transfer']
    },
    // card number reference (check card) or direct debit reference or wire transfer note
    transactionRef: {
        type: String
    },

    // recipient account in case of wire transfer validated
    targetAccount: String,

    // transactionStatus = incoming or pending (to be validated) or past or rejected
    transactionStatus: {
        type: String,
        enum: ['Incoming', 'Pending', 'Past', 'Rejected']
    },

    // PENDING TRANSACTION
    // userValidationStatus (user validates pending transactions with leikode) = pending, cancelled, validated 
    userValidationStatus: {
        type: String,
        enum: ['Pending', 'Cancelled', 'Validated']
    },

    // bankValidationStatus (after user validation, bank validates if balance is ok + if leikode is invalid)
    bankValidationStatus: Boolean,

    // INCOMING TRANSACTION
    estimatedDate: Date,

    // PAST TRANSACTION
    category: {
        type: String,
        enum: ['Digital', 'Family', 'Groceries', 'Healthcare', 'Housing', 'Leisure', 'Mobility', 'Savings', 'Other']
    },

    // REJECTED TRANSACTION
    // rejectionReason = invalid leikode (?), user declined or insufficient funds/balance
    rejectionReason: {
        type: String,
        enum: ['Invalid Leikode', 'User Declined', 'Insufficient Funds']
    }
});

module.exports = mongoose.model('transaction', transactionSchema);