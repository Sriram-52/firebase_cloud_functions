const router = require("express").Router();
const Model = require("./model");
const { closedend } = require("../../endpoints");
router.post("/createUser", (req, res) => {
  const inputs = req.body;
  const _create_user_obj = new Model();
  return _create_user_obj
    ._create_user(inputs)
    .then(() => {
      return res.status(201).json({ message: `User created successfully` });
    })
    .catch((err) => {
      console.log(err);
      if (err.code === "auth/invalid-uid")
        return res.status(422).json({ message: `UID cannot be empty string` });
      if (err.code === "auth/invalid-provider-data") {
        return res.status(406).json({
          message:
            "The providerData must be a valid array of UserInfo objects..",
        });
      }
      if (err.code === "auth/phone-number-already-exists") {
        return res.status(406).json({
          message:
            "The provided phoneNumber is already in use by an existing user. Each user must have a unique phoneNumber.",
        });
      }
      if (err.code === "auth/invalid-password") {
        return res.status(406).json({
          message:
            "The provided value for the password user property is invalid. It must be a string with at least six characters",
        });
      }
      if (err.code === "auth/invalid-email") {
        return res.status(406).json({
          message:
            "The provided value for the email user property is invalid. It must be a string email address..",
        });
      }
      if (err.code === "auth/email-already-exists") {
        return res.status(406).json({
          message:
            "The provided email is already in use by an existing user. Each user must have a unique email.",
        });
      }
      return res.status(500).json({ message: `Failed to create the user` });
    });
});
router.patch("/updateUser", closedend, (req, res) => {
  const inputs = req.body;
  const { uid } = req.query;
  const obj = new Model();
  return obj
    ._update_user(inputs, uid)
    .then(() => {
      return res.status(201).json({ message: "user upadted successfully" });
    })
    .catch((err) => {
      if (err.code === "auth/phone-number-already-exists") {
        return res.status(406).json({
          message:
            "The provided phoneNumber is already in use by an existing user. Each user must have a unique phoneNumber.",
        });
      }
      if (err.code === "auth/invalid-password") {
        return res.status(406).json({
          message:
            "The provided value for the password user property is invalid. It must be a string with at least six characters",
        });
      }
      if (err.code === "auth/email-already-exists") {
        return res.status(406).json({
          message:
            "The provided email is already in use by an existing user. Each user must have a unique email.",
        });
      }
      console.log(err);
      return res.status(500).json({ message: "unable to update user" });
    });
});
router.get("/getUser", closedend, (req, res) => {
  const { uid } = req.query;
  const obj = new Model(req.user);
  return obj
    ._get_user(uid)
    .then((data) => {
      return res.status(200).json({ data });
    })
    .catch((err) => {
      console.log(err);
      if (err.code === "auth/invalid-uid")
        return res.status(422).json({ message: `UID cannot be empty string` });
      if (
        err.code === "auth/user-not-found" ||
        err.toString().match("user-not-exists")
      )
        return res
          .status(404)
          .json({ message: `There is no user with existing uid` });
      return res.status(422).json({ message: `Failed to get user` });
    });
});
router.delete("/deleteUser", closedend, (req, res) => {
  const { uid } = req.query;
  const obj = new Model();
  return obj
    ._delete_user(uid)
    .then(() => {
      return res.status(200).json({ message: "user deleted successfully" });
    })
    .catch((err) => {
      console.log(err);
      if (
        err.code === "auth/user-not-found" ||
        err.toString().match("user-not-exists")
      )
        return res.status(404).json({
          message: `There is no user with existing uid or user already deleted`,
        });
      return res.status(422).json({ message: `Failed to delete user` });
    });
});
router.put("/enableUser", closedend, (req, res) => {
  const { uid } = req.query;
  const obj = new Model();
  return obj
    ._enable_user(uid)
    .then(() => {
      return res.status(200).json({ message: "user enabled successfully" });
    })
    .catch((err) => {
      if (err.toString().match("user-already-exists"))
        return res.status(404).json({ message: `User already enabled` });
      console.log(err);
      return res.status(400).json({ message: "unable to enable the user" });
    });
});
router.get("/getAllUsersData", (req, res) => {
  const obj = new Model();
  return obj
    ._get_all_users_data()
    .then((usersData) => {
      console.log(usersData);
      return res.status(200).json({ usersData });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "unable to get all users data" });
    });
});
router.put("/updatePassword", closedend, (req, res) => {
  const { password } = req.body;
  if (!password) {
    console.log(`invalid password`);
  }
  const obj = new Model(req.user);
  return obj
    ._update_password(password)
    .then(() => {
      return res.status(200).json({
        message: `Password changed successfully for ${req.user.email}`,
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ message: `Failed to change password` });
    });
});
router.get("/getUserByEmail", (req, res) => {
  const { email } = req.body;
  const obj = new Model();
  obj
    ._get_user_by_email(email)
    .then((data) => {
      return res.status(200).json({ data });
      return res.status(200).json({ data });
    })
    .catch((err) => {
      console.log(err);
    });
});
module.exports = router;
