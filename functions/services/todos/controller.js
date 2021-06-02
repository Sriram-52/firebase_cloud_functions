const router = require("express").Router();
const Model = require("./model");
router.post("/addTodo", (req, res) => {
  const inputs = req.body;
  const obj = new Model();
  return obj
    ._add_todo(inputs)
    .then(() => {
      return res.status(200).json({ message: `todo added successfully` });
    })
    .catch((err) => {
      console.log(err);
      return res.status(406).json({ message: `unable to addTodo` });
    });
});
//update is not working(issue to solve)
router.patch("/updateTodo", (req, res) => {
  const inputs = req.body;
  const { id } = req.query;
  const obj = new Model();
  return obj
    ._update_todo(inputs, id)
    .then(() => {
      return res.status(200).json({ message: `todo updated successfully` });
    })
    .catch((err) => {
      console.log(err);
      return res.status(406).json({ message: `unable to updateTodo` });
    });
});
router.delete("/deleteUser", (req, res) => {
  const { id } = req.query;
  const obj = new Model();
  return obj
    ._delete_todo(id)
    .then(() => {
      return res.status(200).json({ message: `todo deleted successfully` });
    })
    .catch((err) => {
      console.log(err);
      return res.status(406).json({ message: `unable to deleteTodo` });
    });
});
router.get("/getTodo", (req, res) => {
  const { id } = req.query;
  const obj = new Model();
  return obj
    ._get_todo(id)
    .then((data) => {
      return res.status(200).json({ data });
    })
    .catch(() => {
      return res.status(406).json({ message: `unable to getTodo` });
    });
});
router.get("/getAllTodos", (req, res) => {
  const obj = new Model();
  return obj
    ._get_all_todos()
    .then((data) => {
      return res.status(200).json({ data });
    })
    .catch((err) => {
      console.log(err);
      return res.status(406).json({ message: `unable to getTodos` });
    });
});
module.exports = router;
