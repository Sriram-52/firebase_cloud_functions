const { db } = require("../../utils/admin")

class UTILS {
  static async _check_user_is_author(uid, docId) {
    return db
      .collection("TODOS")
      .where("id", "==", docId)
      .where("author", "==", uid)
      .where("isExist", "==", true)
      .get()
      .then((snap) => {
        if (snap.size < 1) throw new Error("not-exists")
        return snap.docs[0].data()
      })
      .catch((err) => {
        throw err
      })
  }

  static _check_inputs(inputs) {
    const keys = ["id", "author", "isExist", "createdAt", "updatedAt"]
    const acceptableInputs = {}
    Object.entries(inputs).forEach(([key, value]) => {
      if (!keys.includes(key)) acceptableInputs[key] = value
    })
    return acceptableInputs
  }
}

module.exports = UTILS
