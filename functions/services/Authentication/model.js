const { db,admin } = require("../../utils/admin");
const UTILS = require("./utils");

class Model {
    constructor(user) {
        this.actionPerformer = user
        this.serverTimestamp = admin.firestore.FieldValue.serverTimestamp()
    }
    async _create_user(inputs) {
        let userInfo = {};
        return admin.auth().createUser({
            email:inputs.email,
            password:inputs.password
        })
        .then((user)=>{
            userInfo = user
            return admin.auth().setCustomUserClaims(user.uid,{role:"user"})
        })
        .then(()=>{
            const userRef = db.collection("USERS").doc(userInfo.uid)
            const inputData={}
            Object.entries(inputs).forEach(([key,value])=>{
                if(key !== "password") inputData[key] = value     //so password doesn't appear in doc
            })
            return userRef.set({
                ...inputData,
                isExist:true,
                createdAt:this.serverTimestamp,
                role:"user",
                id:userRef.id,
                uid:userInfo.uid,
            })
        })
        .catch((err)=>{
           throw err
        })
    }

    async _update_user(inputs,uid) {
        return UTILS._check_user_exists(uid)
        .then(()=>{         
            return db.doc(`USERS/${uid}`).update(inputs)              //db.collection("USERS").doc(req.user.uid).set({...})  we can also write lyk this
            // return db.doc(`USERS/${user.uid}`).set({                      //If we don't want to override we use 'merge' (or) can write 'update' instead  of 'set' and remove 'merge:true' statement too
            //     phoneNumber:user.phoneNumber,
            //     displayName:user.displayName
            // }, {merge:true})   
               
            })
            .catch((err)=>{
                throw err
            })
    }

    async _get_user(uid) {
        let userInfo= {}
        return UTILS._check_user_exists(uid)
         .then((data)=>{
             userInfo = {...userInfo,...data}
             return userInfo
         })
         .catch((err)=>{
             throw err
         })
    }

    async _delete_user(uid) {
        return UTILS._check_user_exists(uid)
        .then(()=>{
            return admin.auth().updateUser(uid,{disabled:true})
        })
        .then(()=>{
           return db.doc(`USERS/${uid}`).update({isExist:false})
        })
        .catch((err)=>{
            throw err
        })
    }

    async _enable_user(uid) {
        return UTILS._check_user_deleted(uid)
            .then(()=>{
                return admin.auth().updateUser(uid,{disabled:false})
            })
            .then(()=>{
                return db.doc(`USERS/${uid}`).update({isExist:true})
            })                
            .catch((err)=>{
                throw err
            })
    }

    async _change_password(password) {
        return admin.auth().updateUser(this.actionPerformer.uid,{password:password})
        .catch((err)=>{
            throw err
        })
    }

}

module.exports = Model