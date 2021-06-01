const { admin, db } = require("../../utils/admin")
const UTILS = require("./utils")

class Model {
  constructor(user) {
    this.actionPerformer = user
    this.timestamp = admin.firestore.FieldValue.serverTimestamp()
  }

  async _create_todo(inputs) {
    const todoRef = db.collection("TODOS").doc()
    return todoRef.set({
      ...inputs,
      id: todoRef.id,
      isExist: true,
      isMarkedAsDone: false,
      createdAt: this.timestamp,
      updatedAt: this.timestamp,
      author: this.actionPerformer.uid,
    })
  }

  async _update_todo(inputs, id) {
    return UTILS._check_user_is_author(this.actionPerformer.uid, id)
      .then(() => {
        const todoRef = db.doc(`TODOS/${id}`)
        return todoRef.set({ ...inputs, updatedAt: this.timestamp }, { merge: true })
      })
      .catch((err) => {
        throw err
      })
  }

  async _delete_todo(id) {
    return UTILS._check_user_is_author(this.actionPerformer.uid, id)
      .then(() => {
        const todoRef = db.doc(`TODOS/${id}`)
        return todoRef.set({ isExist: false, updatedAt: this.timestamp }, { merge: true })
      })
      .catch((err) => {
        throw err
      })
  }

  async _get_todo(id) {
    return UTILS._check_user_is_author(this.actionPerformer.uid, id)
      .then((data) => {
        return data
      })
      .catch((err) => {
        throw err
      })
  }

  async _get_all_todos() {
    return db
      .collection("TODOS")
      .where("author", "==", this.actionPerformer.uid)
      .where("isExist", "==", true)
      .get()
      .then((snap) => {
        return snap.docs.map((doc) => doc.data())
      })
      .catch((err) => {
        throw err
      })
  }
}

module.exports = Model
