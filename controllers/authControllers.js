const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const maxAge = 5 * 24 * 60 * 60;
const createJWT = id => {
    return jwt.sign({id},
        'private code secret',
        {
            expiresIn: maxAge
        })
}

const alertError = (err) => {
    let errors = {email: '', password: ''};
    //console.log('error', err.message, err.code);
    // console.log(errors)

    if (err.message === 'incorrect email') {
        errors.email = 'This email not found'
    }
    if (err.message === 'incorrect pwd') {
        errors.password = 'Password was incorrect'
    }
    if (err.code === 11000) {
        errors.email = 'this email/username already register';
        errors.username = 'this email/username already register';
        return errors;
    }
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}


module.exports.signup = async (req, res) => {
    const {email, username, password} = req.body;

    try {
        const user = await User.create({email, username, password});
        const token = createJWT(user._id)
        res.cookie('jwt', token,
            {
                httpOnly: false,
                maxAge: maxAge * 1000
            })
        res.status(201).json({user});
    } catch (error) {
        let errors = alertError(error);
        res.json({errors});
    }
}
module.exports.login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.login(email, password);
        const token = createJWT(user._id)
        res.cookie('jwt', token,
            {
                httpOnly: false,
                maxAge: maxAge * 1000
            })
        res.status(201).json({user, token: token});
    } catch (error) {
        let errors = alertError(error);
       res.json({errors});
    }
}
module.exports.verifyuser = (req, res, next) => {
    if (req) {
        const token = req.cookies.jwt;
        if(token === '') {
            res.json()
            next()
        }
        jwt.verify(token, 'private code secret',
            async (err, decodedToken) => {
                if (err) {
                    console.log(err.message)
                } else {
                    let user = await User.findById(
                        decodedToken.id)
                    res.json(user)
                    next()
                }
            })
    }else {
        res.json()
        next()
    }
}

module.exports.getuser = (req, res, next) => {
    var id = mongoose.Types.ObjectId(req.params.id);
    User.findOne({
        _id: id
    }).then(
        (user) => {
            res.status(200).json(user);
        }
    ).catch(
        (error) => {
            let errors = alertError(error);
            res.json({errors});
        }
    );
};

module.exports.logout = (req, res) => {
    res.cookie('jwt', "",  {
        httpOnly: false
    })
    res.status(200).json({logout:true})
}