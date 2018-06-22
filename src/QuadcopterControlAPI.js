import DeviceControlAPI from './DeviceControlAPI';
//import RobotSensorsData from './RobotSensorsData';
import {Crazyradio} from './crazyradio';


export default class QuadcopterControlAPI extends DeviceControlAPI {

   constructor(){

      super();

      this.searching_in_progress = false;
      this.radioState = "disconnected";

      this.x_speed = Number(0);
      this.y_speed = Number(0);
      this.rotation = Number(0);
      this.z_distance = Number(0);


   }


   searchQuadcopterDevices(){

     this.searching_in_progress = true;

     if (this.radioState === "connected") {

       Crazyradio.close();
       this.radioState = "disconnected";


    }



     if (this.radioState === "disconnected") {
     Crazyradio.open((state) => {
       console.log("Crazyradio opened: " + state);
       if (state === true) {
         Crazyradio.setChannel(80, (state) => {
           Crazyradio.setDatarate("250Kbps", (state) => {
             if (state) {


               this.radioState = "connected";
               this.searching_in_progress = false;
               this.startDataRecieving();

             }
           });
         });
       }
     });
   } else if (this.radioState === "connected") {

    // this.radioState = "disconnected";
    // this.searching_in_progress = false;
    // Crazyradio.close();


   }


   }


   isQuadcopterSearching(){

         return   this.searching_in_progress;
   }

  isQuadcopterConnected(){

      let is_connected = false;

      is_connected = (this.radioState === "connected")?true:false;


      return is_connected;

  }


  startDataRecieving(){

    var  packet = new ArrayBuffer(2);
    var  dv  = new DataView(packet);

  dv.setUint8(0,0x50,true);
  dv.setUint8(1,0x01,true);



  Crazyradio.sendPacket(packet, (state, data) => {
    if (state === true) {

        var toc_log_len;
        var telemetry_element_table = [];

        if (typeof(data[2]) != 'undefined'){

          toc_log_len = data[2];

        } else  {

                toc_log_len = 6;

        }

        console.log(`toc_log_len: ${toc_log_len}`);

        let toc_element_id = 0;

        for (toc_element_id = 0; toc_element_id < toc_log_len; toc_element_id++){

            packet = new ArrayBuffer(3);
            dv  = new DataView(packet);

          dv.setUint8(0,0x50,true);
          dv.setUint8(1,0x00,true);
          dv.setUint8(2,Number(toc_element_id),true);

          Crazyradio.sendPacket(packet, (state, data) => {
            if (state === true) {

              if (typeof(data) != 'undefined'){

                  telemetry_element_table[data[2]] = {

                        telemetry_element_type: data[3],
                        telemetry_element_group_and_name: data.slice(4),

                  }

                console.log(`telemetry_element id: ${data[2]}  type: ${data[3]} group_and_name:  ${String.fromCharCode(data.slice(4))}`);

              }

            } else {
            //  $("#packetLed").removeClass("good");
            }
          });

        }


    } else {
    //  $("#packetLed").removeClass("good");
    }
  });


  }

  start_command_sending(){

    setInterval(function(self){


      var  packet = new ArrayBuffer(18);
      var  dv  = new DataView(packet);

    dv.setUint8(0,0x7C,true);
    dv.setUint8(1,0x05,true);

    dv.setFloat32(2,self.x_speed,true);
    dv.setFloat32(6,self.y_speed,true);
    dv.setFloat32(10,self.rotation,true);
    dv.setFloat32(14,self.z_distance,true);

    Crazyradio.sendPacket(packet, function(state, data) {
      if (state === true) {
    //    $("#packetLed").addClass("good");
      } else {
      //  $("#packetLed").removeClass("good");
      }
    });

  },30,this);





  }

  fly_up(){

    console.log("copter fly_up()")

        if (this.radioState === "connected"){


          this.z_distance = Number(0.3);
          this.start_command_sending();








        }


  }

  copter_land(){

    console.log("copter copter_land()");

    Crazyradio.close();


  }


}
