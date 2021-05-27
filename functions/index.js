const functions = require("firebase-functions");
const app = require("express")();
const {admin,db}=require("./utils/admin")
app.post("/createUser",(req,res)=>{
    const inputs=req.body;
   console.log("hello")
    return admin.auth().createUser({
        email:inputs.email,
        password:inputs.password
    }).then((user)=>{
        req.user = user;
        return admin.auth().setCustomUserClaims(user.uid,{ role:"user"})
    }).then(()=>{
        const userRef=db
        .collection("USERS")
        .doc(req.user.uid)
        return userRef
        .set({
            ...inputs,
            isExists:true,
            createdAt:admin.firestore.FieldValue.serverTimestamp(),
            role:"user",
            id:req.user.uid,
            uid:req.user.uid
        })
    }).then(()=>{
        return res.send("User created sucessfully")
    }).catch((err)=>{
        console.log(err)
        return res.send("Failed to create the user")
    })
    
})

exports.ap1=functions.https.onRequest(app);

