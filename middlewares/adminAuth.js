const jwt = require('jsonwebtoken')

const adminAuth = async(req, res, next) => {
    const token = req.header('x-access-token')
    if(!token) {
        return res.status(401).json("Access Denied No Token Provided")
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_ADMIN_SECRET_KEY)
        req.admin = verified
        next()
    } catch (error) {
        console.log(error);
        res.status(400).json("Invalid Token");
    }
}