const mongoose = require("mongoose");
const passportM = require("passport-local-mongoose");
const Schema = mongoose.Schema;


const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
userSchema.plugin(passportM);

const User = mongoose.model("User", userSchema);
module.exports = User;