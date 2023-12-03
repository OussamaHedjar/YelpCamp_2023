const User = require("../models/user");

module.exports.renderUserForm = (req, res) => {
    res.render("users/register");
}

module.exports.register = async (req, res) => {
    try {
        const { email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
           req.flash("success", "Welcome to YelpCamp");
           res.redirect("/campgrounds"); 
        })
        
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/register");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
}

module.exports.postLogin = async(req, res) => {
    req.flash("success", "Welcome back!!");
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}


module.exports.logOut = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}