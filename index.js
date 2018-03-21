"use strict";

var Service, Characteristic;

var blueServo = require('/srv/blueServo');

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-aircon-switch", "AirConSwitch", AirConSwitch);
};

function AirConSwitch(log, config) {
  this.log = log;
  this.name = config["name"];
}

AirConSwitch.prototype = {
  getState: function (callback) {
    blueServo.state()
      .then(function (state) {
        callback(null, state === "on");
      });
  },

  setState: function (powerOn, callback) {
    var thenCallback = function () {
      callback();
    };

    if (powerOn) {
      blueServo.on()
        .then(thenCallback);
    } else {
      blueServo.off()
        .then(thenCallback);
    }
  },

  getServices: function () {
    var informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Jonas")
      .setCharacteristic(Characteristic.Model, "AirCon Switch")
      .setCharacteristic(Characteristic.SerialNumber, "AirCon Switch");

    var switchService = new Service.Switch(this.name);
    switchService
      .getCharacteristic(Characteristic.On)
      .on("get", this.getState.bind(this))
      .on("set", this.setState.bind(this));

    return [switchService];
  }
};
