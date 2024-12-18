const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Review= require("./review");

const listingSchema = new Schema({
    title: {
      type:String,
      required: true
    },
    description: String,
    image: {
      type:String,
      default:"default_link",
      set: (v) => v===""?"default_link":v
    },
    price: Number,
    location: String, 
    country: String,
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review"
      }
    ]
});

//post middleware for handling deletion of review after deletio of listing
listingSchema.post("findOneAndDelete", async(listing)=>{
  if(listing)
  await Review.deleteMany({_id: {$in: listing.reviews}});
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;