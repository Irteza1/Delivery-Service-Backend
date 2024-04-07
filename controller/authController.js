const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const BASE_URL = process.env.BASE_URL ?? "http://localhost:4200";
const JWT_SECRET = process.env.JWT_SECRET ?? "PLEASE SET JWT SECRET KEY";
async function findExistingUser(email) {
    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return User.findOne({
        email: { $regex: `^${escapedEmail}$`, $options: "i" },
    });
}
exports.register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            address,
            suiteNo,
            city,
            postalCode,
            password,
        } = req.body;
        const existingUser = await findExistingUser(email);
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username: email, // User seems to need a username to save to the db properly. Should remove later if not using a username.
            firstName,
            lastName,
            email,
            password
        });
        await user.save();

        // Save the primary address address
        const primaryAddress = new Address({
            user: user._id,
            name: `${firstName} ${lastName}`,
            phoneNumber,
            unit: suiteNo,
            address,
            city,
            postalCode,
            isPrimary: true,
        });
        await primaryAddress.save();

        user.addresses.push(primaryAddress._id);
        await user.save();
        return res
            .status(201)
            .json({ message: "User registered successfully", user });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await findExistingUser(email);
        console.log(user);
        if (!user) {
            return res
                .status(401)
                .json({ error: "Invalid email or password." });
        }

        // const isPasswordValid = password, user.password);
        if (user.password != password) {
            return res
                .status(401)
                .json({ error: "Invalid email or password." });
        }

        if (!user.isActive) {
            return res.status(400).json({ error: "Please verify your email." });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);

        return res.status(200).json({ userId: user._id, token });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};

exports.verify = async (req, res) => {
    try {
        const { id } = req.params;

        await User.updateOne({ _id: id }, { isActive: true });

        const token = jwt.sign({ userId: id }, JWT_SECRET);

        return res
            .status(201)
            .json({ userId: id, token, message: "User verified successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const token = jwt.sign({ email }, "passwordReset");

        await updateUser(email, { passwordResetToken: token });

        const link = `${BASE_URL}/reset?token=${token}`;
        const subject = "Backend - Reset your password";
        const body =
            "Hello,<br> Please follow the link to reset your password.<br> <a href=" +
            link +
            ">Click here to reset password</a>";

        mailer.sendMail(email, subject, body);

        return res.status(200).json({ message: "Forgot password email sent" });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { token } = req.params;

        if (!token) {
            return res.status(401).json({ error: "Invalid" });
        }

        const user = await findExistingUser(email);

        if (!user) {
            return res.status(404).json({ error: "Not found" });
        }

        if (token !== user.passwordResetToken) {
            return res.status(401).json({ error: "Invalid" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await updateUser(email, {
            password: password,
            passwordResetToken: null,
        });

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};
