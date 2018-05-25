/* @flow */


import DeviceControlAPI from './DeviceControlAPI';
//import RobotSensorsData from './RobotSensorsData';
import {InterfaceDevice,searchDevices,getConnectedDevices,pushConnectedDevices,DEVICES,DEVICE_STATES} from './chrome';


const DEVICE_HANDLE_TIMEOUT:number = 1 * 60 * 1000;

type RobotSensorsData = {

                       encoder0 :  number,
                       encoder1 : number,
                       path0    : number,
                       path1    : number,
                       a0       : [number,number,number,number],
                       a1       : [number,number,number,number],
                       a2       : [number,number,number,number],
                       a3       : [number,number,number,number],
                       a4       : [number,number,number,number],
                       button   : number

};


 type ColorFilterTableRaw = {

     R:string,
     G:string,
     B:string,
     Bright:string

 }


const SensorsDataRecievingStates = {

    STARTED:"STARTED",
    STOPED: "STOPED"

};

type SensorsDataRecievingState = $Keys<typeof SensorsDataRecievingStates>;



export default class RobotControlAPI extends DeviceControlAPI {

  RobotSensorsDataRecievingState:SensorsDataRecievingState;

  SensorsData:RobotSensorsData;

  ConnectedDevices: Array<InterfaceDevice>;
  ConnectedRobots: Array<InterfaceDevice>;

  handleConnectedDevicesInterval:IntervalID;
  DataRecievingLoopInterval:IntervalID;
  automaticDeviceHandleProcessStopTimeout:any;

  ConnectedRobotsSerials:Array<string>;

  sensors_array:Array<number>;

  led_positions:Array<number>;

  led_states:Array<string>;

  led_bit_mask:number;



    constructor(){



      super();


      this.init_all();

      this.searching_in_progress = false;
      this.previousState = null;

      this.stopSearchProcess();
      this.stopDataRecievingProcess();



}

     //Автопереподключение при потере связи с устройсвом
      auto_reconnect(){

        console.log(`auto reconnect`);

          //  this.autoReconnectInterval = setInterval(function(){

              let devices = [];
              let connectedDevices = [];
              var local_self = this;


              var onGetDevices = function(ports) {

                var self = local_self;

                for (var i=0; i<ports.length; i++) {
                  console.log(ports[i].path);
                   devices.push(ports[i]);
                }

                  connectedDevices = getConnectedDevices();

                  devices.forEach(function(device,device_index){

                    if (device_index <= (connectedDevices.length - 1) ){


                      /*
                          При переподключении пробуем найти  свой старый порт и подключиться к нему.

                      */


                        //Проверяем, что имена уже сохранённого порта и просматриваемого порта совпадают  //Проверяем, что имеем дело с роботом.
                      if ( (device.path == connectedDevices[device_index].getPortName()) &&  (connectedDevices[device_index].getDeviceID() == 0) ){


                            console.log(`Trying to reconnect to the already known port: ${device.path}`);
                          //  let d =  new InterfaceDevice(device);
                            connectedDevices[device_index].try_to_reconnect();
                            self.searchRobotDevices();
                            self.searching_in_progress = true;

                      } else self.searching_in_progress = false;

                    }



                  });

                  /*
                          Если устройство перехало на новый порт, то пробуем подключиться к новому порту.
                          Определяем, что устройство переехало пуём сравнения длины массива уже подключённых устройств и вновь полученного массива устройств.

                  */

                  if (devices.length > connectedDevices.length){

                          console.log(`Device maybe moved to the new port: ${devices[connectedDevices.length].path} Trying to reconnect.`);
                        let d = new InterfaceDevice(devices[connectedDevices.length]); // TODO: Не совсем корректно : connectedDevices.length. Нужно по-другому
                        pushConnectedDevices(d);
                        this.searchRobotDevices();
                        this.searching_in_progress = true;

                  } else this.searching_in_progress = false;


              }

            chrome.serial.getDevices(onGetDevices);



          //  },300);

      }


  init_all(){


    this.RobotSensorsDataRecievingState = SensorsDataRecievingStates.STOPED;
    this.ConnectedDevices = [];
    this.ConnectedRobots = [];
    this.ConnectedRobotsSerials = [];
    this.sensors_array = [0,0,0,0,0];
    this.led_positions = [1,2,4,8,16];
    this.led_states = ['off','off','off','off','off'];
    this.led_bit_mask = 0;

    this.colorFilterTable = [{},{},{},{},{}];

    this.dataRecieveTime = 0;

  let i = 0;

  for (i=0;i<5;i++){

      this.colorFilterTable[i] = {

           "red": {
            "R": "20-30",
            "G": "20-30",
            "B": "20-30",
            "Bright": "20-30"
           },
           "magenta": {
            "R": "20-30",
            "G": "20-30",
            "B": "20-30",
            "Bright": "20-30"
           },
           "yellow": {
            "R": "20-30",
            "G": "20-30",
            "B": "20-30",
            "Bright": "20-30"
           },
           "green": {
            "R": "20-30",
            "G": "20-30",
            "B": "20-30",
            "Bright": "20-30"
           },
           "blue": {
            "R": "20-30",
            "G": "20-30",
            "B": "20-30",
            "Bright": "20-30"
           },
           "cyan": {
            "R": "20-30",
            "G": "20-30",
            "B": "20-30",
            "Bright": "20-30"
           },
           "custom": {
            "R": "20-30",
            "G": "20-30",
            "B": "20-30",
            "Bright": "20-30"
           },
           "black": {
            "R": "20-30",
            "G": "20-30",
            "B": "20-30",
            "Bright": "20-30"
           },
           "gray": {
            "R": "20-30",
            "G": "20-30",
            "B": "20-30",
            "Bright": "20-30"
           },
           "white": {
            "R": "20-30",
            "G": "20-30",
            "B": "20-30",
            "Bright": "20-30"
           }
};

  }


    this.color_P_initial = 0;

    this.path_left_buffer = 0;
    this.path_right_buffer = 0;

    this.leftPath     = 0;
    this.leftPathNew  = 0;
    this.leftPathCorrected = 0;
    this.leftPathMultiplier = 0;
    this.leftPathCorrection = 0;

    this.rightPath    = 0;
    this.rightPathNew = 0;
    this.rightPathCorrected = 0;
    this.rightPathMultiplier = 0;
    this.rightPathCorrection = 0;

    this.colorKoefs = [];





    let j = 0;


    for (j=0;j<5;j++){

        this.colorKoefs[j] = {

              Kr:1,
              Kg:1,
              Kb:1

        }

    }

  }

    searchRobotDevices(){


      this.init_all();

      this.searching_in_progress = true;


  //    searchDevices();

     this.handleConnectedDevicesInterval  =  setInterval(


         function (self){

      //     console.log("let's get devices from device finder");
            let devices:Array<InterfaceDevice> = getConnectedDevices();

            // if (self.ConnectedDevices.length != devices.length ){
            //
                       self.ConnectedDevices = devices;


                    handleConnectedDevices(self.ConnectedDevices,self);


           //  }
         }


         ,100,this);

       this.automaticDeviceHandleProcessStopTimeout =  setTimeout(function(self){


             console.log("Stop devices handle process.");
             clearInterval(self.handleConnectedDevicesInterval);
             self.searching_in_progress = false;



         }  ,DEVICE_HANDLE_TIMEOUT,this);





         var handleConnectedDevices = function (Devices,self:RobotControlAPI){


      //     console.log("Handle connected devices.")

         if ((typeof(Devices)!== 'undefined'))  {

           if ((Devices.length != 0) ){

               Devices.forEach(

                   function (device:InterfaceDevice){


                     if((device.getDeviceID() == 0 ) && (device.getState() == DEVICE_STATES["DEVICE_IS_READY"])){


                       if (self.ConnectedRobotsSerials.indexOf(device.getSerialNumber()) == -1 ){

                         console.log("We have new ready robot!!!");

                      //   self.searching_in_progress = false;

                         console.log("Robot serial: " + device.getSerialNumber());

                         self.startDataRecievingLoop(device);
                         self.ConnectedRobots.push(device);
                         self.ConnectedRobotsSerials.push(device.getSerialNumber());

                       }



                     }else{

                  //   console.log("Device ID: " + device.getDeviceID()  + " " + "State:  " + device.getState() + " " + "State name: " + self.getStateNameByID(device.getState())
                  //                 + " " + "Device serial: " + device.getSerialNumber() );

                     }



                   }



               );




          }else{

             console.log("Devices array is empty");

          }


         }

       }



    }


    isRobotConnected(robot_number:number):boolean{

        let is_connected = false;

        if ((Date.now() - this.dataRecieveTime) > (1000 * 5)){

           this.SensorsData = undefined;
        }

        //  return ((this.ConnectedRobots.length-1)>=robot_number)?true:false;

        if ((this.ConnectedRobots.length-1)>=robot_number){


            is_connected =   ( (this.ConnectedRobots[robot_number].getState() == DEVICE_STATES["DEVICE_IS_READY"]) && ( typeof(this.SensorsData) != 'undefined' ) && (this.SensorsData != null) )

        }else{

              is_connected =  false;

        }

        if ((this.previousState == true) && (this.previousState != is_connected) && (!this.searching_in_progress)){

              this.auto_reconnect();

        }else{

              this.previousState  = is_connected;

        }



        return is_connected;

    }


    isRobotSearching():boolean{

          return   this.searching_in_progress;
    }


    getStateNameByID(id:number):string{

        const DEVICE_STATE_NANES: [string,string,string,string,string,string,string,string,string] = ["INITED","OPENED","CONNECTED","TEST_DATA_SENT","RUBBISH","SERIAL_FOUND","PURGING","DEVICE_IS_READY","DEVICE_ERROR"];


        if (id < DEVICE_STATE_NANES.length ){

            return DEVICE_STATE_NANES[id];

        }else{

              return "";
        }


    }


    stopSearchProcess(){

      console.log("stopSearchProcess");

        clearInterval(this.handleConnectedDevicesInterval);
        clearTimeout(this.automaticDeviceHandleProcessStopTimeout);
        this.searching_in_progress = false;

        if ( typeof (this.ConnectedDevices) != 'undefined'){

              this.ConnectedDevices.forEach(function(device:InterfaceDevice){

                    device.stopCheckingSerialNumber();

              });

        }






    }


    stopDataRecievingProcess(){

      console.log("stopDataRecievingProcess");

      if ( typeof (this.DataRecievingLoopInterval) !== 'undefined' ){

          clearInterval(this.DataRecievingLoopInterval);

      }


    }

    colorAutoCorection(sensor_id:number){

    if ( typeof(this.SensorsData) != 'undefined' ){

      let rgb_array = this.SensorsData[`a${sensor_id}`];

      let red    = rgb_array[1];
      let green  = rgb_array[2];
      let blue   = rgb_array[3];

      let rgb_sum =  red + green + blue;



      let Kr = 0; //koef for red channel
      let Kg = 0; //koef for green channel
      let Kb = 0; //koef for blue channel


      Kr = rgb_sum / (3 * red);
      Kg = rgb_sum / (3 * green);
      Kb = rgb_sum / (3 * blue);

      console.log(`colorAutoCorection: sensor_id: ${sensor_id} Kr: ${Kr} Kg: ${Kg} Kb: ${Kb}`);

      this.colorKoefs[sensor_id].Kr = Kr;
      this.colorKoefs[sensor_id].Kg = Kg;
      this.colorKoefs[sensor_id].Kb = Kb;

      this.color_P_initial  = red * Kr + green * Kg + blue * Kb;


    }



    }

    setColorKoefs(sensor_id:number,red_koef:number, green_koef:number, blue_koef:number){

      console.log(`setColorKoefs: sensor_id: ${sensor_id} red_koef: ${red_koef} green_koef: ${green_koef} blue_koef: ${blue_koef}`);

        this.colorKoefs[sensor_id].Kr   =  red_koef / 100;
        this.colorKoefs[sensor_id].Kg   =  green_koef / 100;
        this.colorKoefs[sensor_id].Kb    =  blue_koef / 100;


    }

    getColorKoefs(sensor_id:number,koef_name:string){

      switch (koef_name) {

        case "red":

            return this.colorKoefs[sensor_id].Kr.toFixed(2) * 100;

        //  break;

        case "green":

          return this.colorKoefs[sensor_id].Kg.toFixed(2) * 100;

        //  break;

        case "blue":

            return this.colorKoefs[sensor_id].Kb.toFixed(2) * 100;

        //  break;

        default:

            return 0;

      }



    }


    getColorCorrectedRawValues(sensor_id:number){

      let rgb_arr = [0,0,0];

      if ( typeof(this.SensorsData) != 'undefined' ){

        rgb_arr[0] = this.SensorsData[`a${sensor_id}`][1] *  this.colorKoefs[sensor_id].Kr; //red
        rgb_arr[1] = this.SensorsData[`a${sensor_id}`][2] *  this.colorKoefs[sensor_id].Kg; //green
        rgb_arr[2] = this.SensorsData[`a${sensor_id}`][3] *  this.colorKoefs[sensor_id].Kb; //blue



        return rgb_arr;

      } else return rgb_arr;



    }



    setColorFilterTable(sensor_id:number, colorFilterTable:any ){

            this.colorFilterTable[sensor_id] = colorFilterTable;

    }

    getColorFilterTable(sensor_id:number){


            return this.colorFilterTable[sensor_id];
    }



    colorFilter(sensor_id:number){

      const getColorFilterTableValue = function(value:string,type:string){

            let arr = value.split("-");

            if (type == "high"){

              return Number(arr[1]);

            }else return Number(arr[0]);

      }

      let red_channel      =  this.SensorsData[`a${sensor_id}`][1] *  this.colorKoefs[sensor_id].Kr;
      let green_channel    =  this.SensorsData[`a${sensor_id}`][2] *  this.colorKoefs[sensor_id].Kg;
      let blue_channel     =  this.SensorsData[`a${sensor_id}`][3] *  this.colorKoefs[sensor_id].Kb;

      let sum = red_channel + green_channel + blue_channel;

      let red_channel_percent       = red_channel     / sum * 100;
      let green_channel_percent     = green_channel  / sum  * 100;
      let blue_channel_percent      = blue_channel  /  sum  * 100;


      if (sum > this.color_P_initial){

          this.color_P_initial = sum;
      }




        const colors_arr = {

              "red":[255,0,0],
              "magenta":[255,0,255],
              "yellow":[255,255,0],
              "green":[0,255,0],
              "blue":[0,0,255],
              "cyan":[0,255,255],
              "black":[0,0,0],
              "gray":[128,128,128],
              "white":[255,255,255]
        }


        for (var color in colors_arr) {

          if (colors_arr.hasOwnProperty(color)) {


                  let table_object = this.colorFilterTable[sensor_id];

                  let red     =  Math.floor(red_channel_percent * 1000);
                  let green   =  Math.floor(green_channel_percent * 1000);
                  let blue    =  Math.floor(blue_channel_percent * 1000);
                  let bright  =  Math.floor(sum / this.color_P_initial * 100 * 1000);

                  let red_low   =   Math.floor(getColorFilterTableValue(this.colorFilterTable[sensor_id][color].R,"low") * 1000);
                  let red_high  =   Math.floor(getColorFilterTableValue(this.colorFilterTable[sensor_id][color].R,"high") * 1000);

                  let green_low  =   Math.floor(getColorFilterTableValue(this.colorFilterTable[sensor_id][color].G,"low") * 1000);
                  let green_high =   Math.floor(getColorFilterTableValue(this.colorFilterTable[sensor_id][color].G,"high") * 1000);

                  let blue_low   =   Math.floor(getColorFilterTableValue(this.colorFilterTable[sensor_id][color].B,"low") * 1000);
                  let blue_high  =   Math.floor(getColorFilterTableValue(this.colorFilterTable[sensor_id][color].B,"high") * 1000);

                  let bright_low   =   Math.floor(getColorFilterTableValue(this.colorFilterTable[sensor_id][color].Bright,"low") * 1000);
                  let bright_high  =   Math.floor(getColorFilterTableValue(this.colorFilterTable[sensor_id][color].Bright,"high") * 1000);


                  if ( (red > red_low) && (red < red_high) && (green > green_low)  && (green < green_high)  && (blue > blue_low) && (blue < blue_high) && (bright > bright_low)  && (bright < bright_high)){

                        return colors_arr[color];

                  }else return [-1,-1,-1];

          }

        }



    }

  setRobotPower(leftMotorPower:number,rightMotorPower:number,robot_number:number):void{


 console.log(`setRobotPower leftMotorPower: ${leftMotorPower} rightMotorPower: ${rightMotorPower} `);

 if ((this.ConnectedRobots.length - 1) >= robot_number ){


   if(this.ConnectedRobots[0].getDeviceID() == 0 && this.ConnectedRobots[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

     console.log("setRobotPower send command");

     this.ConnectedDevices[0].command(DEVICES[0].commands.power, [leftMotorPower, rightMotorPower], (response) => {

                //   console.log("pizda=" + response.a0);

                  this.SensorsData = response;

                });

     }


 }



}

  setRobotPowerAndStepLimits(leftMotorPower:number,rightMotorPower:number,steps_limit:number,robot_number:number):void{

      console.log(`setRobotPowerAndStepLimits leftMotorPower: ${leftMotorPower} rightMotorPower: ${rightMotorPower} steps_limit: ${steps_limit} `);

      if ((this.ConnectedRobots.length - 1) >= robot_number ){


        if(this.ConnectedRobots[0].getDeviceID() == 0 && this.ConnectedRobots[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

          console.log("setRobotPowerAndStepLimits send command");

          let steps_limit_low_byte:number  = steps_limit&0x00FF;
          let steps_limit_high_byte:number = steps_limit >> 8;


          this.ConnectedDevices[0].command(DEVICES[0].commands.rob_pow_encoder, [leftMotorPower, rightMotorPower,steps_limit_high_byte,steps_limit_low_byte], (response) =>{

                     //   console.log("pizda=" + response.a0);

                       this.SensorsData = response;

                     });

          }


      }

  }

 turnLedOn(led_position:number,robot_number:number){

   if ((this.ConnectedRobots.length - 1) >= robot_number ){


     if(this.ConnectedRobots[0].getDeviceID() == 0 && this.ConnectedRobots[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

       console.log(`turnLedOn led_position: ${led_position}`);


    if (this.led_states[led_position] == 'off') {



          this.led_bit_mask+=this.led_positions[led_position];

          console.log(`led_bit_mask: ${this.led_bit_mask}`);

          this.led_states[led_position] = 'on';

          this.ConnectedDevices[0].command(DEVICES[0].commands.rob_lamps, [this.led_bit_mask], function(response){



                     });

    }



      }

   }


 }


turnLedOff(led_position:number,robot_number:number){

  if ((this.ConnectedRobots.length - 1) >= robot_number ){


    if(this.ConnectedRobots[0].getDeviceID() == 0 && this.ConnectedRobots[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

      console.log(`turnLedOff led_position: ${led_position}`);

    if (this.led_states[led_position] == 'on') {

      this.led_bit_mask-=this.led_positions[led_position];

      console.log(`led_bit_mask: ${this.led_bit_mask}`);

      this.led_states[led_position] = 'off';

      this.ConnectedDevices[0].command(DEVICES[0].commands.rob_lamps, [this.led_bit_mask], function(response){



                 });

    }



    }

  }


}

    setClawDegrees(degrees:number,robot_number:number){

      if ((this.ConnectedRobots.length - 1) >= robot_number ){


        if(this.ConnectedRobots[0].getDeviceID() == 0 && this.ConnectedRobots[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

          console.log(`setClawDegrees: ${degrees}`);

          this.ConnectedDevices[0].command(DEVICES[0].commands.rob_claw, [degrees], function(response){



                     });

        }

      }

    }

  getLeftPath():number{

    if ( typeof(this.SensorsData) != 'undefined' ){

        if (!isNaN(this.SensorsData.path0)){

          this.path_left_buffer = this.SensorsData.path0;

        //  return this.SensorsData.path0;

        }else{


        //  return this.path_left_buffer;

        }

        this.leftPathNew =   this.path_left_buffer;

        if (this.leftPathNew < this.leftPath){

              this.leftPathMultiplier++;
        }

        this.leftPath = this.leftPathNew;


      this.leftPathCorrected  = (65536 * this.leftPathMultiplier)  + this.leftPath - this.leftPathCorrection;

        return this.leftPathCorrected;

    }else return -1;

  }

  getRightPath():number{


    if ( typeof(this.SensorsData) != 'undefined' ){

        if (!isNaN(this.SensorsData.path0)){

          this.path_right_buffer = this.SensorsData.path1;

        //  return this.SensorsData.path0;

        }else{


        //  return this.path_left_buffer;

        }

        this.rightPathNew =   this.path_right_buffer;

        if (this.rightPathNew < this.rightPath){

              this.leftPathMultiplier++;
        }

        this.rightPath = this.rightPathNew;


      this.rightPathCorrected  = (65536 * this.rightPathMultiplier)  + this.rightPath - this.rightPathCorrection;

      return this.rightPathCorrected;

    }else return -1;

  }

  resetTripMeters(){

    this.leftPathCorrection  = (65536 * this.leftPathMultiplier)  + this.leftPath;
    this.rightPathCorrection = (65536 * this.rightPathMultiplier) + this.rightPath;

  }

  getButtonStartPushed():string{

    if ( typeof(this.SensorsData) != 'undefined' ){

      return ((this.SensorsData.button == 0)?"true":"false");

    }else return "undefined";


  }

  getSensorsData():RobotSensorsData{

      return this.SensorsData;

  }

  // getSensorData(sensor_index:number){
  //
  //     return this.SensorsData[`a${sensor_index}`];
  //
  // }

  getSensorData(sensor_index:number){

      switch (this.sensors_array[sensor_index]) {

        case 1: //line
        case 2: //led
        case 3: //light
        case 4://touch
        case 5://proximity

              return Math.round(this.SensorsData[`a${sensor_index}`][3] / 2.55);

        //  break;

        case 6: //proximity

              return (this.SensorsData[`a${sensor_index}`][2] * 256 + this.SensorsData[`a${sensor_index}`][3] );

        //break;

        default:

            return  -1;

      }

  }

  setRobotSensor(robot_number:number,sensor_id:number,sensor_name:string){




    if ((this.ConnectedRobots.length - 1) >= robot_number ){


      if(this.ConnectedRobots[robot_number].getDeviceID() == 0 && this.ConnectedRobots[robot_number].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

        console.log("setRobotSensor");

      switch (sensor_name) {
        case "nosensor":

        console.log("Sensor name: none");

          this.sensors_array[sensor_id] = 0;

        this.ConnectedRobots[robot_number].command(DEVICES[0].commands.sensors,  this.sensors_array, function(response){

                   });



          break;

        case "line":

        console.log("Sensor name: line");

          this.sensors_array[sensor_id] = 1;

        this.ConnectedRobots[robot_number].command(DEVICES[0].commands.sensors, this.sensors_array, function(response){

                   });

            break;

        case "led":

        console.log("Sensor name: led");

          this.sensors_array[sensor_id] = 2;

        this.ConnectedRobots[robot_number].command(DEVICES[0].commands.sensors, this.sensors_array, function(response){

                   });

          break;

        case "light":

        console.log("Sensor name: light");

        this.sensors_array[sensor_id] = 3;

        this.ConnectedRobots[robot_number].command(DEVICES[0].commands.sensors, this.sensors_array, function(response){

                   });

          break;

        case "touch":

        console.log("Sensor name: touch");

          this.sensors_array[sensor_id] = 4;

        this.ConnectedRobots[robot_number].command(DEVICES[0].commands.sensors, this.sensors_array, function(response){

                   });

            break;

        case "proximity":

        console.log("Sensor name: proximity");

          this.sensors_array[sensor_id] = 5;

        this.ConnectedRobots[robot_number].command(DEVICES[0].commands.sensors, this.sensors_array, function(response){

                   });

        break;

        case "ultrasonic":

        console.log("Sensor name: ultrasonic");

          this.sensors_array[sensor_id] = 6;

        this.ConnectedRobots[robot_number].command(DEVICES[0].commands.sensors, this.sensors_array, function(response){

                   });

        break;

        case "color":

        console.log("Sensor name: color");

          this.sensors_array[sensor_id] = 7;

        this.ConnectedRobots[robot_number].command(DEVICES[0].commands.sensors, this.sensors_array, function(response){

                   });

        break;

        default:



      }

    }

  }

  }


  runDataRecieveCommand(device:InterfaceDevice){

  if (device.getState() == DEVICE_STATES["DEVICE_IS_READY"]){



    console.log("runDataRecieveCommand");

  device.command(DEVICES[0].commands.check, [], (response) => {


          this.SensorsData = response;

            this.dataRecieveTime = Date.now();

            this.searching_in_progress = false;



        //  console.log("response: " + this.SensorsData.a0);


       });

  }




  }

  startDataRecievingLoop(robot:InterfaceDevice):void{


    //  if(device.getDeviceID() == 0 && device.getState() == DEVICE_STATES["DEVICE_IS_READY"]){

        console.log("startDataRecievingLoop");




              if (this.RobotSensorsDataRecievingState == SensorsDataRecievingStates.STOPED ){

                  this.RobotSensorsDataRecievingState == SensorsDataRecievingStates.STARTED;

                this.DataRecievingLoopInterval = setInterval(this.runDataRecieveCommand.bind(this,robot),25);

                }

      //    setInterval(this.runDataRecieveCommand.bind(this,device),100);







  //}



}

}
