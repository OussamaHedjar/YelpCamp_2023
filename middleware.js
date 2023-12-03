const {campgroundSchema, reviewSchema} = require("./validationSchemas.js");
const ExpressError = require("./helpers/ExpressError");
const CampGround = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (request, response, next) => {
    if(!request.isAuthenticated()){
        request.flash("error", "You must be signed in")
        request.session.returnTo = request.originalUrl;
        return response.redirect("/login")
    }
    next();
}

module.exports.storeReturnTo = (request, response, next) => {
    if (request.session.returnTo) {
        response.locals.returnTo = request.session.returnTo;
    }
    next();
}

module.exports.IsAuthor = async (request, response, next) => {
    const { id } = request.params;
    const campground = await CampGround.findById(id);
    if(!campground.author.equals(request.user._id)){
        request.flash("error", "You do not have permission to do this");
        return response.redirect(`/campgrounds/${id}`);  
    }
    next();
}

module.exports.IsReviewAuthor = async (request, response, next) => {
    const { id, reviewId } = request.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(request.user._id)){
        request.flash("error", "You do not have permission to do this");
        return response.redirect(`/campgrounds/${id}`);  
    }
    next();
}

module.exports.validateCampground = (request, response, next) => {
    const {error} = campgroundSchema.validate(request.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400)
    } else{
        next();
    }
}

module.exports.validateReview = (request, response, next) => {
    const {error} = reviewSchema.validate(request.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400)
    } else{
        next();
    }
}