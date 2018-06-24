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

  dv.setUint8(0,0x5C,true);
  dv.setUint8(1,0x01,true);



  Crazyradio.sendPacket(packet, (state, data) => {
    if (state === true) {

        var toc_log_len = 6;
        var telemetry_element_table = [];

        if ( ([0x50,0x54,0x56,0x5C].indexOf(data[1]) != -1 ) ){ //проверяем, является ли ответ нужным нам.

          toc_log_len = data[3];

        } else  { //если не является, запрашиваем данные повторно


            packet = new ArrayBuffer(1);
            dv  = new DataView(packet);

        dv.setUint8(0,0xf3,true);




        Crazyradio.sendPacket(packet, (state, data) => {

          if (state === true) {

            if ( ([0x50,0x54,0x56,0x5C].indexOf(data[1]) != -1 ) ){ //проверяем, является ли ответ нужным нам.

              toc_log_len = data[3];

            }else{

                        packet = new ArrayBuffer(1);
                        dv  = new DataView(packet);

                    dv.setUint8(0,0xff,true);




                    Crazyradio.sendPacket(packet, (state, data) => {

                      if (state === true) {

                        if ( ([0x50,0x54,0x56,0x5C].indexOf(data[1]) != -1 ) ){ //проверяем, является ли ответ нужным нам.

                          toc_log_len = data[3];

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

                          //    if (typeof(data) != 'undefined'){

                              if (([0x50,0x54,0x56,0x5C].indexOf(data[1]) != -1 ) ){

                                  telemetry_element_table[data[3]] = {

                                        telemetry_element_type: data[4],
                                        telemetry_element_group_and_name: data.slice(5),

                                  }

                                console.log(`telemetry_element id: ${data[3]}  type: ${data[4]} group_and_name:  ${String.fromCharCode(data.slice(5))}`);

                              }else{




                              }



                          //    }

                            } else {
                            //  $("#packetLed").removeClass("good");
                            }
                          });

                        }

                      }else{



                      }
          });

            }

          }else{



          }
        });




           // let toc_fetch_interval = setInterval(() => {
           //
           //   Crazyradio.getData( (state, data) => {
           //
           //
           //     if (([0x50,0x54,0x56,0x5C].indexOf(data[1]) != -1 ) ){
           //
           //        //получили длину TOC
           //
           //
           //       toc_log_len = data[3];
           //       clearInterval(toc_fetch_interval);
           //
           //     }
           //
           //
           // });
           //
           //
           // },30);
           //
           // setTimeout(function(){
           //
           //    clearInterval(toc_fetch_interval);
           //
           //
           // },30000)


          //      toc_log_len = 0;

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
