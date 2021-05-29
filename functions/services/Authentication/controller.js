const router = require("express").Router()
const Model = require("./model")
const {closedend} = require("../../endpoints")

router.post("/createUser",(req,res)=>{
    const inputs = req.body;
    const obj = new Model()
    return obj._create_user(inputs)
    .then(()=>{
        return res.status(201).json({message: `User created successfully`})
    })
    .catch((err)=>{
        console.error(err)
        if(err.code === "auth/invalid-password")
            return res.status(422).json({message:`Password must contain atleast 6 characters`})
        if(err.code === "auth/email-already-exists")
            return res.status(422).json({message:`This email address already exists `})
        if(err.code === "auth/invalid-uid")
            return res.status(422).json({message:`The uid must be  string with at most 128 characters `})
        if(err.code === "auth/invalid-email")
            return res.status(422).json({message:`This email is not valid must be a string`})
        return res.status(422).json({ message:`Failed to create user`})
    })
})

router.patch("/updateUser",closedend,(req,res)=>{
    const {uid}=req.query
    const inputs=req.body
    const obj = new Model(req.user)
    return obj._update_user(inputs,uid)
    .then(()=>{
        return res.status(202).json({ message: `User updated successfully`})
    })
    .catch((err)=>{
        console.log(err)
        if(err.code === "auth/invalid-phone-number")   //we write '.code' cozz in terminal in 'errorInfo': in 'code' the error is shown
            return res.status(422).json({message: `Invalid phone number attach country code along with your number`})
        if(err.code === "auth/invalid-uid")
            return res.status(422).json({message:`UID can not be an empty string`})
        if(err.code === "auth/user-not-found" || err.toString().match("user-not-exists"))
            return res.status(422).json({message:`There is no user with this uid`})
        if(err.code === "auth/phone-number-already-exists")
            return res.status(422).json({message: err.message})
        return res.status(422).json({ message:`Failed to update the user`})

    })
})

router.get("/user",closedend,(req,res)=>{
    const {uid}=req.query
    const obj = new Model(req.user)
    return obj._get_user(uid)
    .then((data)=>{
        return res.status(200).json({data})
    })
    .catch((err)=>{
        console.log(err)
        if(err.code === "auth/invalid-uid")
            return res.status(422).json({message:`UID can not be an empty string`})
        if(err.code === "auth/user-not-found" ||err.toString().match("user-not-exists"))
            return res.status(422).json({message:`There is no user with this uid`})
        return res.status(422).json({ message:`Failed to get user`})
    })
})

router.delete("/user",closedend,(req,res)=>{
    const {uid}=req.query
    const obj = new Model(req.user)
    return obj._delete_user(uid)
    .then(()=>{
        return res.status(200).json({message:`User deleted successfully`})
    })
    .catch((err)=>{
        console.error(err)
    if(err.code === "auth/invalid-uid")
        return res.status(422).json({message:`UID can not be an empty string`})
    if(err.code === "auth/user-not-found" || err.toString().match("user-not-exists"))
        return res.status(404).json({message:`There is no user with this uid or user already deleted`})
    return res.status(422).json({ message:`Failed to delete the  user`})
    })
    
})

router.put("/enableUser",closedend, async(req,res)=>{
    const {uid}=req.query
    const obj = new Model(req.user)
    return obj._enable_user(uid)
    .then(()=>{
        return res.status(200).json({message:`User enabled successfully`})    })
    .catch((err)=>{
        console.error(err)
        if(err.toString().match("user-already-exists"))
            return res.status(404).json({message:`User enabled already`})
        if(err.code === "auth/invalid-uid")
            return res.status(422).json({message:`UID can not be an empty string`})
        if(err.code === "auth/user-not-found")
            return res.status(404).json({message:`There is no user with existing uid`})
        return res.status(422).json({ message:`Failed to enable user`})
    })
    
})

router.put("/changepassword",closedend,(req,res)=>{
    const {password} = req.body
    if(!password) {
        return res.status(422).json({message:`Invalid password`})
    }
    const obj = new Model(req.user)
    return obj._change_password(password)
    .then(()=>{
        return res.status(200).json({ message:`Password changed successfully for ${req.user.email}`})
    })
    .catch((err)=>{
        console.error(err)
        return res.status(500).json({ message:`Failed to change password`})
       
    })
})


module.exports =router