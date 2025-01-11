const mongoose=require('mongoose');
const initData =require("./data");
const Listing=require("../models/listing");

const Mongo_URL="mongodb+srv://adamsmithok9:jGFGaGGBYIBpfJl0@cluster0.c63ef.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(Mongo_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

const initDB=async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData);
    console.log("Data was saved");
};

initDB();