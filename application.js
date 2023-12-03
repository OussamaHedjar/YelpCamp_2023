if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
} // this is used when we're in development mood, so we can access our private data with no worries.

const express = require("express");
const application = express();
const ejsMate = require("ejs-mate"); 
const path = require("path");
const ExpressError = require("./helpers/ExpressError");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const campGroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const usersRoutes = require("./routes/users");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStartegy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const atlasConnect = process.env.ATLAS_CONNECT; // Rememeber This is a private token.
const MongoStore = require('connect-mongo');

// old url: 'mongodb://127.0.0.1:27017/YelpCampDB'

mongoose.connect("mongodb://127.0.0.1:27017/YelpCampDB")
    .then(() => {
        console.log("Connected.");
    })
    .catch(err => {
        console.log("connection error: ");
        console.log(err);
    })    



application.listen(3000, () => {
    console.log("Listening on port 3000");
})



application.engine("ejs", ejsMate);
application.use(express.urlencoded({extended : true})); // runs the callback function at any recieved request. The method does not matter.
application.use(express.json());
application.use(methodOverride("_method"));
application.set("views", path.join(__dirname,"views"));
application.use(express.static(path.join(__dirname, "public")));
application.set("view engine", "ejs");
application.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: "mongodb://127.0.0.1:27017/YelpCampDB",
    touchAfter: 24 * 60 * 60, //if the data is untouched and not updated then we update after 24hrs, not continuesly.
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error",function(e){
    console.log("SESSION STORE ERROR", e);
})

const sessionOpts = {
    store,
    name: "maps", // attribute used to alter the name of the cookie.
    secret: "secretOfSecrets",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // I can add attribute {secure: true} but this will break things becuase this our cookie only works on https which localhost is not.
        expires: Date.now() + 1000 * 3600 * 24 * 7,
        maxAge: 1000 * 3600 * 24 * 7
    }
}

// ANYTHING ADDED FROM Scripts, Images, Fonts, ...etc and is not included the security policy will refuse it, so it must be added to one of the arrays.

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];

const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
application.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dmpqyxuna/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

application.use(session(sessionOpts));
application.use(flash());
application.use(passport.initialize())
application.use(passport.session())
passport.use(new LocalStartegy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


application.use((request, response, next) => {
    response.locals.SignedInUser = request.user;
    response.locals.success = request.flash("success");
    response.locals.error = request.flash("error");
    next();
})

application.use("/", usersRoutes);
application.use("/campgrounds", campGroundsRoutes);
application.use("/campgrounds/:id/reviews", reviewsRoutes);

application.get("/", (request, response) => {
    response.render("home");
})

application.all("*", (err, request, response, next) => {
    next(new ExpressError("Page Not Found", 404));
})


// Our main ERROR HANDLER, our customised error class will provide its data only.
application.use((err, request, response, next) => {
    const { statusCode = 500} = err; // TThis is a backup, incase one of them is missing in the request.
    console.log("Error has occured :(");
    if (!err.message) err.message = "Error has occured :(" 
    response.status(statusCode).render("error", {err});
    //next(err);
})
