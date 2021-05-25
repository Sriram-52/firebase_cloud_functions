const functions = require("firebase-functions");

const app=require("express");
const {admin}=require("./utils/admin")
app.post("/createUser",(req,res)=>{
  const inputs=req.body
  return admin.auth.createUser({
    email : inputs.email,
    password : inputs.password
  })
  .then((user)=>{
    
  })
})




exports.api=functions.https.onRequest(app);