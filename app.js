const express=require('express');
const app=express();
const mongoose=require('mongoose');
const Listing=require("../Major Project/models/listing");
const Review=require("../Major Project/models/review");
const path= require('path');
const methodOverride=require('method-override');
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/expressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");

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


// validate (server side) listing with JOI
let validateListing = (req, res, next)=>{  
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    } 
    else next();
}

// validate (server side) review with JOI
let validateReview = (req, res, next)=>{  
    let {error} = reviewSchemaSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    } 
    else next();
}

//Index Route
app.get("/listings",wrapAsync(async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
    })
);

//New Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
    })
);

//create route
app.post("/listings",validateListing,(wrapAsync(async(req, res, next)=>{
        const newListing=new Listing(req.body.listing);
        newListing.save();
        res.redirect("/listings");      
    }))
);

//Edit Route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
    })
);

//Update Route
app.put("/listings/:id",validateListing,(wrapAsync(async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings")
    }))
);

//Delete Route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
    })
);

//Reviews(POST Route)
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req, res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    // console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
}));

//Reviews(Delete Route)
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req, res)=>{
    let {id,reviewId} = req.params;

    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findById(reviewId);

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));


app.get("/",(req,res)=>{
    res.send("Hello, I am working");    
});

// app.get("/testListing",async (req,res)=>{
//     let sampleListing= new Listing({
//         title: "My new Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Goa",
//         country:"India" 
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Successful testing");
// });

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