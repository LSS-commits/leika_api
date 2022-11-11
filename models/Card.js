const mongoose = require('mongoose');


// One user can have several accounts 
// One account can have several operations
// One credit account can have 2 cards max
// One card is linked to one account and to one user


const cardSchema = new mongoose.Schema({
    // DO NOT SET DOCUMENT ID, IT'S AUTOMATIC 
    
    // for ex 4275 3156 0372 5493
     cardNumber: String,

    // CVV = secret number at the back of the card
    // for ex 568
    cardCVV: String,

    accountRef: {
        type: mongoose.Types.ObjectId,
        ref: 'account'
    },
    cardHolder: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },

    // paymentNetwork = Visa or Mastercard or American Express
    paymentNetwork: {
        type: String,
        enum: ['Visa', 'Mastercard', 'American Express'] 
    },

    // limits (plafonds) for card payment. NOT NEEDED IN OUR CASE ?
    // limits: Number,

    // for ex 2024-03 (= Fri Mar 01 2024 01:00:00 GMT+0100 (heure normale d’Europe centrale))
    expirationDate: Date,
    
    // cardStatus = valid, blocked (user's request), expired (check date)
    cardStatus: {
        type: String,
        enum: ['Valid', 'Blocked', 'Expired']
    }
},{
    timestamps: true
}
);
 
module.exports = mongoose.model('card', cardSchema); 