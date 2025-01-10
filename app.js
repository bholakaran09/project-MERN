// if(process.env.NODE.ENV !="production"){
// }
    require('dotenv').config()
// console.log(process.env.OK);

const express=require('express');
const app=express();
const mongoose=require('mongoose');
const path= require('path');
const methodOverride=require('method-override');
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/expressError.js"); 
const session= require("express-session");
const flash= require("connect-flash");
const passport= require("passport");
const LocalStrategy= require("passport-local");
// const User= require("./models/user.js");
const User = require('./models/user.js');

const listingRouter= require("./routes/listing.js");
const reviewRouter= require("./routes/reviews.js");
const userRouter= require("./routes/user.js");


const sessionOptions={
    secret: "secretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 604800000,
        maxAge: 604800000, 
        httpOnly: true
    }
};
const Mongo_URL="mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(Mongo_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"public")));
app.use(express.json());

// app.get("/",(req,res)=>{
//     res.send("Hello, I am working");    
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));   

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!!!"));
});

app.use((err, req, res, next)=>{
    let {status=500, message="Something went wrong"} = err;
    res.status(status).render("listings/error.ejs",{message});
    // res.status(status).send(message);
});

app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
})