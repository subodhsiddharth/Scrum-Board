const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { MongoClient, ObjectId } = require('mongodb')

// CONSTANTS USED IN THIS FILE
const URL = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017' // MongoDB URL
const DB = process.env.MONGODB_NAME || 'testScrum'  // MongoDB Database Name
const JWT_SECRET = process.env.JWT_SECRET || 'goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu' // JWT Secret
const SCRUM = process.env.USER || 'scrum' // MongoDB Collection Name
const UNIVERSALERROR = 'Universal error'  // Error Message
const INTERNALSERVERERROR = 'Internal server error'  // Error Message
const MESSAGE = 'Updated Successful'  // Error Message
const OK = 'OK' // Status Message
const KO = 'KO' // Status Message
const REQUESTBODYNOTVALID = 'Request body is not valid' // Error Message
const REQUESTBHEADERNOTVALID = 'Request header is not valid' // Error Message
const INVALIDTOKEN = 'Invalid token' // Error Message

//END POINTS
const CREATEACTIVITY = '/createActivity' // End Point
const GETALLACTIVITY = '/getActivity' // End Point
const UPDATEACTIVITY = '/updateActivity'// End Point
const DELETEACTIVITY = '/deleteActivity'// End Point

router.post(CREATEACTIVITY, async (req, result) => {
    try {
        var token = req.headers.authorization.split(' ')[1]
    } catch (error) { return res.status(400).send({ STATUS: KO, ERRORMESSAGE: REQUESTBHEADERNOTVALID }) }
    try {
        var topic = req.body.topic
        var detail = req.body.detail
        var title = req.body.title

    } catch (error) { return result.status(400).send({ STATUS: KO, ERRORMESSAGE: REQUESTBODYNOTVALID }) }

    var oauth = jwt.verify(token, JWT_SECRET)
    if (!oauth) return res.status(401).send({ STATUS: KO, ERRORMESSAGE: INVALIDTOKEN })
    username = oauth.username
    const client = new MongoClient(URL, { useUnifiedTopology: true })
    await client.db(DB).collection(SCRUM).insertOne({
        username: username,
        topic: topic,
        detail: detail,
        title: title
    })
        .then((res) => {
            if (res)
                return result.status(200).send({ STATUS: OK, MESSAGE: MESSAGE, RESULT: { res } })
        })
        .catch(() => result.status(500).send({ STATUS: KO, ERRORMESSAGE: INTERNALSERVERERROR }))
})

router.get(GETALLACTIVITY, async (req, result) => {
    try {
        var token = req.headers.authorization.split(' ')[1]
    } catch (error) { return result.status(400).send({ STATUS: KO, ERRORMESSAGE: REQUESTBHEADERNOTVALID }) }
    var oauth = jwt.verify(token, JWT_SECRET)
    if (!oauth) return result.status(401).send({ STATUS: KO, ERRORMESSAGE: INVALIDTOKEN })
    const client = new MongoClient(URL, { useUnifiedTopology: true })

    return await client.db(DB).collection(SCRUM).find({}).limit(100).toArray()
        .then((res) => result.status(200).send({ STATUS: OK, MESSAGE: res }))
        .catch(() => result.status(500).send({ STATUS: KO, ERRORMESSAGE: INTERNALSERVERERROR }))
})


router.put(UPDATEACTIVITY, async (req, result) => {
    try {
        var token = req.headers.authorization.split(' ')[1]
    } catch (error) { return result.status(400).send({ STATUS: KO, ERRORMESSAGE: REQUESTBHEADERNOTVALID }) }
    try {
        var id = new ObjectId(req.body.id)
        var topic = req.body.topic

    } catch (error) { return result.status(400).send({ STATUS: KO, ERRORMESSAGE: REQUESTBODYNOTVALID }) }

    var oauth = jwt.verify(token, JWT_SECRET)
    if (!oauth) return result.status(401).send({ STATUS: KO, ERRORMESSAGE: INVALIDTOKEN })
    const client = new MongoClient(URL, { useUnifiedTopology: true })
    return await client.db(DB).collection(SCRUM).findOneAndUpdate({
        _id: id,
    }, { $set: { topic: topic } },
        { returnNewDocument: true })
        .then((res) => result.status(200).send({ STATUS: OK, MESSAGE: res.value }))
        .catch(() => result.status(500).send({ STATUS: KO, ERRORMESSAGE: INTERNALSERVERERROR }))
})

router.delete(DELETEACTIVITY, async (req, result) => {
    try {
        var token = req.headers.authorization.split(' ')[1]
    } catch (error) { return result.status(400).send({ STATUS: KO, ERRORMESSAGE: REQUESTBHEADERNOTVALID }) }
    try {
        var id = new ObjectId(req.body.id)

    } catch (error) { return result.status(400).send({ STATUS: KO, ERRORMESSAGE: REQUESTBODYNOTVALID }) }

    var oauth = jwt.verify(token, JWT_SECRET)
    if (!oauth) return result.status(401).send({ STATUS: KO, ERRORMESSAGE: INVALIDTOKEN })
    const client = new MongoClient(URL, { useUnifiedTopology: true })
    return await client.db(DB).collection(SCRUM).deleteOne({
        _id: id,
    })
        .then((res) => result.status(200).send({ STATUS: OK, MESSAGE: res.value }))
        .catch(() => result.status(500).send({ STATUS: KO, ERRORMESSAGE: INTERNALSERVERERROR }))
})



module.exports = router