const CampGround = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken:  mapBoxToken});
const { cloudinary } = require("../cloudinary");

module.exports.index = async (request, response) => {
    const campgrounds = await CampGround.find();
    response.render("campgrounds/index", {campgrounds});
}

module.exports.renderNewCamp = async (request, response) => {
    response.render("campgrounds/new");
}

module.exports.createNewCamp = async (request, response) => {
    const geoReponse = await geocoder.forwardGeocode({
        query: request.body.campground.location,
        limit: 1 
    }).send()
    const campground =  new CampGround(request.body.campground);
    campground.geometry = geoReponse.body.features[0].geometry;
    campground.images = request.files.map(f => ({url: f.path, filename: f.filename}));
    console.log(campground);
    campground.author = request.user._id;
    await campground.save();
    request.flash("success", "Successfully created a new campground");
    response.redirect(`/campgrounds/${campground._id}`);
}


module.exports.showCampGround = async (request, response) => {
    const { id } = request.params;
    const campground = await CampGround.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    if (!campground) {
        request.flash("error", "Campground could not be found");
        return response.redirect("/campgrounds")
    }
    response.render("campgrounds/show", {campground});
}


module.exports.renderEditCamp = async (request, response) => {
    const { id } = request.params;
    const campground = await CampGround.findById(id); 
    if (!campground) {
        request.flash("error", "Campground could not be found");
        return response.redirect("/campgrounds")
    }
    if(!campground.author.equals(request.user._id)){
        request.flash("error", "You do not have permission to update this campground");
        return response.redirect(`/campgrounds/${campground._id}`);  
    }
    response.render("campgrounds/edit", {campground});
}

module.exports.updateCampGround = async (request, response) => {
    const { id } = request.params;
    const campground = await CampGround.findByIdAndUpdate(id, {... request.body.campground});
    const imgs = request.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(request.body.deleteImages){
        for (let filename of request.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
    }
        await campground.updateOne({$pull: {images: {filename: {$in: request.body.deleteImages } } } } );
        console.log(campground)
    }
    request.flash("success", "Successfully updated the campground");
    response.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampGround = async (request, response) => {
    const { id } = request.params;
    await CampGround.findByIdAndDelete(id);
    request.flash("success", "Successfully deletd the campground");
    response.redirect(`/campgrounds`);
}