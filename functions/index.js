const functions = require("firebase-functions")

const app = require("express")()

const { db, admin } = require("./utils/admin")

app.post("/createUser", (req, res) => {
  const inputData = req.body
  return admin
    .auth()
    .createUser({ email: inputData.email, password: inputData.password })
    .then((user) => {
      req.user = user
      return admin.auth().setCustomUserClaims(user.uid, { role: "students", college: "SITE" })
    })
    .then((res) => {
      const snap = db.collection("USERS").doc(req.user.uid)
      return snap.set({
        ...inputData,
        createdAt: new Date().toISOString(),
      })
    })
    .then(() => {
      return res.status(201).json({ message: `User created successfully` })
    })
    .catch((error) => {
      console.log(error)
      return res.status(500).json({ error: error.message })
    })
})
app.get("/dataGet", async (req, res) => {
  const snapshot = await db.collection("USERS").get()
  let data = []
  snapshot.forEach((doc) => {
    let dataUser = doc.data()
    let id = doc.id
    data.push({ id: id, dataUser })
  })
  return res.status(200).json(data)
})

exports.api = functions.https.onRequest(app)
