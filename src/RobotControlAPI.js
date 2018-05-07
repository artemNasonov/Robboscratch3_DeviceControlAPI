/* @flow */


import DeviceControlAPI from './DeviceControlAPI';
//import RobotSensorsData from './RobotSensorsData';
import {InterfaceDevice,searchDevices,getConnectedDevices,DEVICES,DEVICE_STATES} from './chrome';


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

      this.RobotSensorsDataRecievingState = SensorsDataRecievingStates.STOPED;
      this.ConnectedDevices = [];
      this.ConnectedRobots = [];
      this.ConnectedRobotsSerials = [];
      this.sensors_array = [0,0,0,0,0];
      this.led_positions = [1,2,4,8,16];
      this.led_states = ['off','off','off','off','off'];
      this.led_bit_mask = 0;

      this.stopSearchProcess();
      this.stopDataRecievingProcess();



}

    searchRobotDevices(){


    this.ConnectedRobots = [];
    this.ConnectedRobotsSerials = [];


  //    searchDevices();

     this.handleConnectedDevicesInterval  =  setInterval(


         function (self){

           console.log("let's get devices from device finder");
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



         }  ,DEVICE_HANDLE_TIMEOUT,this);





         var handleConnectedDevices = function (Devices,self:RobotControlAPI){


           console.log("Handle connected devices.")

         if ((typeof(Devices)!== 'undefined'))  {

           if ((Devices.length != 0) ){

               Devices.forEach(

                   function (device:InterfaceDevice){


                     if(device.getDeviceID() == 0 && device.getState() == DEVICE_STATES["DEVICE_IS_READY"]){


                       if (self.ConnectedRobotsSerials.indexOf(device.getSerialNumber()) == -1 ){

                         console.log("We have new ready robot!!!");

                         console.log("Robot serial: " + device.getSerialNumber());

                         self.startDataRecievingLoop(device);
                         self.ConnectedRobots.push(device);
                         self.ConnectedRobotsSerials.push(device.getSerialNumber());

                       }



                     }else{

                     console.log("Device ID: " + device.getDeviceID()  + " " + "State:  " + device.getState() + " " + "State name: " + self.getStateNameByID(device.getState())
                                   + " " + "Device serial: " + device.getSerialNumber() );

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


        //  return ((this.ConnectedRobots.length-1)>=robot_number)?true:false;

        if ((this.ConnectedRobots.length-1)>=robot_number){


            return (this.ConnectedRobots[robot_number].getState() == DEVICE_STATES["DEVICE_IS_READY"])

        }else{

              return false;

        }



    }



    getStateNameByID(id:number):string{

        const DEVICE_STATE_NANES: [string,string,string,string,string,string,string,string] = ["INITED","OPENED","TEST_DATA_SENT","RUBBISH","SERIAL_FOUND","PURGING","DEVICE_IS_READY","DEVICE_ERROR"];


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

  setRobotPower(leftMotorPower:number,rightMotorPower:number,robot_number:number):void{


 console.log(`setRobotPower leftMotorPower: ${leftMotorPower} rightMotorPower: ${rightMotorPower} `);

 if ((this.ConnectedRobots.length - 1) >= robot_number ){


   if(this.ConnectedRobots[0].getDeviceID() == 0 && this.ConnectedRobots[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

     console.log("setRobotPower send command");

     this.ConnectedDevices[0].command(DEVICES[0].commands.power, [leftMotorPower, rightMotorPower], function(response){

                //   console.log("pizda=" + response.a0);

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


          this.ConnectedDevices[0].command(DEVICES[0].commands.rob_pow_encoder, [leftMotorPower, rightMotorPower,steps_limit_high_byte,steps_limit_low_byte], function(response){

                     //   console.log("pizda=" + response.a0);

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

        return this.SensorsData.path0;

    }else return -1;

  }

  getRightPath():number{


    if ( typeof(this.SensorsData) != 'undefined' ){

        return this.SensorsData.path1;

    }else return -1;

  }

  getButtonStartPushed():string{

    if ( typeof(this.SensorsData) != 'undefined' ){

      return ((this.SensorsData.button == 0)?"true":"false");

    }else return "undefined";


  }

  getSensorsData():RobotSensorsData{

      return this.SensorsData;

  }

  getSensorData(sensor_index:number){

      return this.SensorsData[`a${sensor_index}`];

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

    console.log("runDataRecieveCommand");

  device.command(DEVICES[0].commands.check, [], (response) => {


          this.SensorsData = response;

          console.log("response: " + this.SensorsData.a0);


       });


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
