module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Robboscratch3_DeviceControlAPI = __webpack_require__(1);

module.exports = Robboscratch3_DeviceControlAPI;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RobotConrolAPI = undefined;

var _RobotConrolAPI = __webpack_require__(2);

var _RobotConrolAPI2 = _interopRequireDefault(_RobotConrolAPI);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.RobotConrolAPI = _RobotConrolAPI2.default;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DeviceControlAPI2 = __webpack_require__(3);

var _DeviceControlAPI3 = _interopRequireDefault(_DeviceControlAPI2);

var _chrome = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
//import RobotSensorsData from './RobotSensorsData';


var DEVICE_HANDLE_TIMEOUT = 1 * 60 * 1000;

var SensorsDataRecievingStates = {

    STARTED: "STARTED",
    STOPED: "STOPED"

};

var RobotConrolAPI = function (_DeviceControlAPI) {
    _inherits(RobotConrolAPI, _DeviceControlAPI);

    function RobotConrolAPI() {
        _classCallCheck(this, RobotConrolAPI);

        var _this = _possibleConstructorReturn(this, (RobotConrolAPI.__proto__ || Object.getPrototypeOf(RobotConrolAPI)).call(this));

        _this.RobotSensorsDataRecievingState = SensorsDataRecievingStates.STOPED;
        _this.ConnectedDevices = [];

        (0, _chrome.searchDevices)();

        var handleConnectedDevicesInterval = setInterval(function (self) {

            self.ConnectedDevices = (0, _chrome.getConnectedDevices)();
            // let cd = this.ConnectedDevices;
            // let s = this;
            //  setInterval(handleConnectedDevices, 200, self.ConnectedDevices,self);

            handleConnectedDevices(self.ConnectedDevices, self);
        }, 100, _this);

        setTimeout(function () {

            console.log("Stop devices handle process.");
            clearInterval(handleConnectedDevicesInterval);
        }, DEVICE_HANDLE_TIMEOUT);

        var handleConnectedDevices = function handleConnectedDevices(Devices, self) {

            console.log("Handle connected devices.");

            if (typeof Devices !== 'undefined') {

                if (Devices.length != 0) {

                    Devices.forEach(function (item) {

                        self.startDataRecievingLoop(item);
                    });
                }
                //    else{
                //
                //         setTimeout(handleConnectedDevices, 200,self.ConnectedDevices,self);
                //
                //   }
                //
                // }else{
                //
                //         console.log("devices: " + typeof(Devices));
                //
                //         setTimeout(handleConnectedDevices, 200,self.ConnectedDevices,self);
                //
                // }
            }
        };

        return _this;
    }

    // searchRobotDevices(){
    //
    //      chrome.serial.getDevices(callback);
    //
    // }


    _createClass(RobotConrolAPI, [{
        key: 'setRobotPower',
        value: function setRobotPower(leftMotorPower, rightMotorPower) {}
    }, {
        key: 'getSensorsData',
        value: function getSensorsData() {

            return this.SensorsData;
        }
    }, {
        key: 'getSensorData',
        value: function getSensorData() {}
    }, {
        key: 'runDataRecieveCommand',
        value: function runDataRecieveCommand(device) {

            console.log("runDataRecieveCommand");

            device.command(_chrome.DEVICES[0].commands.check, [], function (response) {

                this.SensorsData = response;

                console.log("response: " + this.SensorsData.a0);
            });
        }
    }, {
        key: 'startDataRecievingLoop',
        value: function startDataRecievingLoop(device) {

            if (device.getDeviceID() == 0 && device.getState() == _chrome.DEVICE_STATES["DEVICE_IS_READY"]) {

                console.log(" Robot ID:  " + device.getDeviceID());

                if (this.RobotSensorsDataRecievingState == SensorsDataRecievingStates.STOPED) {

                    this.RobotSensorsDataRecievingState == SensorsDataRecievingStates.STARTED;

                    setInterval(this.runDataRecieveCommand.bind(this, device), 100);
                } else {

                    console.log("ID: " + device.getDeviceID() + " " + "State:  " + device.getState());
                }

                //    setInterval(this.runDataRecieveCommand.bind(this,device),100);

            }
        }
    }]);

    return RobotConrolAPI;
}(_DeviceControlAPI3.default);

exports.default = RobotConrolAPI;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DeviceControlAPI = function DeviceControlAPI() {
    _classCallCheck(this, DeviceControlAPI);
};

exports.default = DeviceControlAPI;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
   value: true
});
var DEVICE_SERIAL_NUMBER_PROBE_INTERVAL = 100;
var DEVICE_SERIAL_NUMBER_LENGTH = 52;
var DEVICE_HANDLE_TIMEOUT = 1 * 60 * 1000;

var DEVICE_STATES = Object.freeze({
   "INITED": 0,
   "OPENED": 1,
   "TEST_DATA_SENT": 2,
   "RUBBISH": 3,
   "SERIAL_FOUND": 4,
   "PURGING": 5,
   "DEVICE_IS_READY": 6
});

var DEVICES = Object.freeze({
   //Basic Robot
   0: {
      "firmware": 7,
      "commands": {
         "check": {
            "code": "a",
            "params": [],
            "response": {
               "encoder0": "uint2",
               "encoder1": "uint2",
               "path0": "uint2",
               "path1": "uint2",
               "a0": "ubyte[4]",
               "a1": "ubyte[4]",
               "a2": "ubyte[4]",
               "a3": "ubyte[4]",
               "a4": "ubyte[4]",
               "button": "ubyte"
            }
         },
         "power": {
            "code": "c",
            "params": ["ubyte", "ubyte"],
            "response": {
               "encoder0": "uint2",
               "encoder1": "uint2",
               "path0": "uint2",
               "path1": "uint2",
               "a0": "ubyte[4]",
               "a1": "ubyte[4]",
               "a2": "ubyte[4]",
               "a3": "ubyte[4]",
               "a4": "ubyte[4]",
               "button": "ubyte"
            }
         },
         "sensors": {
            "code": "i",
            "params": ["ubyte", "ubyte", "ubyte", "ubyte", "ubyte"],
            "response": {
               "encoder0": "uint2",
               "encoder1": "uint2",
               "path0": "uint2",
               "path1": "uint2",
               "a0": "ubyte[4]",
               "a1": "ubyte[4]",
               "a2": "ubyte[4]",
               "a3": "ubyte[4]",
               "a4": "ubyte[4]",
               "button": "ubyte"
            }
         }
      }
   },

   //Old lab
   1: {}
});

var arrDevices = [];

function InterfaceDevice(port) {
   this.port = port;
   var LOG = "[" + port.path + "] ";

   console.log(LOG + "Trying to register a new device...");

   var state = DEVICE_STATES["INITED"];
   var bufIncomingData = new Uint8Array();
   var iConnectionId;
   var iDeviceID;
   var iFirmwareVersion;
   var sSerialNumber;
   var iSerialNumberOffset;
   var iWaiting = 0;
   var response = {};
   var commandToRun = null;
   var callback = null;

   var isStopCheckingPort = false;

   var onReceiveCallback = function onReceiveCallback(info) {
      if (info.connectionId == iConnectionId && info.data) {
         var buf = new Uint8Array(info.data);
         console.log(LOG + "<- " + buf.length);
         var bufIncomingDataNew = new Uint8Array(bufIncomingData.length + buf.length);
         bufIncomingDataNew.set(bufIncomingData);
         bufIncomingDataNew.set(buf, bufIncomingData.length);

         bufIncomingData = bufIncomingDataNew;

         //We are not waiting for any data;
         if (commandToRun == null) return;

         if (bufIncomingData.length >= iWaiting) {
            console.log(LOG + "command '" + commandToRun.code + "' complete.");

            //all params
            var iResponsePointer = 1;
            Object.keys(commandToRun.response).forEach(function (sField) {
               switch (commandToRun.response[sField]) {
                  case "uint2":
                     {
                        response[sField] = bufIncomingData[iResponsePointer] * 256 + bufIncomingData[iResponsePointer + 1];
                        iResponsePointer += 2;
                        break;
                     }
                  case "ubyte[4]":
                     {
                        response[sField] = [];
                        response[sField].push(bufIncomingData[iResponsePointer]);
                        response[sField].push(bufIncomingData[iResponsePointer + 1]);
                        response[sField].push(bufIncomingData[iResponsePointer + 2]);
                        response[sField].push(bufIncomingData[iResponsePointer + 3]);
                        iResponsePointer += 2;
                        break;
                     }
                  case "ubyte":
                     {
                        response[sField] = bufIncomingData[iResponsePointer];
                        iResponsePointer += 1;
                        break;
                     }
               }
            });

            //console.log(response);
            commandToRun = null;
            iWating = 0;
            callback(response);
         }
      }
   };

   var onSend = function onSend() {
      console.log(LOG + "buffer sent.");
   };
   var onFlush = function onFlush() {
      console.log(LOG + "port flushed.");
   };

   var purgePort = function purgePort() {
      console.log(LOG + "purge()");
      state = DEVICE_STATES["PURGE"];
      if (bufIncomingData.length > 0) {
         chrome.serial.flush(iConnectionId, onFlush);
         bufIncomingData = new Uint8Array();
         setTimeout(purgePort, 300);
      } else {
         console.log(LOG + "device is ready.");
         state = DEVICE_STATES["DEVICE_IS_READY"];
      }
   };

   var getSerial = function getSerial() {
      console.log(LOG + "-> getSerial()");
      var buf = new ArrayBuffer(1);
      var bufView = new Uint8Array(buf);
      bufView[0] = 32;
      chrome.serial.send(iConnectionId, buf, onSend);
      state = DEVICE_STATES["TEST_DATA_SENT"];
   };

   var checkSerialNumber = function checkSerialNumber() {
      console.log(LOG + "let's check the serial");

      var sIncomingData = new TextDecoder("utf-8").decode(bufIncomingData);
      console.log(LOG + "Now we have: " + sIncomingData);

      if (bufIncomingData.length > DEVICE_SERIAL_NUMBER_PROBE_INTERVAL) {
         iSerialNumberOffset = sIncomingData.indexOf("ROBBO");
         if (iSerialNumberOffset < 0) {
            console.log(LOG + "Rubbish instead of serial number");
            state = DEVICE_STATES["RUBBISH"];
         } else {
            iDeviceID = parseInt(sIncomingData.substring(iSerialNumberOffset + 6, iSerialNumberOffset + 11));
            iFirmwareVersion = parseInt(sIncomingData.substring(iSerialNumberOffset + 12, iSerialNumberOffset + 17));
            sSerialNumber = sIncomingData.substring(iSerialNumberOffset + 18, iSerialNumberOffset + DEVICE_SERIAL_NUMBER_LENGTH);
            console.log(LOG + "Device=" + iDeviceID + " Firmware=" + iFirmwareVersion + " Serial='" + sSerialNumber + "'");

            purgePort();
         }
      } else {
         if (sSerialNumber === undefined && !isStopCheckingPort) {
            //Let's send the space
            getSerial();

            //Let's check the response
            var checkSerialNumberTimeout = setTimeout(checkSerialNumber, 300); //100
         }
      }
   };

   var onConnect = function onConnect(connectionInfo) {
      console.log(LOG + "connected.");
      state = DEVICE_STATES["CONNECTED"];

      iConnectionId = connectionInfo.connectionId;

      chrome.serial.onReceive.addListener(onReceiveCallback);

      checkSerialNumber();

      setTimeout(function () {

         console.log("Stop checking serial number.");
         //  clearTimeout(checkSerialNumberTimeout);
         isStopCheckingPort = true;
      }, DEVICE_HANDLE_TIMEOUT);
   };

   chrome.serial.connect(port.path, { bitrate: 115200 }, onConnect);

   this.getState = function () {
      return state;
   };

   this.getDeviceID = function () {
      return iDeviceID;
   };

   this.getPortName = function () {
      return this.port.path;
   };

   this.command = function (command, params, fCallback) {
      //  if(commandToRun != null) return;                    //???
      commandToRun = command;

      bufIncomingData = new Uint8Array();
      var buf = new ArrayBuffer(command.code.length + params.length + 1);
      var bufView = new Uint8Array(buf);
      var bufCommand = new TextEncoder("utf-8").encode(command.code);
      bufView.set(bufCommand);

      var iParamOffset = 0;
      params.forEach(function (param) {
         bufView[bufCommand.length + iParamOffset] = param;
         iParamOffset++;
      });

      bufView[bufCommand.length + iParamOffset] = 36;

      //console.log(buf);

      chrome.serial.send(iConnectionId, buf, onSend);

      //for #
      var iWaitingNew = 1;

      //all params
      Object.keys(command.response).forEach(function (sField) {
         switch (command.response[sField]) {
            case "uint2":
               {
                  iWaitingNew += 2;
                  break;
               }
            case "ubyte[4]":
               {
                  iWaitingNew += 4;
                  break;
               }
            case "ubyte":
               {
                  iWaitingNew += 1;
                  break;
               }
         }
      });

      callback = fCallback;

      console.log(LOG + "we wating for " + iWaitingNew + " bytes");
      iWaiting = iWaitingNew;
   };

   // var onGetDevices = function(ports) {
   //   for (var i=0; i<ports.length; i++) {
   //     console.log(ports[i].path);
   //     var device = new InterfaceDevice(ports[i]);
   //      arrDevices.push(device);
   //   }
   // }
   //
   // this.searchDevices(callback){
   //
   //    chrome.serial.getDevices(callback);
   //
   // }
   //
   //
   // this.getConnectedDevices(){
   //
   //
   //
   // }

}

var searchDevices = function searchDevices() {

   var onGetDevices = function onGetDevices(ports) {
      for (var i = 0; i < ports.length; i++) {
         console.log(ports[i].path);
         var device = new InterfaceDevice(ports[i]);
         arrDevices.push(device);
      }
   };

   chrome.serial.getDevices(onGetDevices);
};

var getConnectedDevices = function getConnectedDevices() {

   return arrDevices;
};

// var fuck = false;
// var mainLoop = function(){
//    arrDevices.forEach(function(device) {
//       if(device.getDeviceID() == 0 && device.getState() == DEVICE_STATES["DEVICE_IS_READY"]){
//
//          if(!fuck){
//             device.command(DEVICES[0].commands.sensors, [7, 0, 0, 0, 0], function(response){
//                console.log("pizda=" + response.a0);
//             });
//             fuck = true;
//             return;
//          }
//          device.command(DEVICES[0].commands.power, [0, 0], function(response){
//             console.log("pizda=" + response.a0);
//          });
//       }
//    });
//
//    setTimeout(mainLoop, 100);
// }


exports.InterfaceDevice = InterfaceDevice;
exports.searchDevices = searchDevices;
exports.getConnectedDevices = getConnectedDevices;
exports.DEVICES = DEVICES;
exports.DEVICE_STATES = DEVICE_STATES;

// chrome.app.runtime.onLaunched.addListener(function() {
//   // Center window on screen.
//   var screenWidth = screen.availWidth;
//   var screenHeight = screen.availHeight;
//   var width = 500;
//   var height = 300;
//
//
//   chrome.serial.getDevices(onGetDevices);
//   mainLoop();
//
//
//   chrome.app.window.create('index.html', {
//     id: "helloWorldID",
//     outerBounds: {
//       width: width,
//       height: height,
//       left: Math.round((screenWidth-width)/2),
//       top: Math.round((screenHeight-height)/2)
//     }
//   });
// });

/***/ })
/******/ ]);
//# sourceMappingURL=Robboscratch3_DeviceControlAPI.js.map