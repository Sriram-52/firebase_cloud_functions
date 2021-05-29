const functions = require("firebase-functions");
const app = require("express")();
const {admin,db}  = require("./utils/admin")

app.use("/auth",require("./services/Authentication/controller"))

exports.api=functions.https.onRequest(app);
{}