const CampGround = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (request, response) => {
    const { id } = request.params;
    const campground = await CampGround.findById(id);
    const review = new Review(request.body.review);
    review.author = request.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    request.flash("success", "New review was created");
    response.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (request, response) => {
    const { id, reviewId } = request.params;
    await CampGround.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    request.flash("success", "Successfully deleted a review");
    response.redirect(`/campgrounds/${id}`); 
}