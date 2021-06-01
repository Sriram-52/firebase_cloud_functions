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

app.get("/user", async(req,res)=>{
  const {uid}=req.query
  let userinfo={}
  try {
    const authData=await admin.auth().getUser(uid)
    userinfo={...authData,...userinfo}
    const doc=await db.doc(`USERS/${uid}`).get()
    userinfo={...doc.data(),...userinfo}
    return res.status(200).json({userinfo})
  } catch (error) {
    if(error.code==="auth/invalid-uid")
      return res.status(422).json({message: `UID cannot be empty string`})
    if(error.code==="auth/user-not-found")
      return res.status(404).json({message: `User does not exist with UID`})
    return res.status(422).json({message: `Failed to get the user `})

  }
})
app.delete("/user", async(req,res)=>{
  const {uid}=req.query
  try {
    const doc=await db.doc(`USERS/${uid}`).get()
    if(!doc.data().isExist || !doc.exists) throw new Error("user-already-deletd")
    const authData=await admin.auth().getUser(uid)
    if(authData.disabled) throw new Error("user-already-deletd")
    await admin.auth().updateUser(uid,{disabled:true})
    await db.doc(`USERS/${uid}`).update({isExist:false})
    return res.status(200).json({message: `User deleted Successfully`})
  } catch (error) {
    if(error.toString().match("user-already-deletd"))
    return res.status(404).json({message: `User does not exist with UID or user already deleted`})
    if(error.code==="auth/invalid-uid")
      return res.status(422).json({message: `UID cannot be empty string`})
    if(error.code==="auth/user-not-found")
      return res.status(404).json({message: `User does not exist with UID or user already deleted`})
    return res.status(422).json({message: `Failed to delete the user `})

    
  }
  

})  
app.put("/enableUser", async(req,res)=>{
  const {uid}=req.query
  try {
    const doc=await db.doc(`USERS/${uid}`).get()
    if(doc.data().isExist) throw new Error("user-already-exists")
    const authData=await admin.auth().getUser(uid)
    if(!authData.disabled) throw new Error("user-already-exists")
    await admin.auth().updateUser(uid,{disabled:false})
    await db.doc(`USERS/${uid}`).update({isExist:true})
    return res.status(200).json({message: `User enabled Successfully`})
  } catch (error) {
    if(error.toString().match("user-already-exists"))
    return res.status(404).json({message: `User already enabled`})
    if(error.code==="auth/invalid-uid")
      return res.status(422).json({message: `UID cannot be empty string`})
    if(error.code==="auth/user-not-found")
      return res.status(404).json({message: `User does not exist with UID`})
    return res.status(422).json({message: `Failed to enable the user `})

    
  }
})

exports.api=functions.https.onRequest(app);