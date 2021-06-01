const functions = require("firebase-functions")
const app = require("express")()

app.use("/auth", require("./services/Authentication/controller"))
app.use("/todo", require("./services/Todo/controller"))

exports.api = functions.https.onRequest(app)
