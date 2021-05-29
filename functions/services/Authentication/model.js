const { db, admin } = require("../../utils/admin");
const UTILS = require("./utils");

class Model {
  constructor() {}
  async _create_user(inputs) {
    return admin
      .auth()
      .createUser({
        email: inputs.email,
        password: inputs.password,
      })
      .then((user) => {
        return db
          .collection("USERS")
          .doc(user.uid)
          .set({
            ...inputs,
            uid: user.uid,
            isExist: true,
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
        return db.collection("USERS").doc(uid).update(inputs);
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
      .get()
      .then((data) => {
        let usersData = [];
        data.forEach((demo) => {
          usersData.push({
            ...demo.data,
          });
        });
      })
      .catch((err) => {
        throw err;
      });
  }
}

module.exports = Model;
