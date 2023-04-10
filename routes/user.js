const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../models/User");
const config = require("../config");
const bcrypt = require('bcrypt');
const axios = require("axios")
const saltRounds = 10;
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
// const isUser = require("../middlewares/isUser");
// const isAdmin = require("../middlewares/isAdmin");
// const { Configuration, OpenAIApi } = require("openai");
// const configuration = new Configuration({
//   apiKey: "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"
// });
// const openai = new OpenAIApi(configuration);

//registering a new employee
router.post("/register", async (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const mobilenum = req.body.mobilenum;
  const admin = false;

  if (!password || !email || !firstname || !lastname || !mobilenum)
    return res.status(400).send("One or more of the fields are missing.");

  //checking for multiple accounts for a single email
  const emailcheck = await User.find({ email: email });
  if (emailcheck.length > 0) return res.status(400).send("Only one account per email address is allowed");
  var secret = speakeasy.generateSecret({
    name: "Aanchal"
  })
  console.log(secret)
  // add user
  bcrypt.hash(password, saltRounds, async function(err, hash) {
    const newUser = new User({ password: hash, firstname, lastname, email, mobilenum, admin, ascii: secret.ascii, ot_url: secret.otpauth_url });
    return res.json(await newUser.save());
  });

});

router.post('/verify', async (req, res) => {
  const {parent_id,pin} = req.body;
  console.log(parent_id, pin)
  const user = await User.findById(parent_id);
  const {ascii, ot_url} = user;

  return res.send( (speakeasy.totp.verify({secret:ascii,encoding:'ascii',token:pin})))
  
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
 
  if (!email || !password)
    return res.status(400).send("Missing email or password");
  
  // checking if email exists
  const emails = await User.find( { email : email });    
if (emails.length === 0) return res.status(400).send("Email is incorrect");

  const user = emails[0];

  bcrypt.compare(password, user.password, async function(err, result) {
    if (result == false) return res.status(400).send("Incorrect password");

    // sending token
    const token = jwt.sign(
      {
        id: user._id,
      },
      config.jwtSecret, { expiresIn: "1d" }
    );
    res.setHeader("token", token);
    res.json({ user, token });
  });
});



// router.get("/realUpdate", async (req, res) => {
//   let uid = req.query.id;
//   let creator = "640c5839ec422bf7374c5de0";
//   const job = await Vacancy.findOne({ creator: creator });

//   let data = await User.findById(uid);
//   let token = data.pushToken;
//   const headers = {
//     'Content-Type': 'application/json',
//     'Authorization': 'key=AAAAYLnN3WI:APA91bH4MdcLGmGf01ryZ94sEuWkgtBlzuYlz7yRRpdHQGMtzf1ZMsfVuL-9Hp4FgRRLDs_fHYk2iBS_P1PvrDXNWxd5Hqu9QOU-uFV1S3-zRY-qHpdHPBerVWpIJeItsZvluK5oLaUG'
//   }

//   const response = axios.post('https://fcm.googleapis.com/fcm/send', {
//     "to": token,
//     "priority": "high",
//     "time_to_live": 1000000,
//     "fcm_options": {
//       "analytics_label": "push_analytics"
//     },
//     "notification": {
//       "title": "Update on your profile",
//       "body": ` Recruiter From ${job.company} has viewed your profile. Here is their Contact email : ${job.contactEmail}.`
//     }
//   }, {
//     headers: headers
//   })
//     .then((response) => {
//       console.log(response)
//     })
//     .catch((error) => {
//       console.log(error)
//     })
// })

router.get("/user/profile", async (req, res) => {
  let uid = req.query.id;
  const data = await User.findById(uid);
  res.json(data);
})

router.post("/pushToken", async (req, res) => {
  let uid = req.body.id
  let token = req.body.token
  const data = await User.findByIdAndUpdate({ _id: uid }, { pushToken: token });
  res.json(data)
})

module.exports = router;
