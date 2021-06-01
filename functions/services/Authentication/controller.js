const router = require("express").Router()
const Model = require("./model")

router.post("/createUser", (req, res) => {
  const inputs = req.body
  const obj = new Model()
  return obj
    ._create_user(inputs)
    .then(() => {
      return res.status(201).json({ message: `User created successfully` })
    })
    .catch((err) => {
      console.error(err)
      return res.status(500).json({ message: `Failed to create the user` })
    })
})

router.patch("/updateUser", (req, res) => {
  const { uid } = req.query
  const inputs = req.body
  const obj = new Model()
  return obj
    ._update_user(inputs, uid)
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
      if (err.code === "auth/user-not-found" || err.toString().match("user-not-exists"))
        return res.status(404).json({ message: `There is no user with existing uid` })
      if (err.code === "auth/phone-number-already-exists")
        return res.status(422).json({ message: err.message })
      return res.status(422).json({ message: `Failed to update user` })
    })
})

router.get("/user", (req, res) => {
  const { uid } = req.query
  const obj = new Model()
  return obj
    ._get_user(uid)
    .then((data) => {
      return res.status(200).json({ data })
    })
    .catch((err) => {
      console.error(err)
      if (err.code === "auth/invalid-uid")
        return res.status(422).json({ message: `UID cannot be empty string` })
      if (err.code === "auth/user-not-found" || err.toString().match("user-not-exists"))
        return res.status(404).json({ message: `There is no user with existing uid` })
      return res.status(422).json({ message: `Failed to get user` })
    })
})

router.delete("/user", (req, res) => {
  const { uid } = req.query
  const obj = new Model()
  return obj
    ._delete_user(uid)
    .then(() => {
      res.status(200).json({ message: `User deleted successfully` })
    })
    .catch((err) => {
      console.error(err)
      if (err.code === "auth/invalid-uid")
        return res.status(422).json({ message: `UID cannot be empty string` })
      if (err.code === "auth/user-not-found" || err.toString().match("user-not-exists"))
        return res
          .status(404)
          .json({ message: `There is no user with existing uid or user already deleted` })
      return res.status(422).json({ message: `Failed to delete user` })
    })
})

router.put("/enableUser", (req, res) => {
  const { uid } = req.query
  const obj = new Model()
  return obj
    ._enable_user(uid)
    .then(() => {
      return res.status(200).json({ message: `User enabled successfully` })
    })
    .catch((err) => {
      console.error(err)
      if (err.toString().match("user-already-exists"))
        return res.status(404).json({ message: `User already enabled` })
      if (err.code === "auth/invalid-uid")
        return res.status(422).json({ message: `UID cannot be empty string` })
      if (err.code === "auth/user-not-found")
        return res.status(404).json({ message: `There is no user with existing uid` })
      return res.status(422).json({ message: `Failed to enable user` })
    })
})

module.exports = router