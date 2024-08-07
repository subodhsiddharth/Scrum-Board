const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { MongoClient } = require('mongodb')
const { generateCode } = require('../utils/hashcode')

// CONSTANTS USED IN THIS FILE
const URL = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017' // MongoDB URL
const DB = process.env.MONGODB_NAME || 'test'  // MongoDB Database Name
const JWT_SECRET = process.env.JWT_SECRET || 'goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu' // JWT Secret
const SALTROUND = process.env.ROUND || 15 // Bcrypt Salt Round
const USER = process.env.USER || 'user' // MongoDB Collection Name
const UNIVERSALERROR = 'Universal error'  // Error Message
const INTERNALSERVERERROR = 'Internal server error'  // Error Message
const USERNOTFOUND = 'User not found'  // Error Message
const MESSAGE = 'Working fine!!'  // Error Message
const OK = 'OK' // Status Message
const KO = 'KO' // Status Message
const REQUESTBODYNOTVALID = 'Request body is not valid' // Error Message
const REQUESTBHEADERNOTVALID = 'Request header is not valid' // Error Message
const USERNAMEORPASSWORDISEMPTY = 'Username or password is empty' // Error Message
const PASSWORDMUSTBEATLEAST8CHARACTERS = 'Password must be at least 8 characters' // Error Message
const USERNAMEMUSTBEATLEAST4CHARACTERS = 'Username must be at least 4 characters' // Error Message
const USERNAMEISINVALID = 'Username is invalid' // Error Message
const USERNAMEMUSTBELESSTHAN20CHARACTERS = 'Username must be less than 20 characters' // Error Message
const USERNAMEMUSTBEALPHANUMERIC = 'Username must be alphanumeric' // Error Message
const USERNAMEALREADYEXIST = 'Username already exist' // Error Message
const WRONGPASSWORD = 'Wrong password' // Error Message
const EMAILISEMPTY = 'Email is empty' // Error Message
const EMAILNOTVALID = 'Email is not valid' // Error Message
const USERCREATE = 'User created Successfully' // Status Message
const INVALIDTOKEN = 'Invalid token' // Error Message
const NAMEISEMPTY = 'Name is empty' // Error Message
const LENGTHOFNAMEISMORETHAN50 = 'Length of name is more than 50' // Error Message
const INTERNALMETHODERROR = 'Internal method error' // Error Message

//END POINTS
const SIGNUP = '/signup' // End Point
const LOGIN = '/login' // End Point
const USERTEST = '/user' // End Point

function userExist( username ) {
    const client = new MongoClient(URL, { useUnifiedTopology: true })
    return client.db(DB).collection(USER).findOne({username: username})
}

router.post(SIGNUP, async (req, result) => {
    try {
        var username = req.body.username
        var password = req.body.password
        var email = req.body.email
        var name = req.body.name

    } catch (error) { return result.status(400).send({ STATUS: KO, ERRORMESSAGE: REQUESTBODYNOTVALID }) }

    if (!username || !password) return result.status(406).send({ STATUS: KO, ERRORMESSAGE: USERNAMEORPASSWORDISEMPTY })
    if (password.length < 8) return result.status(406).send({ STATUS: KO, ERRORMESSAGE: PASSWORDMUSTBEATLEAST8CHARACTERS })
    if (username.length < 4) return result.status(406).send({ STATUS: KO, ERRORMESSAGE: USERNAMEMUSTBEATLEAST4CHARACTERS })
    if (username.length > 20) return result.status(406).send({ STATUS: KO, ERRORMESSAGE: USERNAMEMUSTBELESSTHAN20CHARACTERS })
    if (username.match(/[^a-zA-Z0-9]/)) return result.status(406).send({ STATUS: KO, ERRORMESSAGE: USERNAMEMUSTBEALPHANUMERIC })
    if (!name) return result.status(406).send({ STATUS: KO, ERRORMESSAGE: NAMEISEMPTY })
    if (name.length > 50) return result.status(406).send({ STATUS: KO, ERRORMESSAGE: LENGTHOFNAMEISMORETHAN50 })
    if (!email) return result.status(406).send({ STATUS: KO, ERRORMESSAGE: EMAILISEMPTY })
    if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) return result.status(406).send({ STATUS: KO, ERRORMESSAGE: EMAILNOTVALID })

    var salt = generateCode(SALTROUND)
    password += salt

    const hashedPassword = await bcrypt.hash(password, SALTROUND)
    if (!hashedPassword) return result.status(500).send({ STATUS: KO, ERRORMESSAGE: INTERNALMETHODERROR })

    const client = new MongoClient(URL, { useUnifiedTopology: true })

    if( await userExist(username) ) return result.status(403).send({STATUS: KO, ERRORMESSAGE:USERNAMEALREADYEXIST})

    return await client.db(DB).collection(USER).insertOne({
        username: username,
        password: hashedPassword,
        salt: salt,
        email: email,
        name: name,
    })
        .then(() => result.status(200).send({ STATUS: OK, MESSAGE: USERCREATE }))
        .catch(() => result.status(500).send({ STATUS: KO, ERRORMESSAGE: INTERNALSERVERERROR }))
})

router.post(LOGIN, async (req, result) => {
    try {
        try {
            var username = req.body.username
            var password = req.body.password
        } catch (error) { result.status(400).send({ STATUS: KO, ERRORMESSAGE: REQUESTBODYNOTVALID }) }

        if (!username || !password) return result.status(403).send({ STATUS: KO, ERRORMESSAGE: USERNAMEORPASSWORDISEMPTY })
        if (password.length < 8) return result.status(403).send({ STATUS: KO, ERRORMESSAGE: WRONGPASSWORD })
        if (username.length < 4 || username.length > 20 || username.match(/[^a-zA-Z0-9]/)) return result.status(403).send({ STATUS: KO, ERRORMESSAGE: USERNAMEISINVALID })

        const client = new MongoClient(URL, { useUnifiedTopology: true })

        return await client.db(DB).collection(USER).findOne({
            username: username
        })
            .then((res) => {
                if (res) {
                    if (bcrypt.compareSync(password + res.salt, res.password)) {
                        var token = null;
                        try {
                            token = jwt.sign({ username: username, data: { useremail: res.email, name: res.name } }, JWT_SECRET)
                        } catch (error) { return result.status(500).send({ STATUS: KO, ERRORMESSAGE: INTERNALMETHODERROR }) }
                        return result.send({ STATUS: OK, TOKEN: token })
                    }
                    else
                        return result.status(401).send({ STATUS: KO, MESSAGE: WRONGPASSWORD })
                }
                else
                    return result.status(500).send({ STATUS: KO, ERRORMESSAGE: USERNOTFOUND })
            })
            .catch(() => result.status(500).send({ STATUS: KO, ERRORMESSAGE: INTERNALSERVERERROR }))
    } catch (error) { return res.status(500).send({ STATUS: KO, ERRORMESSAGE: UNIVERSALERROR }) }
})


router.get(USERTEST, (req, res) => {
    try {
        try {
            var token = req.headers.authorization.split(' ')[1]
        } catch (error) { return res.status(400).send({ STATUS: KO, ERRORMESSAGE: REQUESTBHEADERNOTVALID }) }
        var oauth = jwt.verify(token, JWT_SECRET)
        if (!oauth) return res.status(401).send({ STATUS: KO, ERRORMESSAGE: INVALIDTOKEN })
        else return res.status(200).send({ STATUS: OK, USER: oauth })
    } catch (err) { return res.status(401).send({ STATUS: KO, ERRORMESSAGE: INVALIDTOKEN }) }
})

module.exports = router