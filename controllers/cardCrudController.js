/***** CARD CRUD *****/

const Card = require('../models/Card');

const Account = require('../models/Account');

// TODO: ask for a new card, + block card if expired or on user's request
// TODO: check expiration date and update cardStatus when card is used


// GET ALL CARDS
module.exports.getCards_get = async (req, res) => {
    const cards = await Card.find({}).populate("accountRef").populate("cardHolder");

    if (cards) {
        await res.status(201).json(cards);
    } else {
        await  res.status(400).send('No card found')
    }
};

// GET CARD BY ID
module.exports.getCardById_get = async (req, res) => {
    const id = req.params.id;

    const card = await Card.findById({
        _id: id
    }).populate("accountRef").populate("cardHolder");

    if (card) {
        await  res.status(201).send(card);
    } else {
        await  res.status(400).send('This card doesn\'t exist');
    }
};

// GET A USER'S CARD(S) BY USER ID
module.exports.getUserCards_get = async (req, res) => {
    const cardHolder = req.params.cardHolder;

    const card = await Card.find({
        cardHolder
    }).populate("accountRef").populate("cardHolder");

    await res.send(card);
};


// GET A USER'S CARD(S) BY ACCOUNT REF
module.exports.getAccountCards_get = async (req, res) => {
    const accountRef = req.params.accountRef;

    const cards = await Card.find({
        accountRef
    }).populate("accountRef").populate("cardHolder");

    await res.send(cards);
};


// TEST : USERID FOR test4 = 62b43815c1687ee17ac1e9f0
// accountRef (account id) CREDIT = 62cb4275e74bedd85397c329
// accountRef (account id) SAVINGS = 62cb49c322e3c4aefe85c589
// CREATE A CARD LINKED TO AN ACCOUNT
module.exports.createCard_post = async (req, res) => {
    const accountRef = req.params.accountRef;
    const cardHolder = req.params.cardHolder;

    const {
        cardNumber,
        cardCVV,
        paymentNetwork,
        expirationDate,
    } = req.body;


    // check if card doesn't already exist
    const cardExists = await Card.findOne({
        cardNumber
    });

    if (cardExists) {
        return res.status(400).send('This card is already registered');
    };

    // check expirationDate (if = passed) and set cardStatus accordingly ( = expired)
    // 1) set expirationDate(from YYYY-mm in body to Date)
    const setExpirationDate = new Date(expirationDate);
    // 2) set current date
    const currentDate = new Date;
    // 3) NB use ternary assignment to assign conditional value to a const variable
    const cardStatus = (setExpirationDate <= currentDate ? 'Expired' : req.body.cardStatus);


    // VALIDATION LINKED TO ACCOUNT //
    // get account by id to validate card and update associated account 

    const account = await Account.findById({
        _id: accountRef
    });

    // check if accountType = Savings, no card creation and canAddCard = false
    if (account.accountType == 'Savings') {

        const noSavingsCard = await Account.findByIdAndUpdate({
            _id: accountRef
        }, {
            canAddCard: false
        });
        await noSavingsCard.save();

        return res.status(400).send('Your card cannot be associated to a savings account');
    }
    // TODO: recheck validation for 2 cards max if they're both valid ?
    // set limit of 2 cards by credit account (if account.canAddCard = false, no new card)
    if (account.cardsRef.length >= 2) {

        const updateCanAddCard = await Account.findByIdAndUpdate({
            _id: accountRef
        }, {
            canAddCard: false
        });

        await updateCanAddCard.save();
        return res.status(400).send('Two cards are already registered to this credit account');
    }
    // END VALIDATION LINKED TO ACCOUNT //

    // if validation is passed, save new card
    const card = new Card({
        cardNumber,
        cardCVV,
        accountRef,
        cardHolder,
        paymentNetwork,
        expirationDate: setExpirationDate,
        cardStatus
    });

    await card.save();

    // update cardsRef in account 
    const updateCardsRef = await Account.findByIdAndUpdate({
        _id: accountRef
    }, {
        $addToSet: {
            cardsRef: card._id
        }
    });
    await updateCardsRef.save();

    await res.status(201).send({
        created_card: card.id,
        card_status: card.cardStatus,
        associated_account: card.accountRef
    });
};

// TODO: chain deletion
// DELETE A CARD
module.exports.deleteCard_delete = async (req, res) => {
    const id = req.params.id;

    try {
        const deleteCard = await Card.deleteOne({
            _id: id
        });

        //TODO: update accounts (canAddCard)
        //TODO: transaction that has cardNumber as transactionRef

        

        await res.status(201).json(deleteCard);
    } catch (err) {
        await res.status(400).send('An error occurred, card was not deleted');
    }
};

//user/62d51ac5c3ee8e13ee6464fe/account/62d5263b9b2e38630c215af4
