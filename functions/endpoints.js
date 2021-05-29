const { admin } = require("./utils/admin")

const closedend = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ").pop()
    return admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => {
        req.user = {
          email: decodedToken.email,
          uid: decodedToken.uid,
        }
        console.log(`Requested ${req.url} --> ${decodedToken.email}`)
        return next()
      })
      .catch((err) => {
        console.error(err)
        return res.status(500).json({ message: `Invalid token` })
      })
  } else {
    return res.status(403).json({ message: `Unauthorized` })
  }
}

module.exports = { closedend }
