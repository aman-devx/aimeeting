const Contact = require("../../models/contact")

exports.create = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const processed = await Contact.create({
            name,
            email,
            subject,
            message
        });
        return res.status(200).json({ message: 'Updated Successfully.',processed });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.getContact = async (req, res) => {
    try {
        const processed = await Contact.find({})
        return res.status(200).json({ message: 'Find Successfully.', processed });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};
