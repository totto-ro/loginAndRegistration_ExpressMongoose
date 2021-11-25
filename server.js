const express = require( 'express' );
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const bcrypt = require( 'bcrypt' );

mongoose.connect( 'mongodb://localhost/users_db', {useNewUrlParser:true} );

const { UserModel } = require('./models/userModel');

app.use(flash());
app.set('views', __dirname + '/views'); 
app.set('view engine', 'ejs');
app.use( express.static(__dirname + '/static') );
app.use(session({
    secret: 'verySecret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 30}
}));

app.use( express.urlencoded({ extended: true }) );

//render index 
app.get("/", function( request, response ){
    response.render( 'index' )
});

//render landing page
app.get("/dashboard", function( request, response ){
    if( request.session.email === undefined ){
        response.redirect( '/' );
    }
    else{
        UserModel
            .getAllUser()
            .then( data => {
                console.log( data );
                let currentUser = {
                    firstName : request.session.firstName, 
                    lastName : request.session.lastName,
                    email :  request.session.email
                }
                response.render( 'dashboard', { users : data, currentUser } );
            }); 
    }
});

//create user
app.post("/register", function( request, response ){
    console.log(request.body);

    const firstName = request.body.firstName;
    const lastName = request.body.lastName;
    const email = request.body.email;
    const birthday = request.body.birthday;
    const password = request.body.password;
    const confirmPass = request.body.confirm;

    if(password !== confirmPass){
        request.flash('messageError', "The password and confirmation password didn't match");
        response.redirect( '/' );
    }

    bcrypt.hash( password, 10 )
        .then( encryptedPassword => {
            const newUser ={
                firstName,
                lastName,
                email,
                birthday,
                password : encryptedPassword
            };

            UserModel
                .createUser( newUser )
                .then( result => {

                    console.log("New message: " + result);
                    console.log("---------------------------- ");
                    request.session.firstName = result.firstName;
                    request.session.lastName = result.lastName;
                    request.session.email = result.email;
                    response.redirect( '/dashboard' );
                })
                .catch( error => {
                    let errMsg;
                    if (error.code == 11000) {
                    errMsg = "That " + Object.keys(error.keyValue)[0]  + " is already register! Try again or login";
                    } else {
                    errMsg = error.message;
                    }
                    console.log( "Something went wrong!", error );
                    request.flash( 'messageError', errMsg );
                    response.redirect( '/' );
                
                })
            
        });
});

//login
app.post( '/login', function( request, response ){
    let email = request.body.email;
    let password = request.body.password;
    console.log(email, password)
    UserModel
        .getUserByEmail( email )
        .then( result => {
            console.log( "Result here: ", result );

            if( result === null ){
                throw new Error( "That user doesn't exist!" );
            }

            bcrypt.compare( password, result.password )
                .then( flag => {
                    if( !flag ){
                        console.log( flag );
                        throw new Error( "Wrong credentials!" );
                    }
                    console.log( "----------------", flag );
                    request.session.firstName = result.firstName;
                    request.session.lastName = result.lastName;
                    request.session.email = result.email;
                    response.redirect( '/dashboard' );
                })
                .catch( error => {
                    request.flash( 'login', error.message );
                    response.redirect( '/' );
                }); 
        })
        .catch( error => {
            request.flash( 'login', error.message );
            response.redirect( '/' );
        });
});

app.post( '/logout', function( request, response ){
    request.session.destroy();
    response.redirect( '/' ); 
});



app.listen(8080, function() {
    console.log("running on port 8080")
});