const DEVICE_SERIAL_NUMBER_PROBE_INTERVAL = 100;
const DEVICE_SERIAL_NUMBER_LENGTH = 52;
const DEVICE_HANDLE_TIMEOUT = 1 * 60 * 1000;

const DEVICE_STATES = Object.freeze({
   "INITED": 0,
   "OPENED": 1,
   "TEST_DATA_SENT": 2,
   "RUBBISH": 3,
   "SERIAL_FOUND": 4,
   "PURGING": 5,
   "DEVICE_IS_READY": 6
});

const DEVICES = Object.freeze({
   //Basic Robot
   0:{
      "firmware":7,
      "commands":{
         "check":{
            "code": "a",
            "params": [],
            "response": {
                         "encoder0" : "uint2",
                         "encoder1" : "uint2",
                         "path0"    : "uint2",
                         "path1"    : "uint2",
                         "a0"       : "ubyte[4]",
                         "a1"       : "ubyte[4]",
                         "a2"       : "ubyte[4]",
                         "a3"       : "ubyte[4]",
                         "a4"       : "ubyte[4]",
                         "button"   : "ubyte"
                        }
         },
         "power":{
            "code": "c",
            "params": ["ubyte", "ubyte"],
            "response": {
                         "encoder0" : "uint2",
                         "encoder1" : "uint2",
                         "path0"    : "uint2",
                         "path1"    : "uint2",
                         "a0"       : "ubyte[4]",
                         "a1"       : "ubyte[4]",
                         "a2"       : "ubyte[4]",
                         "a3"       : "ubyte[4]",
                         "a4"       : "ubyte[4]",
                         "button"   : "ubyte"
                        }
         },
         "sensors":{
            "code": "i",
            "params": ["ubyte", "ubyte", "ubyte", "ubyte", "ubyte"],
            "response": {
                         "encoder0" : "uint2",
                         "encoder1" : "uint2",
                         "path0"    : "uint2",
                         "path1"    : "uint2",
                         "a0"       : "ubyte[4]",
                         "a1"       : "ubyte[4]",
                         "a2"       : "ubyte[4]",
                         "a3"       : "ubyte[4]",
                         "a4"       : "ubyte[4]",
                         "button"   : "ubyte"
                        }
         }
      }
   },

   //Old lab
   1:{
   }
});


var arrDevices = [];



function InterfaceDevice(port){
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

   var onReceiveCallback = function(info){
      if(info.connectionId == iConnectionId && info.data){
         var buf = new Uint8Array(info.data);
         console.log(LOG + "<- " + buf.length);
         var bufIncomingDataNew = new Uint8Array(bufIncomingData.length + buf.length);
         bufIncomingDataNew.set(bufIncomingData);
         bufIncomingDataNew.set(buf, bufIncomingData.length);

         bufIncomingData = bufIncomingDataNew;

         //We are not waiting for any data;
         if(commandToRun == null) return;


         if(bufIncomingData.length >= iWaiting){
            console.log(LOG + "command '" + commandToRun.code + "' complete.");

            //all params
            var iResponsePointer = 1;
            Object.keys(commandToRun.response).forEach(function (sField){
               switch(commandToRun.response[sField]){
                  case "uint2":{
                     response[sField] = bufIncomingData[iResponsePointer] * 256 + bufIncomingData[iResponsePointer + 1];
                     iResponsePointer += 2;
                     break;
                  }
                  case "ubyte[4]":{
                     response[sField] = [];
                     response[sField].push(bufIncomingData[iResponsePointer]);
                     response[sField].push(bufIncomingData[iResponsePointer + 1]);
                     response[sField].push(bufIncomingData[iResponsePointer + 2]);
                     response[sField].push(bufIncomingData[iResponsePointer + 3]);
                     iResponsePointer += 2;
                     break;
                  }
                  case "ubyte":{
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


   var onSend = function(){
      console.log(LOG + "buffer sent.");
   };
   var onFlush = function(){
      console.log(LOG + "port flushed.");
   }

   var purgePort = function(){
      console.log(LOG + "purge()");
      state = DEVICE_STATES["PURGE"];
      if(bufIncomingData.length > 0){
         chrome.serial.flush(iConnectionId, onFlush);
         bufIncomingData = new Uint8Array();
         setTimeout(purgePort, 300);
      }
      else{
         console.log(LOG + "device is ready.");
         state = DEVICE_STATES["DEVICE_IS_READY"];
      }
   }


   var getSerial = function(){
      console.log(LOG + "-> getSerial()");
      var buf=new ArrayBuffer(1);
      var bufView=new Uint8Array(buf);
      bufView[0] = 32;
      chrome.serial.send(iConnectionId, buf, onSend);
      state = DEVICE_STATES["TEST_DATA_SENT"];
   }

   var checkSerialNumber = function(){
      console.log(LOG + "let's check the serial");

      var sIncomingData = new TextDecoder("utf-8").decode(bufIncomingData);
      console.log(LOG + "Now we have: " + sIncomingData);

      if(bufIncomingData.length > DEVICE_SERIAL_NUMBER_PROBE_INTERVAL){
         iSerialNumberOffset = sIncomingData.indexOf("ROBBO");
         if(iSerialNumberOffset < 0){
            console.log(LOG + "Rubbish instead of serial number");
            state = DEVICE_STATES["RUBBISH"];
         }
         else{
            iDeviceID        = parseInt(sIncomingData.substring(iSerialNumberOffset + 6, iSerialNumberOffset + 11));
            iFirmwareVersion = parseInt(sIncomingData.substring(iSerialNumberOffset + 12, iSerialNumberOffset + 17));
            sSerialNumber    = sIncomingData.substring(iSerialNumberOffset + 18, iSerialNumberOffset + DEVICE_SERIAL_NUMBER_LENGTH);
            console.log(LOG + "Device=" + iDeviceID + " Firmware=" + iFirmwareVersion + " Serial='" + sSerialNumber + "'");

            purgePort();
         }
      }
      else{
         if((sSerialNumber === undefined) && (!isStopCheckingPort)) {
            //Let's send the space
            getSerial();

            //Let's check the response
             let checkSerialNumberTimeout =   setTimeout(checkSerialNumber, 300); //100

         }
      }
   }

   var onConnect = function(connectionInfo){
      console.log(LOG + "connected.");
      state = DEVICE_STATES["CONNECTED"];

      iConnectionId = connectionInfo.connectionId;

      chrome.serial.onReceive.addListener(onReceiveCallback);

      checkSerialNumber();

      setTimeout(function(){


          console.log("Stop checking serial number.")
        //  clearTimeout(checkSerialNumberTimeout);
          isStopCheckingPort = true;



      }  ,DEVICE_HANDLE_TIMEOUT);
   }


   chrome.serial.connect(port.path, {bitrate: 115200}, onConnect);


   this.getState = function(){
      return state;
   }

   this.getDeviceID = function(){
      return iDeviceID;
   }

   this.getPortName = function(){
      return this.port.path;
   }

   this.command = function(command, params, fCallback){
      if(commandToRun != null) return;                   
      commandToRun = command;

      bufIncomingData = new Uint8Array();
      var buf=new ArrayBuffer(command.code.length + params.length + 1);
      var bufView=new Uint8Array(buf);
      var bufCommand = new TextEncoder("utf-8").encode(command.code);
      bufView.set(bufCommand);

      var iParamOffset = 0;
      params.forEach(function(param){
         bufView[bufCommand.length + iParamOffset] = param;
         iParamOffset++;
      });

      bufView[bufCommand.length + iParamOffset] = 36;

      //console.log(buf);

      chrome.serial.send(iConnectionId, buf, onSend);

      //for #
      var iWaitingNew = 1;

      //all params
      Object.keys(command.response).forEach(function (sField){
         switch(command.response[sField]){
            case "uint2":{
               iWaitingNew += 2;
               break;
            }
            case "ubyte[4]":{
               iWaitingNew += 4;
               break;
            }
            case "ubyte":{
               iWaitingNew += 1;
               break;
            }
         }
      });

      callback = fCallback;

      console.log(LOG + "we wating for " + iWaitingNew + " bytes");
      iWaiting = iWaitingNew;
   }


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


const searchDevices = function(){

  var onGetDevices = function(ports) {
    for (var i=0; i<ports.length; i++) {
      console.log(ports[i].path);
      var device = new InterfaceDevice(ports[i]);
       arrDevices.push(device);
    }
  }

    chrome.serial.getDevices(onGetDevices);

};

const getConnectedDevices = function(){

    return arrDevices;

}



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














export  {

  InterfaceDevice,
  searchDevices,
  getConnectedDevices,
  DEVICES,
  DEVICE_STATES


};

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
