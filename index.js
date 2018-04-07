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
      })
      .catch(function (err) {
        callback(err || new Error('Failed to get state'), null)
      });
  },

  setState: function (powerOn, callback) {
    var stateChange;

    if (powerOn) {
      stateChange = blueServo.on();
    } else {
      stateChange = blueServo.off();
    }

    stateChange
      .then(callback())
      .catch(function (err) {
        callback(err || new Error('Failed to set state ' + powerOn), null)
      });
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
