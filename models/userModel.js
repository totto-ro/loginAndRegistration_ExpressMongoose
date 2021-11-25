const mongoose = require( 'mongoose' );

const UserSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : [true, "First name is required"],
        minlength : [2, "First name can not be less than 2 characters"],
        maxlength : [20, "First name can not exceed the 20 characters"]
    },
    lastName : {
        type : String,
        required : [true, "Last name is required"],
        minlength : [2, "Last name can not be less than 2 characters"],
        maxlength : [20, "Last name can not exceed the 20 characters"]
    }, 
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email"
        },
        required: [true, "Email is required"]
    },

    /*
    email : {
        type : String,
        required : true,
        minlength : 5,
        maxlength : 150,
        unique:true,
    },
    */
    password : {
        type : String,
        required : true,
        minlength : [5, "Password can not be less than 5 characters"],
        maxlength : [200, "Password can not exceed the 200 characters"]
    },
    birthday : {
        type : Date,
        required : [true, "Birthday is required"]
    },  
    
    
    
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const User = mongoose.model( 'users', UserSchema );

const UserModel = {
    createUser : function( newUser ){
        return User.create( newUser );
    },
    getAllUser : function( ){
        return User.find().sort( { created_at: -1 } );
    },

    getUserByEmail : function( email ){
        return User.findOne( {email: email} );
    },

    getUserById : function( id ){
        return User.findOne( { _id : id } );
    },
    updateUser : function( id, newMessage ){
        return User.updateOne( { _id : id }, newMessage );
    },
    destroyUser : function( id ){
        return User.deleteOne({ _id : id });
    },

};

module.exports = {UserModel};