const express= require("express");
const router= express.Router();
const wrapAsync=require("../utils/wrapAsync");
const ExpressError=require("../utils/expressError");
const Listing=require("../models/listing");
const {isLoggedIn, isOwner, validateListing}= require("../middleware");


//Index Route
router.get("/",wrapAsync(async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
    })
);

//New Route
router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id",wrapAsync(async (req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id).populate({path:"reviews", populate: {path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing does not exist!!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
    })
);

//create route
router.post("/",isLoggedIn,validateListing,(wrapAsync(async(req, res, next)=>{
        const newListing=new Listing(req.body.listing);
        newListing.owner= req.user._id;
        newListing.save();
        req.flash("success","New listing created!!");
        res.redirect("/listings");      
    }))
);

//Edit Route
router.get("/:id/edit",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
    })
);

//Update Route
router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync(async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }   
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Listing Updated");
    res.redirect("/listings");
    })
);

//Delete Route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted");
    res.redirect("/listings");
    })
);

module.exports= router;