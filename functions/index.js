const functions = require("firebase-functions");
const { user } = require("firebase-functions/lib/providers/auth");

const app=require("express")();
const {admin,db}=require("./utils/admin")
app.post("/createUser",(req,res)=>{
  const inputs=req.body
  return admin.auth().createUser({
    email : inputs.email,
    password : inputs.password
  })
  .then((user)=>{
    req.user = user.uid
    return admin.auth().setCustomUserClaims(user.uid,{role:"user"})
  })
  .then(()=>{
    const userRef=db.collection("USERS").doc(req.user)
    return userRef.set({
      ...inputs,
      isExist : true,
      createdAt : admin.firestore.FieldValue.serverTimestamp(),
      role : "user",
      id : userRef.id,
    })
  })
  .then(()=>{
    return res.send("User Created SUCCESSFULLY")
  })
  .catch((err)=>{
    console.error(err)
    return res.send("Failed to Create User")
  })
})

app.patch("/updateUser",(req,res)=>{
  const inputs=req.body
  const {uid}=req.query
  return admin.auth().updateUser(uid,{
    phoneNumber:inputs.phone,
    displayName:inputs.name
  })
  .then((user)=>{
    return db.doc(`USERS/${user.uid}`).set(
      {phoneNumber:user.phoneNumber,
      displayName:user.displayName},
      {merge:true})
  })
  .then(()=>{
    return res.status(202).json({message:`user updated successfully`})
  })
  .catch((err)=>{
    console.error(err)
    if(err.code==="auth/invalid-phone-number")
    return res.status(500).json({message:`Phone number must be attached with country code`})
    return res.status(500).json({message:`failed to update user`})
  })
})

exports.api=functions.https.onRequest(app);