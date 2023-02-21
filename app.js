const express  = require( "express" );
const mongoose = require( "mongoose" );


const admin = require("firebase-admin");
//const serviceAccount = require("./key.json");

const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
require("dotenv").config();
const app = express(); 
const port = 3000; 
app.use( express.urlencoded( { extended: true} ) ); 
app.set( "view engine", "ejs" );


mongoose.set("strictQuery", false);
mongoose.connect( 'mongodb://localhost:27017/team', { useNewUrlParser: true, useUnifiedTopology: true });


app.listen ( port, () => {
    // template literal
    console.log ( `Server is running on http://localhost:${port}` );
});

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.use (passport.initialize());
app.use (passport.session());

//using remote firebase
/*admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://1:586736000761:web:ad7df7c80eb39c78bb4c28.firebaseio.com"
  });
*/
//using local mongoose
const userSchema = new mongoose.Schema ({
    username: String,
    password: String
})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
    res.sendFile(__dirname+ "/src/Home.html");
})
app.get('/Register', (req, res) => {
    res.sendFile(__dirname+ "/src/Register.html");
});
app.get('/Account', (req, res) => {
    if (req.isAuthenticated()){
        try{
            res.render("Account")
        }
        catch(error)
        {
            console.log(error);
        }
    }
    
})

//Log in
app.post( "/login", ( req, res ) => {
    console.log( "User " + req.body.username + " is attempting to log in" );
    const user = new User ({
        username: req.body.username,
        password: req.body.password
    });
    req.login ( user, ( err ) => {
        if ( err ) {
            console.log( err );
            res.redirect( "/" );
        } else {
            passport.authenticate( "local" )( req, res, () => {
                res.redirect( "/Account" ); 
            });
        }
    });
});

app.post("/Register", (req, res) => {
    console.log( "User " + req.body.username + " is attempting to register" );
    console.log("User Password: " + req.body.password);
    console.log("User confirmation: " + req.body.confirm);
    
    //enable oauth2 authentication  
    
    
    User.register({ username : req.body.username }, 
                    req.body.password, 
                    ( err, user ) => {
        if ( err ) {
        console.log( err );
            res.redirect( "/" );
        } else {
            passport.authenticate( "local" )( req, res, () => {
                res.redirect( "/Account" );
            });
        }
    });
})

app.post('/Account', (req, res) => {
    console.log("chosen skill is " + req.body.skill);
    res.redirect("/Account")
})

/*const userAccountSchema = new mongoose.Schema ({
    username: String,
    name: String,
    bio: String,
    skills: String
})*/