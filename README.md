# Leika Bank API
This is the back-end code for the Leika banking application. API built with Node.js, Express.js, MongoDB and Mongoose.

[Leika API](https://leika-api.onrender.com/)

# Overview
- Users ans their associated accounts, cards and transactions
- Token generated server-side and stored in a session cookie that is then sent to the browser to secure the authentication
- Use of session storage to add a user verification layer and generate a validation code with each new login

# Also used
- Jsonwebtoken to generate authentication tokens with each new login
- cookieparser to manage cookies (create cookies server-side and send to client)
- bcrypt

# Proposed improvements
- TODO
    - adapt code according to the new functionalities of the front-end app
    - add an authentication process to access the mock data ?

- Code quality
    - tidy up files
    - redistribute the different functionalities for better performance and scalability
    - make it possible for other developers who would want to build a free and open-source mock banking app to visualize, create and handle data through the Leika API (as with Stripe or Paypal for developers)
    - switch to PostgreSQL to handle associated data
    
# Front-end code
The code for the front-end application: [Leika app](https://github.com/LSS-commits/leika_app)



