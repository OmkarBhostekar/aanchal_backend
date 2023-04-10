
const router = require("express").Router();
const Chat = require("../models/Chat");

router.get('/chatlist', async (req, res) => {
  let uid = req.query.uid;
  const results = await Chat.find({
    $or: [
      { user1: uid },
      { user2: uid }
    ]
  })
  res.json(results);
})

router.post('/message', async (req, res) => {
  const uid = req.body.id
  const otherId = req.body.oid
  const message = req.body.message
  console.log(uid, otherId, message)
  let room = await Chat.find({
    $or: [
      { user1: uid, user2: otherId },
      { user1: otherId, user2: uid },
    ]
  })
  if (room.length == 0) {
    await Chat.create({ user1: uid, user2: otherId })
  }
  await Chat.findOneAndUpdate({
    $or: [
      { user1: uid, user2: otherId },
      { user1: otherId, user2: uid },
    ]
  }, {
    $push: {
      messages: {
        text: message,
        sender: uid
      }
    }
  })
  const messages = await Chat.findOne({
    $or: [
      { user1: uid, user2: otherId },
      { user1: otherId, user2: uid },
    ]
  })
  res.json(messages)
})


module.exports = router;