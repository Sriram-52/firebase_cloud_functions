const { object } = require("firebase-functions/lib/providers/storage");
const { db, admin } = require("../../utils/admin");
const UTILS = require("./utils");

class Model {
  constructor(user) {
    this.actionPerformer = user;
  }
  async _create_user(inputs) {
    return admin
      .auth()
      .createUser({
        email: inputs.email,
        password: inputs.password,
      })
      .then((user) => {
        //  const userData = db.collection("USERS").doc(user.uid);
        const inputData = {};
        Object.entries(inputs).forEach(([key, value]) => {
          if (key !== "password") inputData[key] = value;
        });
        return db
          .collection("USERS")
          .doc(user.uid)
          .set({
            ...inputData,
            uid: user.uid,
            isExist: true,
            role: "user",
            createdAt: new Date().toISOString(),
          });
      })
      .catch((err) => {
        throw err;
      });
  }
  async _update_user(inputs, uid) {
    return UTILS._check_user_exists(uid)
      .then(() => {
        return db
          .collection("USERS")
          .doc(uid)
          .update({
            ...inputs,
            updatedAt: new Date().toISOString(),
          });
      })
      .catch((err) => {
        throw err;
      });
  }
  async _get_user(uid) {
    return UTILS._check_user_exists(uid)
      .then(() => {
        return db.collection("USERS").doc(uid).get();
      })
      .then((doc) => {
        return doc.data();
      })
      .catch((err) => {
        throw err;
      });
  }
  async _delete_user(uid) {
    return UTILS._check_user_exists(uid)
      .then(() => {
        return admin.auth().updateUser(uid, { disabled: true });
      })
      .then(() => {
        return db.collection("USERS").doc(uid).update({ isExist: false });
      })
      .catch((err) => {
        throw err;
      });
  }
  async _enable_user(uid) {
    return UTILS._check_user_deleted(uid)
      .then(() => {
        return admin.auth().updateUser(uid, { disabled: false });
      })
      .then(() => {
        return db.collection("USERS").doc(uid).update({ isExist: true });
      })
      .catch((err) => {
        throw err;
      });
  }
  async _get_all_users_data() {
    return db
      .collection("USERS")
      .where("isExist", "==", true)
      .get()
      .then((data) => {
        return data.docs.map((doc) => {
          return doc.data();
        });
      })
      .catch((err) => {
        throw err;
      });
  }

  async _update_password(password) {
    return admin
      .auth()
      .updateUser(this.actionPerformer.uid, { password: password })
      .catch((err) => {
        throw err;
      });
  }
  async _get_user_by_email(email) {
    return admin
      .auth()
      .getUserByEmail(email)

      .then((doc) => {
        return doc.data();
      })
      .catch((err) => {
        throw err;
      });
  }
}

module.exports = Model;
