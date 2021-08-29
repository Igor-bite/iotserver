const fs = require('fs'); // module File System

const Port = require('./port')

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