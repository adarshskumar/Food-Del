import jwt from 'jsonwebtoken'

const authMiddleware = async (req, res, next) => { // to decode the jwt token
    
    const { token } = req.headers;
    if (!token) {
        return res.json({success: false, message: "Not authorized, login again"});
    }

    // this middleware will take this token and convert its userId with decoded id, using that user id we can add, remove or get the data from the cart
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);                
        req.body.userId = tokenDecode.id; // middleware is injecting data into the request so that controllers don't need to decode token again. Controllers can directly use userId.
        next(); // authentication passed, go to the controller
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"})
    }
}

export default authMiddleware;