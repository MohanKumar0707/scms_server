const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
    key: String,
    value: String
});

module.exports = mongoose.model("Setting", settingSchema);
