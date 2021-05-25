const functions = require("firebase-functions");

const app = require("express")();
const { db, admin } = require("./utils/admin");

app.post("/createUser", (req, res) => {
  const data = req.body;
  return admin
    .auth()
    .createUser({
      email: data.email,
      password: data.password,
    })
    .then((user) => {
      req.user = user;
      return (
        admin.auth().setCustomUserClaims(user.uid, { role: "user" }),
        console.log("this is UID:" + user.uid),
        console.log("user created success fully")
      );
    })
    .then(() => {
      console.log("user with role created successfully");
      const userData = db.collection("USERS").doc(req.user.uid);
      return userData.set({
        ...data,
        isExist: true,
        role: "user",
        createAt: new Date().toISOString(),
        id: userData.id,
        uid: req.user.uid,
      });
    })
    .then(() => {
      return res.send("user created successfully");
    })
    .catch(() => {
      return res.send("unable to create user");
    });
});

exports.api = functions.https.onRequest(app);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", { structuredData: true });
//   response.send("Hello from Firebase!");
// });
