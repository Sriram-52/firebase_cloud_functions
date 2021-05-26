const functions = require("firebase-functions");
const app=require("express")();
const { admin, db }=require("./uitls/admin")

app.post("/createUser",(req ,res) => {

    const inputs = req.body;
    return admin.auth().createUser({
        email:inputs.email,
        password:inputs.password
    })
     .then((user) =>{
         req.user=user;
         return admin.auth().setCustomUserClaims(user.uid,{role:"username"})
    })
    .then(() =>{
       const userRef = db.collection("USERS").doc(req.user.uid)
       return userRef
       .set({
           ...inputs,
           isExist: true,
           createdAt:admin.firestore.FieldValue.serverTimestamp(),
           role:"user",
           id:req.user.uid,
           uid:req.user.uid
       })
    })
    .then(() =>{   
        return res.send("user created sucessfuly")
    })
    .catch((err) =>{
        console.error(err)
        return res.send("fail to create useer")
       })
    })

exports.api=functions.https.onRequest(app)