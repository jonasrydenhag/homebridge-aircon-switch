var Service, Characteristic;
var switchEvent = require('/home/pi/web/dbModels/SwitchEvent');
var servo = require('/home/pi/web/library/Servo');

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-simple-switch", "AirConSwitch", AirConSwitch);
};

function AirConSwitch(log, config) {
  this.log = log;
  this.name = config["name"];
}

AirConSwitch.prototype = {

  getSwitchState: function (callback) {
    switchEvent.getLatest()
      .then(function (data) {
        callback(data.state);
      });
  },

  getState: function (callback) {
    this.getSwitchState(function (state) {
      callback(null, state === 'on');
    });
  },

  setState: function (powerOn, callback) {
    this.getSwitchState(function (state) {
      if (powerOn && state === 'on' || !powerOn && state !== 'on') {
        callback();
        return;
      }

      servo.click()
        .then(function () {
          callback();
        });
    });
  },

  getServices: function () {
    var informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Jonas")
      .setCharacteristic(Characteristic.Model, "AirCon Switch")
      .setCharacteristic(Characteristic.SerialNumber, "AirCon Switch");

    switchService = new Service.Switch(this.name);
    switchService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getState.bind(this))
      .on('set', this.setState.bind(this));

    return [switchService];
  }
};
