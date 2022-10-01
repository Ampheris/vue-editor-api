const database = require("../db/database.js");
const hat = require("hat");
const validator = require("email-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {sign} = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const auth = {
    login: async function (res, body) {
        const email = body.email;
        const password = body.password;
        let db;
        console.log(`Trying to log in: ${body.email}`);

        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        try {
            db = await database.getDb('user');
            let user = await db.collection.findOne({'email': email});
            console.log(`comparing ${user.password} with ${password}`);
            const validPassword = bcrypt.compareSync(password, user.password);


            if (validPassword) {
                const token = sign({result: user}, process.env.JWT_SECRET);
                console.log("\nUser Token:\n" + token);

                user.password = undefined;
                user.token = token;

                return res.status(200).json({
                    success: 1,
                    data: user,
                });
            } else {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "/login",
                        title: "User not found",
                        detail: "User with provided email not found."
                    }
                });
            }
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: "/login",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            await db.client.close();
        }
    },

    register: async function (res, body) {
        const email = body.email;
        const password = body.password;
        let db;

        console.log(`Trying to register: ${email} ${password}`);

        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/register",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        bcrypt.hash(password, 10, async function (err, hash) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/register",
                        title: "bcrypt error",
                        detail: "bcrypt error"
                    }
                });
            }

            try {
                db = await database.getDb('user');
                const userExist = await db.collection.findOne({ email: email },);

                if (!userExist) {
                    await db.collection.insertOne({'email': email, 'password': hash});

                    console.log(`added user with ${email} ${hash}`);

                    return res.status(201).json({
                        data: {
                            message: "User successfully registered."
                        }
                    });

                } else {
                    return res.status(201).json({
                        data: {
                            message: "User already exist."
                        }
                    });
                }

            } catch (e) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/register",
                        title: "Database error",
                        detail: err.message
                    }
                });
            } finally {
                await db.client.close();
            }
        });
    },

    isValidAPIKey: async function (apiKey, next, path, res) {
        try {
            const db = await database.getDb('user');

            const filter = {key: apiKey};

            const keyObject = await db.collection.findOne(filter);

            if (keyObject) {
                await db.client.close();

                return next();
            }

            return res.status(401).json({
                errors: {
                    status: 401,
                    source: path,
                    title: "Valid API key",
                    detail: "No valid API key provided."
                }
            });
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: path,
                    title: "Database error",
                    detail: e.message
                }
            });
        }
    },

    getNewAPIKey: async function (res, email) {
        let data = {
            apiKey: ""
        };

        if (email === undefined || !validator.validate(email)) {
            data.message = "A valid email address is required to obtain an API key.";
            data.email = email;

            return res.render("api_key/form", data);
        }

        try {
            const db = await database.getDb('user');

            const filter = {email: email};

            const keyObject = await db.collection.findOne(filter);

            if (keyObject) {
                data.apiKey = keyObject.key;

                return res.render("api_key/confirmation", data);
            }

            return auth.getUniqueAPIKey(res, email, db);
        } catch (e) {
            data.message = "Database error: " + e.message;
            data.email = email;

            return res.render("api_key/form", data);
        }
    },

    getUniqueAPIKey: async function (res, email, db) {
        const apiKey = hat();
        let data = {
            apiKey: ""
        };

        try {
            const filter = {key: apiKey};

            const keyObject = await db.collection.findOne(filter);

            if (!keyObject) {
                return await auth.insertApiKey(
                    res,
                    email,
                    apiKey,
                    db
                );
            }

            return await auth.getUniqueAPIKey(res, email, db);
        } catch (e) {
            data.message = "Database error: " + e.message;
            data.email = email;

            return res.render("api_key/form", data);
        }
    },

    insertApiKey: async function (res, email, apiKey, db) {
        let data = {};

        try {
            data.apiKey = apiKey;

            const doc = {email: email, key: apiKey};

            await db.collection.insertOne(doc);

            return res.render("api_key/confirmation", data);
        } catch (e) {
            data.message = "Database error: " + e.message;
            data.email = email;

            return res.render("api_key/form", data);
        } finally {
            await db.client.close();
        }
    },

    comparePasswords: function (res, password, user) {
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/login",
                        title: "bcrypt error",
                        detail: "bcrypt error"
                    }
                });
            }

            if (result) {
                let payload = {api_key: user.apiKey, email: user.email};
                let jwtToken = jwt.sign(payload, jwtSecret, {expiresIn: '24h'});

                return res.json({
                    data: {
                        type: "success",
                        message: "User logged in",
                        user: payload,
                        token: jwtToken
                    }
                });
            }

            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Wrong password",
                    detail: "Password is incorrect."
                }
            });
        });
    },

    checkToken: function (req, res, next) {
        let token = req.get("authorization")
            ? req.get("authorization")
            : req.body.headers.Authorization;


        if (token) {
            // remove bearer text
            token = token.slice(7);

            jwt.verify(token, jwtSecret, function (err, decoded) {
                console.log(`error: ${err}`);
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: req.path,
                            title: "Failed authentication",
                            detail: err.message
                        }
                    });
                }

                req.user = {};
                req.user.email = decoded.email;

                return next();
            });
        } else {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: req.path,
                    title: "No token",
                    detail: "No token provided in request headers"
                }
            });
        }
    }
};

module.exports = auth;