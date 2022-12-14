const database = require("../db/database.js");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {sign} = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const APIService = require('../services/search.service');

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
            const validPassword = bcrypt.compareSync(password, user.password);

            console.log(`Logged in user with id: ${user._id}`);

            if (validPassword) {
                const token = sign({result: user}, process.env.JWT_SECRET);

                user.password = undefined;
                user.token = token;

                await APIService.ifUserHasPendingInvite(email, user._id);


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
                    let result = await db.collection.insertOne({'email': email, 'password': hash});

                    // Check if user has pending invitation
                    try {
                        await APIService.ifUserHasPendingInvite(email, result.insertedId);
                    } catch (e)
                    {
                        console.log(`error: ${e}`);
                    }

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
                        detail: err.message ?? null
                    }
                });
            } finally {
                await db.client.close();
            }
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