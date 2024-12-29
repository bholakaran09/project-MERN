const express= require("express");
const router= express.Router();
const wrapAsync=require("../utils/wrapAsync");
const {isLoggedIn, isOwner, validateListing}= require("../middleware");
const listingController= require("../controller/listings");
const multer =require("multer");
const {storage}=require("../cloudConfig");
const upload=multer({ storage });


router.route("/")
.get(wrapAsync(listingController.index)) //Index route
.post(isLoggedIn,upload.single("listing[image]"),validateListing,(wrapAsync(listingController.createListing))); //Create route

//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing)) //show route
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing)) //Update route
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing)); //delete route

//Edit Route
router.get("/:id/edit",isLoggedIn,wrapAsync(listingController.renderEditForm));

module.exports= router;