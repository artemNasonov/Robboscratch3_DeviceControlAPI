/* @flow */


import Robboscratch3_DeviceControlAPI from './Robboscratch3_DeviceControlAPI';
//import RobotSensorsData from './RobotSensorsData';


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

export default class RobotConrolAPI extends Robboscratch3_DeviceControlAPI {

  RobotSensorsDataRecievingState:SensorsDataRecievingState;

  SensorsData:RobotSensorsData;

    constructor(){

      super();

      this.RobotSensorsDataRecievingState = SensorsDataRecievingStates.STOPED;

      this.startDataRecievingLoop();


    }


  setRobotPower(leftMotorPower:number,rightMotorPower:number):void{



  }


  getSensorsData():RobotSensorsData{

      return this.SensorsData;

  }

  getSensorData(){



  }


  runDataRecieveCommand(device:RobotDevice){

if(device.getDeviceID() == 0 && device.getState() == DEVICE_STATES["DEVICE_IS_READY"]){

    device.command(DEVICES[0].commands.check, [], function(response){


          this.SensorsData = response;


       });

    }
  }

  startDataRecievingLoop(device:RobotDevice):void{

    if (this.RobotSensorsDataRecievingState == SensorsDataRecievingStates.STOPED ){

          this.RobotSensorsDataRecievingState == SensorsDataRecievingStates.STARTED;


          setInterval(this.runDataRecieveCommand.bind(this,device),100);



    }



  }



}
