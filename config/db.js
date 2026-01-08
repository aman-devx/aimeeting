const mongoose = require("mongoose");
const {MONGO_DB_CONNECTION} = require('./config');

const connectToMongo = async() => {
    mongoose.connect(MONGO_DB_CONNECTION)
        .then(() => console.log("datebase connected"))
        .catch((e) => console.log(e))
}

module.exports = connectToMongo;