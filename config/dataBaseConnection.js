const mongoose = require('mongoose');
require('dotenv').config();

// database connection ---
exports.dataBaseConnection = () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => { console.log("database connection established") })
        .catch(err => {
            console.log("unable to connect database, error -> " + err);
            process.exit(1);
        })
}