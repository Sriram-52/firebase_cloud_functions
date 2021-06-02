const functions = require("firebase-functions");
const app = require("express")();
const { db } = require("./utils/admin");
app.use("/auth", require("./services/Authentication/controller"));
app.use("/todos", require("./services/todos/controller"));
exports.api = functions.https.onRequest(app);
