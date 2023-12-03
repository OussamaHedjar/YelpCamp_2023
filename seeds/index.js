const mongoose = require("mongoose");
const cities = require("./cities");
const {places, descriptors} = require("./helpers")
const CampGround = require("../models/campground");

mongoose.connect('mongodb://127.0.0.1:27017/YelpCampDB')
    .then(() => {
        console.log("Connected.");
    })
    .catch(err => {
        console.log("connection error: ");
        console.log(err);
    })

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await CampGround.deleteMany({});
    for (let index = 0; index < 200; index++) {
        const randomElement = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 100;
        const camp = new CampGround({
            author: "6565f1335f3c0fef0da44996",
            location:`${cities[randomElement].city}, ${cities[randomElement].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:"A camp out of a group of camps.",
            geometry:{ 
                type: 'Point', 
                coordinates: [ 
                    cities[randomElement].longitude,
                    cities[randomElement].latitude,
                ] 
            },
            price: price,
            images: [
                {
                  url: 'https://res.cloudinary.com/dmpqyxuna/image/upload/v1701531494/YelpCamp/rgojesmp1ktmky2xvyqq.jpg',
                  filename: 'YelpCamp/edo8qqus15krnms8m0za'
                },
                {
                  url: 'https://res.cloudinary.com/dmpqyxuna/image/upload/v1701330271/YelpCamp/n2e6cjc2hkaxaliximzq.jpg',
                  filename: 'YelpCamp/hqbyjcgldogugk2gixrh'
                }
              ]
            
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})