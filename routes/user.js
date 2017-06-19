const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config/database');



router.post('/register', (req, res, next) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    if(!req.body.firstname) {
        console.log(req.body.firstname);
        res.json({ success: false, message: 'First name not provided' });
    } else {
        if(!lastname) {
            res.json({ success: false, message: 'Last name not provided '});
        } else {
            if(!email) {
                res.json({ success: false, message: 'E-mail not provided '});
            } else {
                if(!username) {
                    res.json({ success: false, message: 'User name not provided '});
                } else {
                    if(!password) {
                        res.json({ success: false, message: 'Passsword not provided '});
                    } else {
                        User.findOne({ username: username }, (err, existingUser) => {
                            if(err) {
                                res.json({ success: false, message: err });
                            }
                            if(existingUser) {
                                res.json({ success: false, message: 'Username already exists' });
                            }

                            let newUser = new User({
                                firstname: firstname,
                                lastname: lastname,
                                email: email,
                                username: username,
                                password: password 
                            });

                            newUser.save((err, user) => {
                                if(err) {
                                    res.json({ success: false, message: 'Error in creating a new user' });
                                } else {
                                    res.json({ success: true, message: 'User Created Sucessfully!!'});
                                }
                            });
                        });                        
                    }
                }
            }
        } 
    }     
});

router.post('/login', (req, res) => {
    User.findOne({ username: req.body.username}, (err, user) => {
        if(err) {
            res.json({ success: false, message: err });
        }

        if(!user) {
            res.json({ success: false, message: 'Username does not exists' });
        } else if(user) {
            user.comparePassword(req.body.password, (err, isMatch) => {
                if(isMatch && !err) {
                    const token = jwt.sign(user, config.secret, {
                        expiresIn: config.tokenexp
                    });

                    user.lastlogin = new Date();

                    user.save((err) => {
                        if(err) {
                            res.json({ success: false, message: err });
                        } else {                            
                                res.json({ success: true, message: { userId: user._id, username: user.username,
                                            firstname: user.firstname, email: user.email, lastlogin: user.lastlogin },token: token});                            
                        }
                    });
                } else {
                        res.json({ success: false, message: 'Pasword Mismatch' });
                    }
            });
        } 
    });
});

//This Method is written here so that all functions after this will need an Authorization token 
//for requests otherwise function will return err object from json that Authorization token is 
//expired
router.use((req, res, next) => {
    // check header or url parameters or post parameters for token
    const token = req.body.token || req.query.token || req.headers['authorization'];
    if(token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if(err) {
                res.json({ success: false, message: 'Authentication token expired, please log in again', errcode: 'exp-token'});
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.json({ success: false, message: 'Authenticate token not available', errcode: 'no-token'});
    }
});

router.get('/user/:id', (req, res, next) => {
    User.find({ _id: req.params.id}).exec((err, user) => {
        if(err) {
            res.json({ success: false, message: 'Username not found' });
        } else {
            res.json({ success: true, message: user });
        }
    });
});

    router.put('/user/:id', (req, res, next) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const userid = req.params.id;

    if(!firstname || !lastname || !email || !userid) {
        res.json({ success: false, message: 'No proper data was provided' });
    } else {
        User.findById(userid).exec((err, user) => {
            if(err) {
                res.json({ success: false, message: 'No User name found' });
            }

            if(user) {
                user.firstname = firstname;
                user.lastname = lastname;
                user.email = email;
            }

            user.save((err) => {
                if(err) {
                    res.json({ success: false, message: 'Error processing request' });
                } else {
                    res.json({ success: true, message: 'User details updated successfully' });
                }
            });
        });        
    }
});

router.put('/password/:id', (req, res) => {
    const userid = req.params.id;
    const oldpassword = req.body.oldpassword;
    const password = req.body.password;

    if(!userid || !oldpassword || !password) {
        res.json({ success: false, message: 'Posted data is incomplete!!' });
    } else {
        User.findOne({ _id: userid}, (err, user) => {
            if(err) {
                res.json({ success: false, message: 'Error processing request' + err });
            }
            if(user) {
                user.comparePassword(oldpassword, (err, isMatch) => {
                    if(isMatch && !err) {
                        user.password = password;

                        user.save((err) => {
                            if(err) {
                                res.json({ success: false, message: 'Error processing request' + err });
                            } else {
                                res.json({ success: true, message: 'Password Updated successfully' });
                            }
                        });
                    }
                });
            } else {
                res.json({ success: false, message: 'Old Password incorrect' });
            }
        });
    }
});

module.exports = router;
