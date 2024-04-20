const mailer = require("./mailController");
exports.sendmail = async (req, res) => {
    try {
        const subject = "ReturnPal - Contact";
        const { email, firstName, lastName, message } = req.body;
        const body =
            `${firstName ? firstName : ''} ${lastName ? lastName : ''} <br> ${message} <br> user email : ${email}`
        await mailer.sendMail(email, subject, body);;
        return res.status(200).json({ message: "SendMail success" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error occurred while sending email", error: err });
    }

};