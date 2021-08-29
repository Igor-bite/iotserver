const express = require('express');
const router = express.Router();
const fs = require('fs'); // module File System
const { readdirSync } = require('fs') // function for getting directories
const { spawn } = require('child_process');
const path = require("path"); // module for executing cmd scripts

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './devices/' + req.params.id + '/');
  },
  filename: function (req, file, cb) {
    cb(null, "image.jpg")
  }
})
const upload = multer({storage: storage})

let devices = [];

restoreDevices(); // restores all devices data
function remove_device(id) {
  fs.rm('./devices/' + id, { recursive: true }, () => {});
}

function restoreDevices() {
  const devicesDir = './devices';
  if (!fs.existsSync(devicesDir)) {
    fs.mkdirSync(devicesDir);
  } else {
    const directories = readdirSync('./devices', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

    for (let i in directories) {
      let device = JSON.parse(fs.readFileSync('./devices/' + directories[i] + '/device.json', 'utf8'));
      devices.push(device);
    }
  }
}

router.get('/:id/update/:port/:value', function(req, res) {
  const device = devices.find(d => d.id === req.params.id);
  if (!device) {
    res.send('Error');
  }
  const port = device.ports.find(p => p.name === req.params.port);
  if (!port) {
    device.ports.push(new Port(req.params.port, req.params.value));
  } else {
    port.value = req.params.value;
  }
  device.read = false;
  device.response = new Port(req.params.port, req.params.value);
  res.send('Success');
});

router.get('/:id/get/:port', function(req, res) {
  const device = devices.find(d => d.id === req.params.id);
  if (!device) {
    res.send('Error');
  }
  const port = device.ports.find(p => p.name === req.params.port);
  if (!port) {
    res.send('Error');
  } else {
    res.send(port);
  }
});

router.get('/:id/check', function(req, res) {
  const device = devices.find(d => d.id === req.params.id);
  if (device && device.read === false) {
    device.read = true;
    res.send(device.response);
  }
  res.send('Error');
});

router.get('/make/:name', function(req, res) {
  const id = generate_token();
  const sendEmail = spawn('python3', ['./routes/send_token.py', id]);

  sendEmail.stderr.on(
      'data',
      (data) => console.log(data.toString())
  );

  devices.push(new Device(id, req.params.name));

  res.send('Token for device ' + req.params.name + ' is:   ' + id);
});

router.get('/:id/delete', function(req, res) {
  const index = devices.findIndex(d => d.id === req.params.id);
  const device = devices.find(d => d.id === req.params.id);

  remove_device(device.id);
  devices.splice(index, 1);
  // const device = devices[index]
  res.send('Device ' + device.name + ' was removed');
});

router.post('/:id/image', upload.single('deviceImage'), (req, res, next) => {
  res.send('done');
});

router.get('/:id/image', function(req, res) {
  console.log(req.params.id)
  let options = {
    root: path.join(require.main.path),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }
  let device_image_path = 'devices/' + req.params.id + '/image.jpg'

  res.sendFile(device_image_path, options, function (err) {
    if (err) {
      console.log(err)
    }
  });
});

router.get('/devices', function(req, res) {
  res.send(devices);
});

module.exports = router;

function generate_token(bits, base) {
  if (!base) base = 16;
  if (bits === undefined) bits = 128;
  if (bits <= 0) return '0';

  var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
  for (var i = 2; digits === Infinity; i *= 2) {
    digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
  }

  var rem = digits - Math.floor(digits);

  var res = '';

  for (var i = 0; i < Math.floor(digits); i++) {
    var x = Math.floor(Math.random() * base).toString(base);
    res = x + res;
  }

  if (rem) {
    var b = Math.pow(base, rem);
    var x = Math.floor(Math.random() * b).toString(base);
    res = x + res;
  }

  var parsed = parseInt(res, base);
  if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
    return hat(bits, base)
  }
  else return res;
};

class Device {
  id
  name
  read
  response
  ports = []

  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.read = true;
    this.ports = [];

    const dir = './devices/' + id;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      this.save();
    }
  }

  save() {
    fs.writeFile('./devices/' + this.id + '/device.json', JSON.stringify(this), function (err) {
      if (err) {
        return console.log(err);
      }
    });
  }

  get id() {
    return this.id;
  }

  get name() {
    return this.name;
  }

  // GETTERS
  get read() {
    return this.read;
  }

  get response() {
    return this.response;
  }

  get ports() {
    return this.ports;
  }

  set id(id) {
    this.id = id;
  }

  // SETTERS
  set name(name) {
    this.name = name;
    this.save();
  }

  set read(r) {
    this.read = r;
    this.save();
  }

  set response(r) {
    this.response = r;
    this.save();
  }

  set ports(p) {
    this.ports = p;
    this.save();
  }
}

class Port {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }
}
