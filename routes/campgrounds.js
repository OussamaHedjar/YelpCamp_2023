const express = require("express");
const router = express.Router();
const AsyncWrapper = require("../helpers/Wrapper");
const campgrounds = require("../controllers/campgrounds"); 
const { isLoggedIn, IsAuthor, validateCampground } = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudinary")
const upload = multer({storage});


router.route("/")
    .get(AsyncWrapper(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, AsyncWrapper(campgrounds.createNewCamp))

router.get("/new", isLoggedIn ,campgrounds.renderNewCamp)


router.route("/:id")
    .get(AsyncWrapper(campgrounds.showCampGround))
    .put(isLoggedIn, IsAuthor, upload.array("image"), validateCampground, AsyncWrapper(campgrounds.updateCampGround))
    .delete(isLoggedIn, IsAuthor, AsyncWrapper(campgrounds.deleteCampGround))

router.get("/:id/edit", isLoggedIn, IsAuthor, AsyncWrapper(campgrounds.renderEditCamp))

module.exports = router;