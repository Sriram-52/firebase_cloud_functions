const functions = require("firebase-functions")
const app = require("express")()
const { admin, db } = require("./utils/admin")

app.post("/createUser", (req, res) => {
  const inputs = req.body
  return admin
    .auth()
    .createUser({
      email: inputs.email,
      password: inputs.password
    })
    .then((user) => {
      req.user = user
      return admin.auth().setCustomUserClaims(user.uid, { role: "user" })
    })
    .then(() => {
      return db
        .collection("USERS")
        .doc(req.user.uid)
        .set({
          ...inputs,
          isExist: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          role: "user",
          id: req.user.uid,
          uid: req.user.uid
        })
    })
    .then(() => {
      return res.send("User created successfully")
    })
    .catch((err) => {
      console.error(err)
      return res.send("Failed to create user")
    })
})

exports.api = functions.https.onRequest(app)
