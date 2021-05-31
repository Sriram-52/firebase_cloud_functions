const { db, admin } = require("./utils/admin");
const closedend = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split("Bearer ")[1];
    return admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => {
        req.user = {
          email: decodedToken.email,
          uid: decodedToken.uid,
        };
        console.log(`Requested ${req.url} --> ${decodedToken.email}`);
        return next();
      })
      .catch((err) => {
        console.log(err);
        return res.status(200).json({ message: "invalid token" });
      });
  } else {
    return res.status(400).json({ message: "unauthriosed token" });
  }
};
module.exports = { closedend };
