const router = require("express").Router();
const Child = require("../models/Child");
const Device = require("../models/Device");

router.get("/", async (req, res) => {
  const { parent } = req.query;
  const children = await Child.find({ parent: parent })
    .populate("devices")
    .exec();
  res.status(200).json(children);
});

router.patch("/device", async (req, res) => {
  const { id } = req.query;
  const device = await Device.updateOne({ _id: id }, req.body);
  const x = await Device.findById(id);
  res.status(200).json(x);
});

router.get("/device/applist", async (req, res) => {
  const { childId } = req.query;
  let list = [];
  const child = await Child.findById(childId).populate("devices").exec();
  if (!child) {
    console.log(child);
    res.status(400).send("error occurred");
    return;
  }
  child.devices.forEach((element) => {
    element.apps.forEach((a) => {
      list.push(a);
    });
  });
  res.status(200).json(list);
});

router.post("/device/applist", async (req, res) => {
  const { childId, apps } = req.body;
  let appps = JSON.parse(apps)
  const child = await Child.findById(childId).populate("devices").exec();
  let list = [];
  console.log(apps.length)
  appps.forEach((element) => {
    let flag = false;
    if(child.devices[0].apps.length === 0){
      list.push(element)
    }else{
    child.devices[0].apps.forEach((a) => {
      if (a.packageName === element.packageName) {
        flag = true;
      }
    });
    if (!flag) {
      list.push(element);
    }
    }
  });
  console.log(list.length)
  await Device.updateOne(
    { _id: child.devices[0]._id },
    { $push: { apps: { $each: list } } }
  );
  const x = await Child.findById(childId);
  res.status(200).json(x);
});

//lock dashboard se idhar hit hoga
router.post("/device/app/lock", async (req, res) => {
  const { childId, packageName } = req.body;
  console.log(packageName)
  const child = await Child.findById(childId).populate("devices").exec();
  let apps = child.devices[0].apps;
  apps.forEach((element) => {
    if (element.packageName === packageName) {
      element.isLocked = !element.isLocked;
    }
  });
  await Device.updateOne(
    { _id: child.devices[0]._id },
    { $set: { apps: apps } }
  );
  const x = await Child.findById(childId).populate("devices").exec();
  res.status(200).json(x);
});

//blocked urls
router.get("/device/urls", async (req, res) => {
  const { childId } = req.query;
  let list = [];
  const child = await Child.findById(childId).populate("devices").exec();
  if (!child) {
    console.log(child);
    res.status(400).send("error occurred");
    return;
  }
  child.devices.forEach((element) => {
    element.websites.forEach((a) => {
      list.push(a);
    });
  });
  res.send(list);
});

//block any urls
router.post("/device/urls", async (req, res) => {
  const { childId, urls } = req.body;
  const child = await Child.findById(childId).populate("devices").exec();
  if (!child) {
    res.status(400).send("error occurred");
    return;
  }
  let list = [];
  urls.forEach((element) => {
    let flag = false;
    child.devices.forEach((device) => {
      device.websites.forEach((url) => {
        if (url.url === element) {
          flag = true;
        }
      });
    });
    if (!flag) {
      list.push({
        url: element,
        isLocked: true,
      });
    }
  });
  await Device.updateOne(
    { _id: child.devices[0]._id },
    { $push: { websites: { $each: list } } }
  );
  res.send('updated')
});

router.post("/device/web", async (req, res) => {
  const { childId } = req.body;
  const child = await Child.findById(childId).populate("devices").exec();
  const exists = await Device.find({
    child: childId,
  });
  if (exists.length > 0) {
    res.status(200).json(child);
    return;
  }
  const device = await Device.create({
    name: child.name + "'s Laptop",
    child: child,
    deviceType: "web",
    deviceUniqueId: uniqueId,
  });
  child.devices.push(device);
  await child.save();
  const c = await Child.findById(childId).populate("devices").exec();
  res.status(200).json(c);
});


router.post("/add", async (req, res) => {
  const { uniqueId, name, age,   gender, devicePushToken } = req.body;
  const { parent } = req.query;
  const exists = await Child.find({ parent: parent, name: name })
    .select("+devices")
    .populate("devices")
    .exec();
  if (exists.length > 0) {
    res.status(200).json(exists[0]);
    return;
  }
  const child = await Child.create({
    name: name,
    parent: parent,
    age: age,
    gender: gender,
  });
  // const checkDevice = await Device.find({ deviceUniqueId: uniqueId });
  // if (checkDevice.length > 0) {
  //   res.status(500).send({ message: "already registered with another user" });
  //   return;
  // }
  const device = await Device.create({
    name: name + "'s Phone",
    parent: parent,
    child: child._id,
    deviceType: "app",
    devicePushToken: devicePushToken,
    deviceUniqueId: uniqueId,
  });
  child.devices.push(device);
  await child.save();
  res.status(200).json(child);
});


router.get("/analytics", async (req, res) => {
  const { childId } = req.query;
  const child = await Child.findById(childId).populate('devices').exec()
  if(!child) res.send('child id is wrong')
  let apps = []
  let websites = []
  let screentime = []
  let recently_used = []
  let location = []
  child.devices.forEach((ele) => {
    if(ele.apps !== undefined)
    ele.apps.forEach((a) => apps.push(a))
    if(ele.websites !== undefined)
    ele.websites.forEach((a) => websites.push(a))
    if(ele.lastlocation !== undefined)
    location = ele.lastlocation
  })

  return res.json({
    apps: apps,
    websites: websites,
    screentime: screentime,
    recently_used: recently_used,
    location: location,
    child: child
  })
})

module.exports = router;
