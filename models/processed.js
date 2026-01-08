const mongoose = require('mongoose')

const ProcessedSchema = new mongoose.Schema({
    nofile: {
        type: Number,
    },
    filetype: {
        type: String,
    },
    link: {
        type: String,
    },
    userid: {
        type: String,
    }
}, { timestamps: true })

const Processed = mongoose.model('processeds', ProcessedSchema);
Processed.createIndexes();
module.exports = Processed;