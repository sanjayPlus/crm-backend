const jwt = require('jsonwebtoken')
// verify the token as middleware
const crmAuth = (req, res, next) => {
    const token = req.header('x-access-token') 
    if(!token) {
     return res.status(401).json("Access Denied No Token Provided")
    } 

    try{
        const verified = jwt.verify(token,process.env.JWT_CRM_SECRET_KEY );
        req.crm = verified
        next()
    }catch(err){
        res.status(400).json("Invalid Token")
    }

}

module.exports = crmAuth