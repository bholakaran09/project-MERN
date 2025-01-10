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
    let url= req.file.path;
    let filename= req.file.filename;
    const newListing=new Listing(req.body.listing);
    newListing.owner= req.user._id;
    newListing.image={url, filename};
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
    let {id}= req.params;
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }   
    let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){
        let url= req.file.path;
        let filename= req.file.filename;
        listing.image={url, filename};
        await listing.save();
    }
    req.flash("success","Listing Updated");
    res.redirect("/listings");
};

module.exports.destroyListing= async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted");
    res.redirect("/listings");
};

module.exports.category=async (req, res)=>{
    // const allListings=await Listing.find({});
    let {category}= req.body;
    let allListings=await Listing.find({category});
    res.render("listings/index.ejs",{allListings});
};

module.exports.search= async (req, res) => {
    const keyword = req.query.keyword;
    // console.log('Query parameters:', req.query);

    if (!keyword) {
        return res.status(400).flash({ message: 'Keyword is required' });
    }

    try {
        const searchResults = await Listing.find({
            $or: [
                { title: { $regex: keyword, $options: 'i' } }, // 'i' for case-insensitive
                { description: { $regex: keyword, $options: 'i' } }
            ]
        });

        if (searchResults.length === 0) {
            res.status(404).render("listings/error.ejs",{message:"No matching result found"});
        }

        // res.json(searchResults);
        res.render("listings/index.ejs",{allListings:searchResults});
    } catch (error) {
        console.error('Error searching items:', error);
        res.status(500).render("listings/error.ejs",{message:"Internal Server Error "});
    }
};