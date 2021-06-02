const { user } = require("firebase-functions/lib/providers/auth");
const { db } = require("../../utils/admin");

class Model {
  constructor(user) {
    this.time = new Date().toISOString();
  }
  async _add_todo(inputs) {
    const data = db.collection("TODOS").doc();
    return data
      .set({
        ...inputs,
        id: data.id,
        isExist: true,
        createdAt: this.time,
        markedAsDone: false,
      })
      .catch((err) => {
        throw err;
      });
  }
  async _update_todo(inputs, id) {
    const data = db.collection("TODOS").doc(id);
    return data
      .update({
        ...inputs,
        updatedAt: this.time,
      })
      .catch((err) => {
        throw err;
      });
  }
  async _delete_todo(id) {
    const data = db.collection("TODOS").doc(id);
    return data
      .update({
        isExist: false,
        markedAsDone: true,
        deletedAt: this.time,
      })
      .catch((err) => {
        throw err;
      });
  }
  async _get_todo(id) {
    return db
      .collection("TODOS")
      .doc(id)
      .get()
      .then((doc) => {
        return doc.data();
      })
      .catch((err) => {
        throw err;
      });
  }
  async _get_all_todos() {
    return db
      .collection("TODOS")
      .where("isExist", "==", true)
      .where("markedAsDone", "==", false)
      .get()
      .then((res) => {
        return res.docs.map((doc) => {
          return doc.data();
        });
      })
      .catch((err) => {
        throw err;
      });
  }
}

module.exports = Model;
