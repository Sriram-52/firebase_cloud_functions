const { db, admin } = require("../../utils/admin")
const UTILS = require("./utils")

class Model {
  constructor(user) {
    this.actionPerformer = user
    this.serverTimestamp = admin.firestore.FieldValue.serverTimestamp()
  }

  async _create_user(inputs) {
    let userInfo = {}
    return admin
      .auth()
      .createUser({
        email: inputs.email,
        password: inputs.password,
      })
      .then((user) => {
        userInfo = user
        return admin.auth().setCustomUserClaims(user.uid, { role: "user" })
      })
      .then(() => {
        const userRef = db.collection("USERS").doc(userInfo.uid)
        const inputData = {}
        Object.entries(inputs).forEach(([key, value]) => {
          if (key !== "password") inputData[key] = value
        })
        return userRef.set({
          ...inputData,
          isExist: true,
          createdAt: this.serverTimestamp,
          role: "user",
          id: userRef.id,
          uid: userInfo.uid,
        })
      })
      .catch((err) => {
        throw err
      })
  }

  async _update_user(inputs, uid) {
    return UTILS._check_user_exists(uid)
      .then(() => {
        return db.doc(`USERS/${uid}`).update(inputs)
      })
      .catch((err) => {
        throw err
      })
  }

  async _get_user(uid) {
    let userInfo = {}
    return UTILS._check_user_exists(uid)
      .then((data) => {
        userInfo = { ...userInfo, ...data }
        return userInfo
      })
      .catch((err) => {
        throw err
      })
  }

  async _delete_user(uid) {
    return UTILS._check_user_exists(uid)
      .then(() => {
        return admin.auth().updateUser(uid, { disabled: true })
      })
      .then(() => {
        return db.doc(`USERS/${uid}`).update({ isExist: false })
      })
      .catch((err) => {
        throw err
      })
  }

  async _enable_user(uid) {
    return UTILS._check_user_deleted(uid)
      .then(() => {
        return admin.auth().updateUser(uid, { disabled: false })
      })
      .then(() => {
        return db.doc(`USERS/${uid}`).update({ isExist: true })
      })
      .catch((err) => {
        throw err
      })
  }
}

module.exports = Model