const express= require("express");
const router= express.Router({mergeParams: true});
const wrapAsync=require("../utils/wrapAsync");
const {validateReview,isLoggedIn, isReviewAuthor}= require("../middleware");
const reviewController= require("../controller/reviews");

//Reviews(POST Route)
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//Reviews(Delete Route)
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports= router;