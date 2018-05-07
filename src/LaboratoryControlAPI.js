/* @flow */


import DeviceControlAPI from './DeviceControlAPI';
//import RobotSensorsData from './RobotSensorsData';
import {InterfaceDevice,searchDevices,getConnectedDevices,DEVICES,DEVICE_STATES} from './chrome';



const DEVICE_HANDLE_TIMEOUT:number = 1 * 60 * 1000;

type LaboratorySensorsData = {

                       d8_13 :    [number],
                       a0       : [number,number],
                       a1       : [number,number],
                       a2       : [number,number],
                       a3       : [number,number],
                       a4       : [number,number],
                       a5       : [number,number],
                       a6       : [number,number],
                       a7       : [number,number]


};

const SensorsDataRecievingStates = {

    STARTED:"STARTED",
    STOPED: "STOPED"

};

type SensorsDataRecievingState = $Keys<typeof SensorsDataRecievingStates>;



export default class LaboratoryConrolAPI extends DeviceControlAPI {

  LaboratorySensorsDataRecievingState:SensorsDataRecievingState;

  SensorsData:LaboratorySensorsData;

  ConnectedDevices: Array<InterfaceDevice>;
  ConnectedLaboratories: Array<InterfaceDevice>;
  ConnectedLaboratoriesSerials:Array<string>;

  handleConnectedDevicesInterval:IntervalID;
  DataRecievingLoopInterval:IntervalID;
  automaticDeviceHandleProcessStopTimeout:any;

  constructor(){



    super();

    this.LaboratorySensorsDataRecievingState = SensorsDataRecievingStates.STOPED;
    this.ConnectedDevices = [];
    this.ConnectedLaboratories = [];
    this.ConnectedLaboratoriesSerials = [];


    this.stopSearchProcess();
    this.stopDataRecievingProcess();



}

searchLaboratoryDevices(){


this.ConnectedLaboratories = [];
this.ConnectedLaboratoriesSerials = [];


//  searchDevices();

 this.handleConnectedDevicesInterval  =  setInterval(


     function (self){

       console.log("Let's get devices from device finder");
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





     var handleConnectedDevices = function (Devices,self:LaboratoryConrolAPI){


       console.log("Handle connected devices.")

     if ((typeof(Devices)!== 'undefined'))  {

       if ((Devices.length != 0) ){

           Devices.forEach(

               function (device:InterfaceDevice){


                 if(device.getDeviceID() == 2 && device.getState() == DEVICE_STATES["DEVICE_IS_READY"]){


                   if (self.ConnectedRobotsSerials.indexOf(device.getSerialNumber()) == -1 ){

                     console.log("We have new ready laboratory!!!");

                     console.log("Laboratory serial: " + device.getSerialNumber());

                     self.startDataRecievingLoop(device);
                     self.ConnectedLaboratories.push(device);
                     self.ConnectedLaboratoriesSerials.push(device.getSerialNumber());

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


isLaboratoryConnected(laboratory_number:number):boolean{


    //  return ((this.ConnectedRobots.length-1)>=robot_number)?true:false;

    if ((this.ConnectedLaboratories.length-1)>=laboratory_number){


        return (this.ConnectedLaboratories[laboratory_number].getState() == DEVICE_STATES["DEVICE_IS_READY"])

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

runDataRecieveCommand(device:InterfaceDevice){

  console.log("runDataRecieveCommand laboratory");

device.command(DEVICES[2].commands.check, [], (response) => {


        this.SensorsData = response;

        console.log("laboratory_response: " + this.SensorsData);


     });


}


startDataRecievingLoop(laboratory:InterfaceDevice):void{




      console.log("startDataRecievingLoop");




            if (this.LaboratorySensorsDataRecievingStateState == SensorsDataRecievingStates.STOPED ){

                this.LaboratorySensorsDataRecievingStateState == SensorsDataRecievingStates.STARTED;

              this.DataRecievingLoopInterval = setInterval(this.runDataRecieveCommand.bind(this,laboratory),25);

              }





}



}
