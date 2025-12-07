const auth = require('../auth')
const User = require('../models/user-model')
const bcrypt = require('bcryptjs')

getLoggedIn = async (req, res) => {
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }

        const loggedInUser = await User.findOne({ _id: userId });
        console.log("loggedInUser: " + loggedInUser);

        return res.status(200).json({
            loggedIn: true,
            user: {
                userName: loggedInUser.userName,
                email: loggedInUser.email,
                avatar: loggedInUser.avatar
            }
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
}

loginUser = async (req, res) => {
    console.log("loginUser");
    try {
        const email = (req.body.email || "").trim().toLowerCase();
        const password = req.body.password || "";

        if (!email || !password) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        const existingUser = await User.findOne({ email: email });
        console.log("existingUser: " + existingUser);
        if (!existingUser) {
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        console.log("provided password: " + password);
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            console.log("Incorrect password");
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        // LOGIN THE USER
        const token = auth.signToken(existingUser._id);
        console.log(token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        }).status(200).json({
            success: true,
            user: {
                userName: existingUser.userName,
                email: existingUser.email,
                avatar: existingUser.avatar              
            }
        })

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).send();
}

registerUser = async (req, res) => {
    console.log("REGISTERING USER IN BACKEND");
    try {
        const payload = req.body || {};
        const userName = (payload.userName || payload.username || "").trim();
        const email = (payload.email || "").trim().toLowerCase();
        const password = payload.password || "";
        const passwordVerify = payload.passwordVerify || payload.passwordConfirm || "";
        const avatar = payload.avatar || "";

        console.log("create user payload:", {
            userName,
            email,
            avatarProvided: Boolean(avatar)
        });

        const missingFields = [];
        if (!userName) missingFields.push("userName");
        if (!email) missingFields.push("email");
        if (!password) missingFields.push("password");
        if (!passwordVerify) missingFields.push("passwordVerify");
        if (missingFields.length > 0) {
            return res
                .status(400)
                .json({ errorMessage: `Please enter all required fields (${missingFields.join(", ")}).` });
        }
        console.log("all fields provided");
        if (!userName.trim()) {
            return res
                .status(400)
                .json({ errorMessage: "Please provide a valid user name." });
        }
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        console.log("password long enough");
        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }
        console.log("password and password verify match");
        const existingUser = await User.findOne({ email: email });
        console.log("existingUser: " + existingUser);
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                })
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("passwordHash: " + passwordHash);

        const newUser = new User({
            userName,
            email,
            passwordHash,
            avatar: avatar || ""
        });
        const savedUser = await newUser.save();
        console.log("new user saved: " + savedUser._id);

        // Do NOT log the user in on creation; require explicit login per spec
        return res.status(200).json({
            success: true,
            user: {
                userName: savedUser.userName,
                email: savedUser.email,
                avatar: savedUser.avatar              
            }
        })

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

updateAccount = async (req, res) => {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                errorMessage: "Unauthorized"
            });
        }

        const payload = req.body || {};
        const userName = (payload.userName || payload.username || "").trim();
        const password = payload.password || "";
        const passwordVerify = payload.passwordVerify || payload.passwordConfirm || "";
        const avatar = payload.avatar || "";

        if (!userName) {
            return res.status(400).json({ errorMessage: "Please provide a user name." });
        }

        if (password || passwordVerify) {
            if (password.length < 8) {
                return res.status(400).json({ errorMessage: "Please enter a password of at least 8 characters." });
            }
            if (password !== passwordVerify) {
                return res.status(400).json({ errorMessage: "Please enter the same password twice." });
            }
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ errorMessage: "User not found." });
        }

        user.userName = userName;
        if (avatar) {
            user.avatar = avatar;
        }

        if (password) {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            user.passwordHash = await bcrypt.hash(password, salt);
        }

        await user.save();

        return res.status(200).json({
            success: true,
            user: {
                userName: user.userName,
                email: user.email,
                avatar: user.avatar
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: "Server error updating account." });
    }
}

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    updateAccount
}
