const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect("mongodb://localhost:27017/loginDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("database connected successfully");
  }
};

connectDB().catch(() => {
  console.log("Not Connected to database");
});

const LoginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  quizzes: [
    {
      accuracy: Number,
      speed: Number,
      totalTime: Number,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const collection = mongoose.model("users", LoginSchema);

module.exports = collection;
