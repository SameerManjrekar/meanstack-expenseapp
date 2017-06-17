const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String },
    username: { type: String },
    password: { type: String },
    lastlogin: { type: Date }
});

userSchema.pre('save', function(next) {
    const users = this;
    SALT_FACTOR = 10;

    if(!users.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
        if(err) return next(err);

        bcrypt.hash(users.password, salt, null, (err, hash) => {
            if(err) return next(err);
            users.password = hash;
            next();
        });        
    });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if(err) {
            return callback(err);
        } else {
            return callback(null, isMatch);
        }
    });
};

module.exports = mongoose.model('User', userSchema);