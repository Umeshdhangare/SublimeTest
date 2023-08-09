const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    firstname: {
        type:String,
        required: true
    },
    lastname: {
        type:String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = new mongoose.model("Customer", customerSchema);