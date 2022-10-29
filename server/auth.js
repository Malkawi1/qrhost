const express = require("express");
const session = require("express-session");
const cors = require("cors");
const uuidV4 = require("uuid").v4;
const {UsersDB, DataDB} = require("./model/index")
const jwt = require("jsonwebtoken");
const e = require("express");

const IP = require("../utils/ip")();

const SESSION_SECRET = "WS-QRCODE";
const SESSION_MAX_AGE = 60 * 60 * 1000;

const sessionRequestHandler = session({
    genid: () => uuidV4(),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: SESSION_MAX_AGE },
});

// TODO
const userCache = new Map();
// TODO Auto destruction
let tokenCache = [];

function genSessionToken(username) {
    if (username) {
        const token = jwt.sign({ username }, SESSION_SECRET, { expiresIn: SESSION_MAX_AGE });
        return token;
    }
    return null;
}

function updateSessionToken(username) {
    if (username && userCache.get(username)) {
        const token = genSessionToken(username);

        const user = userCache.get(username);
        userCache.set(username, { ...user, token });
        tokenCache.push(token);

        return token;
    }

    return null;
}

const authMiddleware = (req, res, next) => {
    const token = req.session.userToken || req.headers["authorization"];
    const isCached = !!tokenCache.find((t) => t === token);

    if (token && isCached) {
        try {
            const decoded = jwt.verify(token, SESSION_SECRET);
            if (decoded.username) {
                req.session.username = decoded.username;
                return next();
            }
        } catch (e) {
            console.error("[authMiddleware] catch: %o", e);
            return res.status(401).json({ msg: "Token expired" });
        }
    }

    return res.status(401).json({ msg: "Access denied" });
};

const authRouter = express.Router(); 

authRouter.use(express.json());
authRouter.use((req, res, next) => {
    const host = req.headers.host;
    // [dev] dynamic origin
    const origin = new RegExp(`^${IP}`).test(host) ? req.headers.origin : "*";

    return cors({
        origin,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        credentials: true,
    })(req, res, next);
});

authRouter.get("/user", authMiddleware, (req, res) => {
    if (req.session.username) {
        return res.json({ code: 0, data: { username: req.session.username , id: req.session.id } });
    }
    return res.sendStatus(404);
});
authRouter.post("/signup", async (req, res) => {
    const body = req.body;
    console.log("**********",body)
    if (body.username) {
        try {
            const user = await UsersDB.create(body)
            console.log(user)
            res.send(user)
        } catch (error) {
            res.send("the user is duplicated")
        }


    } else {
        return res.send("there is no user");
    }
});

authRouter.get("/getalluser", async (req, res) => {

 
        const users = await UsersDB.findAll()
        res.send(users)  

});

authRouter.get("/getalldata", async (req, res) => {

 
    const data = await DataDB.findAll()
    res.send(data)  

});


authRouter.get("/getalldata/id", async (req, res) => {

 console.log(req.params.id)
    const data = await DataDB.findAll({where:{
        id
    }})
    res.send(data)  

});

authRouter.post("/setdata", async (req, res) => {
    const body = req.body;
   
    if (body.name) {
        try {
            const data = await DataDB.create(body)
            res.send(data)
        } catch (error) {
            res.send("add Forien ")      
        }

    } else {
        return res.send("there is no user");
    }
});


authRouter.post("/loginuser", async (req, res) => {
    const body = req.body;

        if (body && body.username && body.password) {

            const { username, password } = body;
            // const user = userCache.get(username);
            const user2 = await UsersDB.findOne({where:{
                username : body.username 
            }})
    
            const token = genSessionToken(username);
            if (user2) {
                // TODO Password

                if (user2.password === password) {
                    userCache.set(username, { ...user2, token });
                } else {
                    return res.status(401).json("Password incorrect");
                }
            } else {
                return res.status(404).send(" there is no user");

            }
    
            req.session.userToken = token;
            tokenCache.push(token);
    
            return res.json({ code: 0, data: { username, token }, msg: "Login successful" });
        } else {
            return res.json({msg: "error" });
        }
   


});



authRouter.post("/login", (req, res) => {
    const body = req.body;

    console.log(userCache)
    if (body && body.username && body.password) {
        const { username, password } = body;
        const user = userCache.get(username);


        const token = genSessionToken(username);
        if (user) {
            // TODO Password
            if (user.password === body.password) {
                userCache.set(username, { ...user, token });
            } else {
                return res.status(400).send("Password error");
            }
        } else {
            userCache.set(username, { username, password, token });
        }

        req.session.userToken = token;
        tokenCache.push(token);

        return res.json({ code: 0, data: { username, token }, msg: "Login successful" });
    } else {
        return res.sendStatus(400);
    }
});

authRouter.post("/logout", (req, res) => {
    const token = req.session.userToken || req.headers["authorization"];

    if (token) {
        req.session && req.session.destroy();
        tokenCache = tokenCache.filter((i) => i !== token);
        return res.send("ok");
    }

    return res.sendStatus(401);
});

module.exports = {
    sessionRequestHandler,
    authMiddleware,
    authRouter,
    updateSessionToken,
};
