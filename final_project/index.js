const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
    let token = req.session.token || req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "Access Denied: No Token Provided" });
    }

    // Extract token if "Bearer <token>" format is used
    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    try {
        const decoded = jwt.verify(token, "your_secret_key"); // Use your actual secret key
        req.user = decoded; // Store user details in request
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid Token" });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
