const express = require("express");
const router = express.Router();
const User = require("../models/user");
const users = require("../controllers/users");
const AsyncWrapper = require("../helpers/Wrapper");
const passport = require("passport");
const {storeReturnTo} = require("../middleware.js");

router.get("/register", users.renderUserForm)

router.post("/register", AsyncWrapper(users.register))

router.get("/login", users.renderLoginForm)

router.post("/login", storeReturnTo , passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}) ,AsyncWrapper(users.postLogin))

router.get('/logout', users.logOut); 

module.exports = router;