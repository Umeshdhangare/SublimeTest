const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");

const app = express();
const port = 8080;

const URI = "mongodb+srv://umeshdhangare:qwertyumesh@sublime.aqj3pck.mongodb.net/?retryWrites=true&w=majority";
const connectDB = async () => {
    try {
        const con = await mongoose.connect(URI);
        console.log("Database connected successfully");
    } catch(e) {
        console.log(e);

    }
}

connectDB();
const customerRouter = require("./routes/customersRouter");

app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use(express.urlencoded({extended: true}));

app.use("/customer", customerRouter);

app.listen(port, () => {
    console.log(`Server listning on http://localhost:${port}`);
})