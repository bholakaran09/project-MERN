const mongoose=require('mongoose');
const Schema=mongoose.Schema;

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
    country: String
});

const Listing = mongoose.model("Listing",listingSchema);

module.exports = Listing;