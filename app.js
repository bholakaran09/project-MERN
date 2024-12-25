const express=require('express');
const app=express();
const mongoose=require('mongoose');
const path= require('path');
const methodOverride=require('method-override');
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/expressError.js"); 
const listings= require("./routes/listing.js");
const reviews= require("./routes/reviews.js");
const session= require("express-session");
const flash= require("connect-flash");

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

app.get("/",(req,res)=>{
    res.send("Hello, I am working");    
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);


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