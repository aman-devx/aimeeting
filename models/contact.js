const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    subject: {
        type: String,
    },
    message: {
        type: String,
    }
}, { timestamps: true })

const Contact = mongoose.model('contact', contactSchema);
Contact.createIndexes();
module.exports = Contact;