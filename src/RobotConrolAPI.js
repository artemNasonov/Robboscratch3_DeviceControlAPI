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



export default class RobotConrolAPI extends DeviceControlAPI {

  RobotSensorsDataRecievingState:SensorsDataRecievingState;

  SensorsData:RobotSensorsData;

  ConnectedDevices: Array<InterfaceDevice>;
  ConnectedRobots: Array<InterfaceDevice>;

  handleConnectedDevicesInterval:IntervalID;
  DataRecievingLoopInterval:IntervalID;
  automaticDeviceHandleProcessStopTimeout:any;

  ConnectedRobotsSerials:Array<string>;

    constructor(){



      super();

      this.RobotSensorsDataRecievingState = SensorsDataRecievingStates.STOPED;
      this.ConnectedDevices = [];
      this.ConnectedRobots = [];
      this.ConnectedRobotsSerials = [];

      this.stopSearchProcess();
      this.stopDataRecievingProcess();



}

    searchRobotDevices(){


    this.ConnectedRobots = [];
    this.ConnectedRobotsSerials = [];


      searchDevices();

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





         var handleConnectedDevices = function (Devices,self:RobotConrolAPI){


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


          return ((this.ConnectedRobots.length-1)>=robot_number)?true:false;

    }



    getStateNameByID(id:number):string{

        const DEVICE_STATE_NANES: [string,string,string,string,string,string,string] = ["INITED","OPENED","TEST_DATA_SENT","RUBBISH","SERIAL_FOUND","PURGING","DEVICE_IS_READY"];


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


 console.log("setRobotPower");

 if ((this.ConnectedRobots.length - 1) >= robot_number ){


   if(this.ConnectedRobots[0].getDeviceID() == 0 && this.ConnectedRobots[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

     console.log("setRobotPower send command");

     this.ConnectedDevices[0].command(DEVICES[0].commands.power, [leftMotorPower, rightMotorPower], function(response){

                   console.log("pizda=" + response.a0);

                });

     }


 }



}


  getSensorsData():RobotSensorsData{

      return this.SensorsData;

  }

  getSensorData(){



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

                this.DataRecievingLoopInterval = setInterval(this.runDataRecieveCommand.bind(this,robot),300);

                }

      //    setInterval(this.runDataRecieveCommand.bind(this,device),100);







  //}



}

}
