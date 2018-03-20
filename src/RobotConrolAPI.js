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

    constructor(){



      super();

      this.RobotSensorsDataRecievingState = SensorsDataRecievingStates.STOPED;
      this.ConnectedDevices = [];

     searchDevices();

    var handleConnectedDevicesInterval  =  setInterval(


        function (self){

            self.ConnectedDevices = getConnectedDevices();
            // let cd = this.ConnectedDevices;
            // let s = this;
          //  setInterval(handleConnectedDevices, 200, self.ConnectedDevices,self);

          handleConnectedDevices(self.ConnectedDevices,self);

        }


        ,100,this);

        setTimeout(function(){


            console.log("Stop devices handle process.")
            clearInterval(handleConnectedDevicesInterval)



        }  ,DEVICE_HANDLE_TIMEOUT);


        var handleConnectedDevices = function (Devices,self:RobotConrolAPI){


          console.log("Handle connected devices.")

        if ((typeof(Devices)!== 'undefined'))  {

          if ((Devices.length != 0) ){

              Devices.forEach(

                  function (item:InterfaceDevice){

                      self.startDataRecievingLoop(item);


                  }



              );


         }
      //    else{
      //
      //         setTimeout(handleConnectedDevices, 200,self.ConnectedDevices,self);
      //
      //   }
      //
      // }else{
      //
      //         console.log("devices: " + typeof(Devices));
      //
      //         setTimeout(handleConnectedDevices, 200,self.ConnectedDevices,self);
      //
      // }

        }

      }

}

    // searchRobotDevices(){
    //
    //      chrome.serial.getDevices(callback);
    //
    // }


  setRobotPower(leftMotorPower:number,rightMotorPower:number):void{



  }


  getSensorsData():RobotSensorsData{

      return this.SensorsData;

  }

  getSensorData(){



  }


  runDataRecieveCommand(device:InterfaceDevice){

    console.log("runDataRecieveCommand");

  device.command(DEVICES[0].commands.check, [], function(response){


          this.SensorsData = response;

          console.log("response: " + this.SensorsData.a0);


       });


  }

  startDataRecievingLoop(device:InterfaceDevice):void{


      if(device.getDeviceID() == 0 && device.getState() == DEVICE_STATES["DEVICE_IS_READY"]){

        console.log(" Robot ID:  " + device.getDeviceID());


              if (this.RobotSensorsDataRecievingState == SensorsDataRecievingStates.STOPED ){

                  this.RobotSensorsDataRecievingState == SensorsDataRecievingStates.STARTED;

                  setInterval(this.runDataRecieveCommand.bind(this,device),100);

                }else{

          console.log("ID: " + device.getDeviceID()  + " " + "State:  " + device.getState() );

      }

      //    setInterval(this.runDataRecieveCommand.bind(this,device),100);







  }



}

}
