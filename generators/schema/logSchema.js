const mongoose = require("mongoose");
const { Schema } = mongoose;

const logSchema = new Schema({
	logId: String,
	ip: String,
	country: String,
	city: String,
	state: String,
	timestamp: Date,
});

module.exports = mongoose.model("log", logSchema);
