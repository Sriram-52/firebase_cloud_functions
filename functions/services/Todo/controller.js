const router = require("express").Router()
const { closedend } = require("../../endpoints")
const Model = require("./model")
const UTILS = require("./utils")

router.post("/create", closedend, (req, res) => {
  const obj = new Model(req.user)
  const inputs = UTILS._check_inputs(req.body)
  return obj
    ._create_todo(inputs)
    .then(() => {
      return res.status(201).json({ message: `Todo created successfully` })
    })
    .catch((err) => {
      console.error(err)
      return res.status(500).json({ message: `Failed to create the todo` })
    })
})

router.patch("/update", closedend, (req, res) => {
  const { id } = req.query
  if (!id) {
    return res.status(422).json({ message: `Invalid todo id` })
  }
  const obj = new Model(req.user)
  const inputs = UTILS._check_inputs(req.body)
  return obj
    ._update_todo(inputs, id)
    .then(() => {
      return res.status(200).json({ message: `Todo updated successfully` })
    })
    .catch((err) => {
      console.error(err)
      if (err.toString().match("not-exists")) {
        return res
          .status(403)
          .json({ message: `You cannot access this todo may be deleted or you are not an author` })
      }
      return res.status(500).json({ message: `Failed to update the todo` })
    })
})

router.delete("/delete", closedend, (req, res) => {
  const { id } = req.query
  if (!id) {
    return res.status(422).json({ message: `Invalid todo id` })
  }
  const obj = new Model(req.user)
  return obj
    ._delete_todo(id)
    .then(() => {
      return res.status(200).json({ message: `Todo deleted successfully` })
    })
    .catch((err) => {
      console.error(err)
      if (err.toString().match("not-exists")) {
        return res
          .status(403)
          .json({ message: `You cannot access this todo may be deleted or you are not an author` })
      }
      return res.status(500).json({ message: `Failed to delete the todo` })
    })
})

router.get("/get", closedend, (req, res) => {
  const { id } = req.query
  if (!id) {
    return res.status(422).json({ message: `Invalid todo id` })
  }
  const obj = new Model(req.user)
  return obj
    ._get_todo(id)
    .then((todoData) => {
      return res.status(200).json({ todoData })
    })
    .catch((err) => {
      console.error(err)
      if (err.toString().match("not-exists")) {
        return res
          .status(403)
          .json({ message: `You cannot access this todo may be deleted or you are not an author` })
      }
      return res.status(500).json({ message: `Failed to get the todo` })
    })
})

router.get("/getAll", closedend, (req, res) => {
  const { id } = req.query
  if (!id) {
    return res.status(422).json({ message: `Invalid todo id` })
  }
  const obj = new Model(req.user)
  return obj
    ._get_all_todos()
    .then((todos) => {
      return res.status(200).json({ todos })
    })
    .catch((err) => {
      console.error(err)
      if (err.toString().match("not-exists")) {
        return res
          .status(403)
          .json({ message: `You cannot access this todo may be deleted or you are not an author` })
      }
      return res.status(500).json({ message: `Failed to get the todos` })
    })
})

module.exports = router
