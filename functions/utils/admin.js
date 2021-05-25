
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-functions-b921c-default-rtdb.firebaseio.com"
});

const db = admin.firestore()

module.exports ={admin,db}