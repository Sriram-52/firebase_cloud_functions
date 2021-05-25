const admin = require("firebase-admin");

const serviceAccount = require("./admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://todo-list-b0e96-default-rtdb.firebaseio.com"
});
const db=admin.firestore()
module.exports={db,admin}