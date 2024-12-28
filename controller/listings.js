const Listing=require("../models/listing");
const ExpressError=require("../utils/expressError");

module.exports.index= async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm= (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing= async (req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id).populate({path:"reviews", populate: {path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing does not exist!!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing= async(req, res, next)=>{
    const newListing=new Listing(req.body.listing);
    newListing.owner= req.user._id;
    newListing.save();
    req.flash("success","New listing created!!");
    res.redirect("/listings");      
};

module.exports.renderEditForm= async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
};

module.exports.updateListing= async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }   
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Listing Updated");
    res.redirect("/listings");
};

module.exports.destroyListing= async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted");
    res.redirect("/listings");
};