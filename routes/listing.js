const express= require("express");
const router= express.Router();
const wrapAsync=require("../utils/wrapAsync");
const ExpressError=require("../utils/expressError");
const {listingSchema} = require("../schema");
const Listing=require("../models/listing");


// validate (server side) listing with JOI
let validateListing = (req, res, next)=>{  
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    } 
    else next();
}

//Index Route
router.get("/",wrapAsync(async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
    })
);

//New Route
router.get("/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id",wrapAsync(async (req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
    })
);

//create route
router.post("/",validateListing,(wrapAsync(async(req, res, next)=>{
        const newListing=new Listing(req.body.listing);
        newListing.save();
        res.redirect("/listings");      
    }))
);

//Edit Route
router.get("/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
    })
);

//Update Route
router.put("/:id",validateListing,(wrapAsync(async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings")
    }))
);

//Delete Route
router.delete("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
    })
);

module.exports= router;