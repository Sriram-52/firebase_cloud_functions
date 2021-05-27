const functions = require("firebase-functions")
const app = require("express")()

app.use("/auth", require("./services/Authentication/controller"))

exports.api = functions.https.onRequest(app)
