function privateRoute (req, res, next) {
    if (req.session.user && req.cookies.connect_sid)
        next();
    else res.redirect('/');
}

module.exports = privateRoute