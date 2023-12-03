const express = require("express");
const router = express.Router({mergeParams: true});
const {validateReview, isLoggedIn, IsReviewAuthor} = require("../middleware.js");
const AsyncWrapper = require("../helpers/Wrapper");
const reviews = require("../controllers/reviews");

router.post("/", isLoggedIn ,validateReview, AsyncWrapper(reviews.createReview))

router.delete("/:reviewId", isLoggedIn, IsReviewAuthor, AsyncWrapper(reviews.deleteReview))

module.exports = router;