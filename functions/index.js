const functions = require("firebase-functions")
const app = require("express")()
const { admin, db } = require("./utils/admin")

app.post("/createUser", (req, res) => {
  const inputs = req.body
  return admin
    .auth()
    .createUser({
      email: inputs.email,
      password: inputs.password,
    })
    .then((user) => {
      req.user = user
      return admin.auth().setCustomUserClaims(user.uid, { role: "user" })
    })
    .then(() => {
      const userRef = db.collection("USERS").doc(req.user.uid)
      const inputData = {}
      Object.entries(inputs).forEach(([key, value]) => {
        if (key !== "password") inputData[key] = value
      })
      return userRef.set({
        ...inputData,
        isExist: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        role: "user",
        id: userRef.id,
        uid: req.user.uid,
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

app.patch("/updateUser", (req, res) => {
  const { uid } = req.query
  const inputs = req.body
  return admin
    .auth()
    .updateUser(uid, {
      phoneNumber: inputs.phone,
      displayName: inputs.name,
    })
    .then((user) => {
      return db.doc(`USERS/${user.uid}`).update(inputs)
    })
    .then(() => {
      return res.status(202).json({ message: `User updated successfully` })
    })
    .catch((err) => {
      console.error(err)
      if (err.code === "auth/invalid-phone-number")
        return res
          .status(422)
          .json({ message: `Invalid phone number attach country code along with number` })
      if (err.code === "auth/invalid-uid")
        return res.status(422).json({ message: `UID cannot be empty string` })
      if (err.code === "auth/user-not-found")
        return res.status(404).json({ message: `There is no user with existing uid` })
      if (err.code === "auth/phone-number-already-exists")
        return res.status(422).json({ message: err.message })
      return res.status(422).json({ message: `Failed to update user` })
    })
})

app.get("/user", async (req, res) => {
  const { uid } = req.query
  let userInfo = {}
  try {
    const authData = await admin.auth().getUser(uid)
    userInfo = { ...authData, ...userInfo }
    const doc = await db.doc(`USERS/${uid}`).get()
    userInfo = { ...doc.data(), ...userInfo }
    return res.status(200).json({ userInfo })
  } catch (err) {
    if (err.code === "auth/invalid-uid")
      return res.status(422).json({ message: `UID cannot be empty string` })
    if (err.code === "auth/user-not-found")
      return res.status(404).json({ message: `There is no user with existing uid` })
    return res.status(422).json({ message: `Failed to get user` })
  }
})

app.delete("/user", async (req, res) => {
  const { uid } = req.query
  try {
    const doc = await db.doc(`USERS/${uid}`).get()
    if (!doc.data().isExist || !doc.exists) throw new Error("user-already-deleted")
    const authData = await admin.auth().getUser(uid)
    if (authData.disabled) throw new Error("user-already-deleted")
    await admin.auth().updateUser(uid, { disabled: true })
    await db.doc(`USERS/${uid}`).update({ isExist: false })
    return res.status(200).json({ message: `User deleted successfully` })
  } catch (err) {
    console.error(err)
    if (err.toString().match("user-already-deleted"))
      return res
        .status(404)
        .json({ message: `There is no user with existing uid or user already deleted` })
    if (err.code === "auth/invalid-uid")
      return res.status(422).json({ message: `UID cannot be empty string` })
    if (err.code === "auth/user-not-found")
      return res
        .status(404)
        .json({ message: `There is no user with existing uid or user already deleted` })
    return res.status(422).json({ message: `Failed to delete user` })
  }
})

app.put("/enableUser", async (req, res) => {
  const { uid } = req.query
  try {
    const doc = await db.doc(`USERS/${uid}`).get()
    if (doc.data().isExist) throw new Error("user-already-exists")
    const authData = await admin.auth().getUser(uid)
    if (!authData.disabled) throw new Error("user-already-exists")
    await admin.auth().updateUser(uid, { disabled: false })
    await db.doc(`USERS/${uid}`).update({ isExist: true })
    return res.status(200).json({ message: `User enabled successfully` })
  } catch (err) {
    console.error(err)
    if (err.toString().match("user-already-exists"))
      return res.status(404).json({ message: `User already enabled` })
    if (err.code === "auth/invalid-uid")
      return res.status(422).json({ message: `UID cannot be empty string` })
    if (err.code === "auth/user-not-found")
      return res.status(404).json({ message: `There is no user with existing uid` })
    return res.status(422).json({ message: `Failed to enable user` })
  }
})

exports.api = functions.https.onRequest(app)
