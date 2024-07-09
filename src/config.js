const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/loginDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Database connected successfully");
}).catch((error) => {
  console.log("Not Connected to Database:", error);
});

const LoginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const collection = mongoose.model("users", LoginSchema);

module.exports = collection;