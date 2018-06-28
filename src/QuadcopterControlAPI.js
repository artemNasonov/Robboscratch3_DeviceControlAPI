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
     this.getDataInterval = null;
     this.telemetryData = {};
     this.telemetryDataRaw = [];

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


              // this.radioState = "connected";
              // this.searching_in_progress = false;

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

          var sent_packets = 0;
          var recieved_packets = 0;

         var cleanQuadcopterInitDataInterval =  setInterval(() => {


            sent_packets++;
            console.log(`cleanQuadcopterInitData sent_packets: ${sent_packets}`);

            Crazyradio.sendPacket(packet).then(result => {

                console.log(`cleanQuadcopterInitData incoming data: ${result.data}`);


                if (result.state === true) {

                    recieved_packets++;
                    console.log(`cleanQuadcopterInitData recieved_packets: ${recieved_packets}`);

                    if (( [0xf3,0xf7].indexOf(result.data[0]) != -1 )){


                        clearInterval(cleanQuadcopterInitDataInterval);

                      //    if (sent_packets == recieved_packets){


                                resolve("Quadcopter init data clean step was succesfully passed");
                      //    }



                    }


                }else{



                }

            }).catch(error => {

                    reject();

            });


          },100);



          setTimeout(() => {

              clearInterval(cleanQuadcopterInitDataInterval);

          },50000)



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

    return new Promise((resolve,reject)=>{

      var  packet = new ArrayBuffer(3);
      var  dv  = new DataView(packet);
      dv.setUint8(0,0x5C,true);
      dv.setUint8(1,0x00,true);
      dv.setUint8(2,Number(item_index),true);


      Crazyradio.sendPacket(packet).then(result => {

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


          return  Crazyradio.sendPacket(packet);

      }else{



      }


    }).then(result => {

        console.log(`TOC_GET_ITEM incoming data: ${result.data}`);

      if (result.state === true) {





          resolve(result.data);




      }else{



      }



    }).catch(error => {




    });


});

}


  TOC_CREATE_BLOCK(telemetry_element_table,prefered_telemetry_table,block_id){

    console.log(`TOC_CREATE_BLOCK`);

    return new Promise((resolve,reject)=>{

      var array_buffer_length = prefered_telemetry_table.length * 2 + 3;

      var  packet = new ArrayBuffer(array_buffer_length);

      var  dv  = new DataView(packet);
      dv.setUint8(0,0x51,true);
      dv.setUint8(1,0x00,true);



    //  var block_id = Math.floor( Math.random() * 100);

      dv.setUint8(2,block_id,true);

      var type;
      var input

      for (var i = 0; i < prefered_telemetry_table.length; i++) {

        type = (telemetry_element_table[prefered_telemetry_table[i]].telemetry_element_type << 4) + telemetry_element_table[prefered_telemetry_table[i]].telemetry_element_type;
        dv.setUint8((3 + i * 2 ),type,true);
        dv.setUint8((4 + i * 2),telemetry_element_table[prefered_telemetry_table[i]].telemetry_element_id,true);

         input = new Uint8Array(packet);
        console.log(`TOC_CREATE_BLOCK creating packet... packet: ${input}`);

      }



      Crazyradio.sendPacket(packet).then(result => {

        console.log(`TOC_CREATE_BLOCK incoming data: ${result.data}`);


        if (result.state === true) {

            packet = new ArrayBuffer(1);
            dv  = new DataView(packet);
            dv.setUint8(0,0xff,true);


            return   Crazyradio.sendPacket(packet);

        }else{



        }

    }).then(result => {

        console.log(`TOC_CREATE_BLOCK incoming data: ${result.data}`);

      if (result.state === true) {

          packet = new ArrayBuffer(1);
          dv  = new DataView(packet);
          dv.setUint8(0,0xf3,true);


          return  Crazyradio.sendPacket(packet);

      }else{



      }


    }).then(result => {

        console.log(`TOC_CREATE_BLOCK incoming data: ${result.data}`);

      if (result.state === true) {





          resolve(result.data);




      }else{



      }



    }).catch(error => {




    });



  });

  }

  TOC_START_BLOCK(block_id){


    console.log(`TOC_START_BLOCK`);

    return new Promise((resolve,reject)=>{



      var  packet = new ArrayBuffer(4);

      var  dv  = new DataView(packet);
      dv.setUint8(0,0x51,true);
      dv.setUint8(1,0x03,true);
      dv.setUint8(2,block_id,true);
      dv.setUint8(3,Number(20),true);




      Crazyradio.sendPacket(packet).then(result => {

        console.log(`TOC_START_BLOCK incoming data: ${result.data}`);


        if (result.state === true) {

            packet = new ArrayBuffer(1);
            dv  = new DataView(packet);
            dv.setUint8(0,0xff,true);


            return   Crazyradio.sendPacket(packet);

        }else{

              return   Crazyradio.sendPacket(packet);

        }

    }).then(result => {

        console.log(`TOC_START_BLOCK incoming data: ${result.data}`);

      if (result.state === true) {

          packet = new ArrayBuffer(1);
          dv  = new DataView(packet);
          dv.setUint8(0,0xf3,true);


          return  Crazyradio.sendPacket(packet);

      }else{

            return   Crazyradio.sendPacket(packet);

      }


    }).then(result => {

        console.log(`TOC_START_BLOCK incoming data: ${result.data}`);

      if (result.state === true) {





          resolve(result.data);




      }else{



      }



    }).catch(error => {




    });



  });


  }

  PROCESS_TELEMETRY_DATA(data){

      console.log(`PROCESS_TELEMETRY_DATA`);


      /*
          this.telemetryData[0] - x,y,z

          this.telemetryData[1]  - yaw,vbat

      */



    this.telemetryDataRaw[data[1]] = data;

    var buffer;
    var view;

   //
   //  buffer = this.telemetryDataRaw[1].slice(5,9).buffer
   //
   //  view = new DataView(buffer);
   //
   // this.telemetryData.yaw = view.getFloat32(0);
   //
   // console.log(`Quadcopter telemetry  data yaw: ${this.telemetryData.yaw} `);
   //
   //
   //
   //
   //
   //
   //

    buffer = this.telemetryDataRaw[1].slice(5,9).buffer

    view = new DataView(buffer);

   this.telemetryData.vbat = view.getFloat32(0,true);

   console.log(`Quadcopter telemetry  data vbat: ${this.telemetryData.vbat} `);




   buffer = this.telemetryDataRaw[0].slice(5,9).buffer

   view = new DataView(buffer);

  this.telemetryData.x = view.getFloat32(0,true);

 console.log(`Quadcopter telemetry  data x: ${this.telemetryData.x} `);


   buffer = this.telemetryDataRaw[0].slice(9,13).buffer

   view = new DataView(buffer);

  this.telemetryData.y = view.getFloat32(0,true);

 console.log(`Quadcopter telemetry  data y: ${this.telemetryData.y} `);


   buffer = this.telemetryDataRaw[0].slice(13).buffer

   view = new DataView(buffer);

  this.telemetryData.z = view.getFloat32(0,true);

 console.log(`Quadcopter telemetry  data z: ${this.telemetryData.z} `);


  }

  GET_TELEMETRY_DATA(){

    console.log(`GET_TELEMETRY_DATA`);

    this.radioState = "connected";
    this.searching_in_progress = false;

    this.getDataInterval =  setInterval(()=>{


      var  packet = new ArrayBuffer(1);
      var  dv  = new DataView(packet);
      dv.setUint8(0,0xff,true);


      Crazyradio.sendPacket(packet).then(result => {




          if (result.state === true) {

                if ( ([0x50,0x54,0x56,0x5C,0x52].indexOf(result.data[0]) != -1 ) ){

                      console.log(`Quadcopter get data: ${result.data} `);



                        this.PROCESS_TELEMETRY_DATA(result.data);


                }


          }else{



          }

      }).catch(error => {



      });



    },50);


    // setTimeout(()=>{
    //
    //    clearInterval(this.getDataInterval);
    //
    // },5000);

  }

  TOC_BLOCK_STEP(telemetry_element_table,prefered_telemetry_table,block_id){

    console.log(`TOC_BLOCK_STEP`);

    return new Promise((resolve,reject)=>{


      this.runningStep = "TOC_BLOCK_STEP_1_START_BLOCK";
      this.TOC_CREATE_BLOCK(telemetry_element_table,prefered_telemetry_table,block_id).then(data => {

          if (data[3] == 0){

                console.log("Quadcopter TOC_CREATE_BLOCK step was sucessfully passed");

                this.runningStep = "TOC_BLOCK_STEP_2";
                this.TOC_START_BLOCK(data[2]).then(data => {



                    resolve(data);

                }).catch(error => {



                });

          }


      }).catch(error => {



      });

    });




  }

  getStringFromTypedArray(arr){

      var str = '';


       var i = 0;

       for (var i = 0; i < arr.length; i++) {

          str = str + String.fromCharCode(arr[i]);

       }


        return str;




  }

  startDataRecieving(){


        this.cleanQuadcopterInitData().then(result => {

            console.log(result);

            return this.TOC_GET_INFO();


        }).then(toc_log_len => {

              console.log("Quadcopter TOC Len Recieve step was sucessfully passed");


              let get_item_functions_arr = [];
              var toc_item_index = 0;
              var toc_item_recieved_answers = 0;
              var toc_item_sent_queries = 0;
              var telemetry_element_table = [];
              var prefered_telemetry_table = [];
              var   telemetry_element_name;
              var   telemetry_element_group;
          //    for (i=0;i<toc_log_len;i++){


              this.runningStep = "TOC_GET_ITEM";
              var  TOC_GET_ITEM_INTERVAL =    setInterval(() => {

                    toc_item_sent_queries++;
                    this.TOC_GET_ITEM(toc_item_index).then(data => {

                        console.log(`TOC_GET_ITEM  data resolver`);

                          console.log(`TOC_GET_DATA running step: ${this.runningStep}`);

                          if (this.runningStep == "TOC_BLOCK_STEP_1_START_BLOCK"){

                            this.TOC_START_BLOCK(data[2]).then(data => {


                              var prefered_telemetry_table2 = prefered_telemetry_table.slice(3,prefered_telemetry_table.length);
                              console.log(`prefered_telemetry_table2  ${prefered_telemetry_table2}`);

                              return this.TOC_BLOCK_STEP(telemetry_element_table, prefered_telemetry_table2,1)


                            }).then(data => {

                              if (data[3] == 0){

                                    this.runningStep = "GET_TELEMETRY_DATA";
                                    this.GET_TELEMETRY_DATA();
                              }

                            }).catch(error => {



                            });


                          } else  if ( ([0x50,0x54,0x56,0x5C].indexOf(data[0]) != -1 ) ){ //проверяем, является ли ответ нужным нам.

                              console.log(`TOC_GET_ITEM  correct answer`);

                            data = data.slice(2);

                            while (data[0] == 0){

                              data = data.slice(1);
                            }

                            telemetry_element_name  =  this.getStringFromTypedArray(data.slice(data.indexOf(0) + 1, data.length - 1));
                            telemetry_element_group =  this.getStringFromTypedArray(data.slice(2,data.indexOf(0)));

                              console.log(`TOC_GET_ITEM  telemetry_element_name ${telemetry_element_name}`);

                            telemetry_element_table[data[0]] = {

                                telemetry_element_type: data[1],
                                telemetry_element_group_and_name: this.getStringFromTypedArray(data.slice(2)),
                                telemetry_element_group:  this.getStringFromTypedArray(data.slice(2,data.indexOf(0))),
                                telemetry_element_name:   this.getStringFromTypedArray(data.slice(data.indexOf(0) + 1, data.length - 1)),
                                telemetry_element_id:      data[0]

                          }

                          //"vbat","x","y","z","yaw",   "stateEstimate" "controller",   "roll","pitch","yaw"   "stabilizer"

                          if ( (["vbat","x","y","z"].indexOf(telemetry_element_name) != -1) && (["stateEstimate","pm"].indexOf(telemetry_element_group) != -1) ){


                              prefered_telemetry_table.push(data[0]);

                              console.log(`TOC_GET_ITEM adding element to  prefered_telemetry_table  ${telemetry_element_name} ${prefered_telemetry_table}`);

                          }

                        console.log(`telemetry_element id: ${data[0]}  type: ${telemetry_element_table[data[0]].telemetry_element_type} group:  ${telemetry_element_table[data[0]].telemetry_element_group} name:  ${telemetry_element_table[data[0]].telemetry_element_name} `);


                              toc_item_index++;
                              toc_item_recieved_answers++;

                              if ((toc_item_index == toc_log_len) /* && (toc_item_recieved_answers== toc_item_sent_queries)*/){
                                    clearInterval(TOC_GET_ITEM_INTERVAL);

                                    var prefered_telemetry_table1 = prefered_telemetry_table.slice(0,3);

                                    console.log(`prefered_telemetry_table1  ${prefered_telemetry_table1}`);


                                    this.runningStep = "TOC_BLOCK_STEP_1";
                                    this.TOC_BLOCK_STEP(telemetry_element_table, prefered_telemetry_table1, 0).then(data => {

                                         if (data[3] == 0){

                                             var prefered_telemetry_table2 = prefered_telemetry_table.slice(3,prefered_telemetry_table.length);
                                               console.log(`prefered_telemetry_table2  ${prefered_telemetry_table2}`);

                                            return this.TOC_BLOCK_STEP(telemetry_element_table, prefered_telemetry_table2,1);
                                         }

                                    }).then(data => {

                                      if (data[3] == 0){

                                            this.runningStep = "GET_TELEMETRY_DATA";
                                            this.GET_TELEMETRY_DATA();
                                      }

                                    }).catch(error => {



                                    })



                              }else{

                              //      clearInterval(TOC_GET_ITEM_INTERVAL);

                              }





                          }






                    }).catch(error => {



                    });



                  },100);



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

    switch (coord) {

      case "X":

      let x_coord = 0;

      if (typeof(this.telemetryData) != 'undefined'){

        if (typeof(this.telemetryData.x) != 'undefined'){

            x_coord = this.telemetryData.x.toFixed(7);

        }

      }

        return x_coord;

        break;

      case "Y":

      let y_coord = 0;

      if (typeof(this.telemetryData) != 'undefined'){

        if (typeof(this.telemetryData.y) != 'undefined'){

            y_coord = this.telemetryData.y.toFixed(7);

        }

      }

      return y_coord;

          break;

      case "Z":

      let z_coord = 0;

      if (typeof(this.telemetryData) != 'undefined'){

        if (typeof(this.telemetryData.z) != 'undefined'){

            z_coord = this.telemetryData.z.toFixed(7);

        }

      }

      return z_coord;

            break;

      default:

      return 0;

    }


  }

  get_battery_level(){

  //  console.log(`Quadcopter get_battery_level()`);


    let bat_level = 0;

    if (typeof(this.telemetryData) != 'undefined'){

      if (typeof(this.telemetryData.vbat) != 'undefined'){

          bat_level = this.telemetryData.vbat.toFixed(7);

      }

    }
        return bat_level;
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

    clearInterval(this.getDataInterval);

  //  setTimeout(()=>{

      this.move_with_speed_interval  =   setInterval(function(self){


          var  packet = new ArrayBuffer(18);
          var  dv  = new DataView(packet);

        dv.setUint8(0,0x7C,true);
        dv.setUint8(1,0x05,true);

        dv.setFloat32(2,self.x_speed,true);
        dv.setFloat32(6,self.y_speed,true);
        dv.setFloat32(10,self.rotation,true);
        dv.setFloat32(14,self.z_distance,true);



        Crazyradio.sendPacket(packet).then(result => {




            if (result.state === true) {

                  if ( ([0x50,0x54,0x56,0x5C,0x52].indexOf(result.data[0]) != -1 ) ){

                        console.log(`Quadcopter get data: ${result.data} `);



                          this.PROCESS_TELEMETRY_DATA(result.data);


                  }


            }else{



            }

        }).catch(error => {



        });

      },30,this);


  //  },1000)







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
