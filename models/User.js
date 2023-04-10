const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobilenum: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  pushToken: {
    type: String,
    default: ''
  },
  ascii: {
    type: String,
    default: '',
  },
  ot_url: {
    type: String,
    default: '',
  },
});


module.exports = mongoose.model("User", userSchema);