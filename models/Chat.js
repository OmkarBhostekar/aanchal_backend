const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  user1: {
    type: String,
    required: true,
  },
  user2: {
    type: String,
    required: true,
  },
  messages: [{
    text: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      required: true
    }
  }]
});


module.exports = mongoose.model("Chat", chatSchema);