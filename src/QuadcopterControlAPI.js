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
     this.move_with_speed_interval = null;
     this.move_to_coords_interval  = null;

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

              // setTimeout(function(self){

                   this.startDataRecieving();

            //   },3000,this)



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


  cleanQuadcopterInitData(){

        console.log(`cleanQuadcopterInitData`);

        return new Promise((resolve,reject)=>{

          var  packet = new ArrayBuffer(1);
          var  dv  = new DataView(packet);
          dv.setUint8(0,0xff,true);


          Crazyradio.sendPacket(packet).then(result => {

              console.log(`cleanQuadcopterInitData incoming data: ${result.data}`);


              if (result.state === true) {


              }else{



              }

          }).catch(error => {



          });

         var cleanQuadcopterInitDataInterval =  setInterval(() => {



            Crazyradio.sendPacket(packet).then(result => {

                console.log(`cleanQuadcopterInitData incoming data: ${result.data}`);


                if (result.state === true) {

                    if (( [0xf3,0xf7].indexOf(result.data[0]) != -1 )){


                          clearInterval(cleanQuadcopterInitDataInterval);
                          resolve("Quadcopter init data clean step was succesfully passed");


                    }


                }else{



                }

            }).catch(error => {

                    reject();

            });


          },50);



          setTimeout(() => {

              clearInterval(cleanQuadcopterInitDataInterval);

          },5000)



          // Crazyradio.sendPacket(packet1, function(state, data) {
          //   if (state === true) {
          //    console.log("success 1");
          //   } else {
          //     console.log("unsuccess 1");
          //   }
          // })


        });


  }

  TOC_GET_INFO(){



    console.log(`tocLenRecieve`);

    return new Promise((resolve,reject)=>{

      var  packet = new ArrayBuffer(2);
      var  dv  = new DataView(packet);
      dv.setUint8(0,0x5C,true);
      dv.setUint8(1,0x01,true);


      Crazyradio.sendPacket(packet).then(result => {

          console.log(`tocLenRecieve incoming data: ${result.data}`);


          if (result.state === true) {

              packet = new ArrayBuffer(1);
              dv  = new DataView(packet);
              dv.setUint8(0,0xff,true);


              return   Crazyradio.sendPacket(packet);

          }else{



          }

      }).then(result => {

        if (result.state === true) {

            packet = new ArrayBuffer(1);
            dv  = new DataView(packet);
            dv.setUint8(0,0xf3,true);


            return   Crazyradio.sendPacket(packet);

        }else{



        }


      }).then(result => {

        if (result.state === true) {

          if ( ([0x50,0x54,0x56,0x5C].indexOf(result.data[0]) != -1 ) ){ //проверяем, является ли ответ нужным нам.

                   let toc_log_len = result.data[2];
                   console.log(`toc_log_len: ${toc_log_len}`);
                   resolve(toc_log_len);

            }


        }else{



        }



      }).catch(error => {



      });








    });


  }


  TOC_GET_ITEM(item_index){


    console.log(`TOC_GET_ITEM`);

  //  return new Promise((resolve,reject)=>{

      var  packet = new ArrayBuffer(3);
      var  dv  = new DataView(packet);
      dv.setUint8(0,0x5C,true);
      dv.setUint8(1,0x00,true);
      dv.setUint8(2,Number(item_index),true);


    return   Crazyradio.sendPacket(packet);








  //  });

}

  startDataRecieving(){


        this.cleanQuadcopterInitData().then(result => {

            console.log(result);

            return this.TOC_GET_INFO();


        }).then(toc_log_len => {

              console.log("Quadcopter TOC Len Recieve step was sucessfully passed");


              let get_item_functions_arr = [];
              var toc_item_index = 0;

          //    for (i=0;i<toc_log_len;i++){


              var  TOC_GET_ITEM_INTERVAL =    setInterval(() => {


                    this.TOC_GET_ITEM(toc_item_index).then(result => {

                        console.log(`TOC_GET_ITEM incoming data: ${result.data}`);


                        if (result.state === true) {

                            packet = new ArrayBuffer(1);
                            dv  = new DataView(packet);
                            dv.setUint8(0,0xff,true);


                            return   Crazyradio.sendPacket(packet);

                        }else{



                        }

                    }).then(result => {

                        console.log(`TOC_GET_ITEM incoming data: ${result.data}`);

                      if (result.state === true) {

                          packet = new ArrayBuffer(1);
                          dv  = new DataView(packet);
                          dv.setUint8(0,0xf3,true);


                          return   Crazyradio.sendPacket(packet);

                      }else{



                      }


                    }).then(result => {

                        console.log(`TOC_GET_ITEM incoming data: ${result.data}`);

                      if (result.state === true) {

                        if ( ([0x50,0x54,0x56,0x5C].indexOf(result.data[0]) != -1 ) ){ //проверяем, является ли ответ нужным нам.

                              toc_item_index++;

                              if (toc_item_index == toc_log_len){


                                clearInterval(TOC_GET_ITEM_INTERVAL);
                              }



                              //   resolve(result.data);

                          }


                      }else{



                      }



                    }).catch(error => {



                    });



                  },30);



          //    }

              // Promise.all(get_item_functions_arr).then(results => {
              //
              //   for (i=0;i<toc_log_len;i++){
              //
              //       console.log(`COPTER_TOC_GET_ITEM: ${results[i]}`);
              //
              //   }
              //
              // });




        }).catch(error => {



        });


  }


  move_to_coord(x_coord,y_coord,height,yaw){   //yaw - угол поворота




  }

  move_with_speed(vx,vy,yaw,height){




  }

  /*
    X , Y, Z, W

  */
  get_coord(coord){


  }


  // startDataRecieving(){
  //
  //   var  packet = new ArrayBuffer(2);
  //   var  dv  = new DataView(packet);
  //
  // dv.setUint8(0,0x5C,true);
  // dv.setUint8(1,0x01,true);
  //
  //
  //
  // Crazyradio.sendPacket(packet, (state, data) => {
  //   if (state === true) {
  //
  //       var toc_log_len = 6;
  //       var telemetry_element_table = [];
  //
  //       if ( ([0x50,0x54,0x56,0x5C].indexOf(data[1]) != -1 ) ){ //проверяем, является ли ответ нужным нам.
  //
  //         toc_log_len = data[3];
  //         console.log(`toc_log_len: ${toc_log_len}`);
  //
  //       } else  { //если не является, запрашиваем данные повторно
  //
  //
  //       //     packet = new ArrayBuffer(1);
  //       //     dv  = new DataView(packet);
  //       //
  //       // dv.setUint8(0,0xf3,true);
  //
  //
  //
  //
  //       // Crazyradio.sendPacket(packet, (state, data) => {
  //       //
  //       //   if (state === true) {
  //       //
  //       //     if ( ([0x50,0x54,0x56,0x5C].indexOf(data[1]) != -1 ) ){ //проверяем, является ли ответ нужным нам.
  //       //
  //       //       toc_log_len = data[3];
  //       //
  //       //     }else{
  //       //
  //       //                 packet = new ArrayBuffer(1);
  //       //                 dv  = new DataView(packet);
  //       //
  //       //             dv.setUint8(0,0xff,true);
  //       //
  //       //
  //       //
  //       //
  //       //             Crazyradio.sendPacket(packet, (state, data) => {
  //       //
  //       //               if (state === true) {
  //       //
  //       //                 if ( ([0x50,0x54,0x56,0x5C].indexOf(data[1]) != -1 ) ){ //проверяем, является ли ответ нужным нам.
  //       //
  //       //                   toc_log_len = data[3];
  //       //
  //       //                 }
  //       //
  //       //                 console.log(`toc_log_len: ${toc_log_len}`);
  //       //
  //       //                 let toc_element_id = 0;
  //       //
  //       //                 for (toc_element_id = 0; toc_element_id < toc_log_len; toc_element_id++){
  //       //
  //       //                     packet = new ArrayBuffer(3);
  //       //                     dv  = new DataView(packet);
  //       //
  //       //                   dv.setUint8(0,0x50,true);
  //       //                   dv.setUint8(1,0x00,true);
  //       //                   dv.setUint8(2,Number(toc_element_id),true);
  //       //
  //       //                   Crazyradio.sendPacket(packet, (state, data) => {
  //       //                     if (state === true) {
  //       //
  //       //                   //    if (typeof(data) != 'undefined'){
  //       //
  //       //                       if (([0x50,0x54,0x56,0x5C].indexOf(data[1]) != -1 ) ){
  //       //
  //       //                           telemetry_element_table[data[3]] = {
  //       //
  //       //                                 telemetry_element_type: data[4],
  //       //                                 telemetry_element_group_and_name: data.slice(5),
  //       //
  //       //                           }
  //       //
  //       //                         console.log(`telemetry_element id: ${data[3]}  type: ${data[4]} group_and_name:  ${String.fromCharCode(data.slice(5))}`);
  //       //
  //       //                       }else{
  //       //
  //       //
  //       //
  //       //
  //       //                       }
  //       //
  //       //
  //       //
  //       //                   //    }
  //       //
  //       //                     } else {
  //       //                     //  $("#packetLed").removeClass("good");
  //       //                     }
  //       //                   });
  //       //
  //       //                 }
  //       //
  //       //               }else{
  //       //
  //       //
  //       //
  //       //               }
  //       //   });
  //       //
  //       //     }
  //       //
  //       //   }else{
  //       //
  //       //
  //       //
  //       //   }
  //       // });
  //
  //
  //
  //
  //          let toc_fetch_interval = setInterval(() => {
  //
  //            Crazyradio.getData( (state, data) => {
  //
  //
  //              if (([0x50,0x54,0x56,0x5C].indexOf(data[1]) != -1 ) ){
  //
  //                 //получили длину TOC
  //
  //
  //                 toc_log_len = data[3];
  //                 console.log(`toc_log_len: ${toc_log_len}`);
  //                clearInterval(toc_fetch_interval);
  //
  //              }
  //
  //
  //          });
  //
  //
  //          },30);
  //
  //          setTimeout(function(){
  //
  //             clearInterval(toc_fetch_interval);
  //
  //
  //          },30000)
  //
  //
  //         //      toc_log_len = 0;
  //
  //       }
  //
  //
  //
  //
  //   } else {
  //   //  $("#packetLed").removeClass("good");
  //   }
  // });
  //
  //
  // }

  start_command_sending(){

  this.move_with_speed_interval  =   setInterval(function(self){


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
