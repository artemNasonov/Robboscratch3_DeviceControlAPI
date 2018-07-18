
import {firmwares} from './firmwares';




//console.log("huuuui");
//fixHex();


var    arrPorts = [];
var    bitrate = 115200;

const flash_firmware = function(port_num,print_status){

   var  iConnectionId = null;

   var hexfile = "";
   var hexfileascii = "afawf.awafw.00000001FF";
   var DTRRTSOn = { dtr: true, rts: true };
   var DTRRTSOff = { dtr: false, rts: false };



   function hexpad16(num,size) {
         var size = 4;
         var s = "0000" + num;
       return s.substr(s.length-size);
       }


   /* Interprets an ArrayBuffer as UTF-8 encoded string data. */
 //  var ab2str = function(buf) {
 //    var bufView = new Uint8Array(buf);
 //    var encodedString = String.fromCharCode.apply(null, bufView);
   //  if(verbose_logging) console.log(encodedString);
 //    return decodeURIComponent(encodeURIComponent(encodedString));
 //  };

   /* Converts a string to UTF-8 encoding in a Uint8Array; returns the array buffer. */
   var str2ab = function(str) {
    // var encodedString = unescape(encodeURIComponent(str));
     var encodedString = str;
     var bytes = new Uint8Array(encodedString.length);
     for (var i = 0; i < encodedString.length; ++i) {
       bytes[i] = encodedString.charCodeAt(i);
     }
     return bytes.buffer;
   };

   function stk500_getparam(param,delay) {
       transmitPacket("A"+String.fromCharCode(parameters[param])+String.fromCharCode(command.Sync_CRC_EOP),delay);
   }

   function d2b(number) {
       return String.fromCharCode(number);
   }

   var command = {

 "Sync_CRC_EOP" : 0x20,
 "GET_SYNC" : 0x30,
 "GET_SIGN_ON" : 0x31,
 "SET_PARAMETER" : 0x40,
 "GET_PARAMETER" : 0x41,
 "SET_DEVICE" : 0x42,
 "SET_DEVICE_EXT" : 0x45,
 "ENTER_PROGMODE" : 0x50,
 "LEAVE_PROGMODE" : 0x51,
 "CHIP_ERASE" : 0x52,
 "CHECK_AUTOINC" : 0x53,
 "LOAD_ADDRESS" : 0x55,
 "UNIVERSAL" : 0x56,
 "UNIVERSAL_MULTI" : 0x57,
 "PROG_FLASH" : 0x60,
 "PROG_DATA" : 0x61,
 "PROG_FUSE" : 0x62,
 "PROG_LOCK" : 0x63,
 "PROG_PAGE" : 0x64,
 "PROG_FUSE_EXT" : 0x65,
 "READ_FLASH" : 0x70,
 "READ_DATA" : 0x71,
 "READ_FUSE" : 0x72,
 "READ_LOCK" : 0x73,
 "READ_PAGE" : 0x74,
 "READ_SIGN" : 0x75,
 "READ_OSCCAL" : 0x76,
 "READ_FUSE_EXT" : 0x77,
 "READ_OSCCAL_EXT" : 0x78
 };


 var parameters = {
 "HW_VER" : 0x80,
 "SW_MAJOR" : 0x81,
 "SW_MINOR" : 0x82,
 "LEDS": 0x83,
 "VTARGET": 0x84,
 "VADJUST": 0x85,
 "OSC_PSCALE" : 0x86,
 "OSC_CMATCH" : 0x87,
 "RESET_DURATION" : 0x88,
 "SCK_DURATION" : 0x89,
 "BUFSIZEL" : 0x90,
 "BUFSIZEH" : 0x91,
 "DEVICE" : 0x92,
 "PROGMODE" : 0x93,
 "PARAMODE" : 0x94,
 "POLLING" : 0x95,
 "SELFTIMED" : 0x96,
 "TOPCARD_DETECT" : 0x98
 };


 var responses = {
   0x10 : "OK",
   0x11 : "FAILED",
   0x12 : "UNKNOWN",
   0x13 : "NODEVICE",
   0x14 : "INSYNC",
   0x15 : "NOSYNC"
 };
 var timer = 0;
 function transmitPacket(buffer,delay) {
     setTimeout(function() {
 //        display_console('.', '', '');
         //if(verbose_logging){
             var debug = "";
             for (var x = 0; x < buffer.length; x++) {
                 debug += "[" + buffer.charCodeAt(x).toString(16) + "]";
             }
             console.log(debug);
       //  }
         connection.send(buffer);
     },delay + timer);
     timer = timer + delay;
 }

   function stk500_prgpage(address,data,delay,flag) {
     address = hexpad16(address.toString(16)); /* convert and pad number to hex */
     address = address[2] + address[3] + address[0] + address[1];  /* make LSB first */
     //if(verbose_logging) console.log("Programming 0x"+address);
     address = String.fromCharCode(parseInt(address[0] + address[1],16)) +  String.fromCharCode(parseInt(address[2] + address[3],16)); /* h2b */
     transmitPacket(d2b(command.LOAD_ADDRESS)+address+d2b(command.Sync_CRC_EOP),delay);
     var debug = "";
     var datalen = data.length;
     //buffer = "";
     transmitPacket(d2b(command.PROG_PAGE)+d2b(0x00)+d2b(datalen)+d2b(0x46)+data+d2b(command.Sync_CRC_EOP),delay);
   }

   function stk500_upload(heximage) {
       var flashblock = 0;
       transmitPacket(d2b(command.ENTER_PROGMODE)+d2b(command.Sync_CRC_EOP),50);
       var blocksize = 128;
     //  blk = Math.ceil(heximage.length / blocksize);
     //  termmode = 0;
       //display_console("Binary data broken into "+blk+" blocks (block size is 128)\nComplete when you see "+blk+" dots: \n\n", "", "\n");
       //set_progress(80, "Serial upload...");
       var b;
       for(b = 0; b < Math.ceil(heximage.length / blocksize); b++) {
           var currentbyte = blocksize * b;
           var block = heximage.substr(currentbyte,blocksize);
           /* console.log("Block "+b+" starts at byte "+currentbyte+": "+block) */
   //        flag = 0;
           stk500_prgpage(flashblock,block,250);
           flashblock = flashblock + 64;
       }
       //setTimeout(function () {
         //  connection.resetBaud(success => {
             //  set_progress(100, "Serial programming finished.");
             //  display_console("Upload Complete! Have a nice day! :)", success ? "" : "Could not reset baudrate", "\n\n");
             //  termmode = 1;
             //  if (!terminalwindow) connection.disconnect();
             //  if (terminal) terminal.clear();
         //  });
       ///},timer + 1000);

       //timer = 0;
   }



   function fixHex(firmware) {

       hexfileascii = firmware;
       hexfile = "";
       var buffer = hexfileascii.split("\n");
     console.log(buffer.length);
       for(var x = 0; x < buffer.length; x++) {
       console.log("voshel");
       var  size = parseInt(buffer[x].substr(1,2),16);
           if(size == 0) {
               console.log("complete!\n");
               //set_progress(50, "Intel Hex decoded, launching programmer...");
               stk500_program();
               return;
           }
           for(var y = 0; y < (size * 2); y = y + 2){
               // console.log(buffer[x].substr(y+9,2));
               hexfile += String.fromCharCode(parseInt(buffer[x].substr(y+9,2),16));
           }
       }
     console.log("vishel");
     }
   function stk500_program() {
   //  fixHex();
     //set_progress(60, "Putting Arduino in program mode (DTR Reset)...");
     chrome.serial.setControlSignals(iConnectionId,DTRRTSOff,function(result) {
         console.log("DTR off: " + result);
         setTimeout(function(){
             chrome.serial.setControlSignals(iConnectionId,DTRRTSOn,function(result) {
                 console.log("DTR on:" + result);
                 setTimeout(function() {
                     //set_progress(70, "Reset complete...prepping upload blocks..");
                     //log("Arduino reset, now uploading.\n");
                     stk500_upload(hexfile);
                 },200);
             });
         }, 100);
     });
 }



      var onConnect = function(connectionInfo){

             if(typeof(connectionInfo)!== "undefined")

             {

                iConnectionId = connectionInfo.connectionId;

              if (typeof(iConnectionId) !== 'undefined'){

                 console.log(LOG + "iConnectionId:" + iConnectionId);

                 if (print_status){
                  print_status(LOG + "iConnectionId:" + iConnectionId);
                 }


                  console.log(LOG + "connected.");

                  if (print_status){

                       print_status(LOG + "connected.");
                  }



                  var firmware = firmwares.device_id_1.version_5;

                  fixHex(firmware);




             }





             }

     }




    var port_path = arrPorts[port_num].path;

    console.log(`flash_firmware ${port_path}`);

    const LOG = "[" + port_path + "] ";

     chrome.serial.connect(port_path, {bitrate: bitrate}, onConnect);

}

const search_ports = function(callback){




  var onGetDevices = function(ports) {
    for (var i=0; i<ports.length; i++) {
      console.log(ports[i].path);

       arrPorts.push(ports[i]);

       callback(ports[i])
    }
  }

    chrome.serial.getDevices(onGetDevices);

};

export  {

    flash_firmware,
    search_ports

};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
