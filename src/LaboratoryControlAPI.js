/* @flow */


import DeviceControlAPI from './DeviceControlAPI';
//import RobotSensorsData from './RobotSensorsData';
import {InterfaceDevice,searchDevices,getConnectedDevices,DEVICES,DEVICE_STATES} from './chrome';



const DEVICE_HANDLE_TIMEOUT:number = 1 * 60 * 1000;

type LaboratorySensorsData = {

                       d8_13 :    [number],
                       a0       : [number],
                       a1       : [number],
                       a2       : [number],
                       a3       : [number],
                       a4       : [number],
                       a5       : [number],
                       a6       : [number],
                       a7       : [number]


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

  led_states:Array<string>;
  led_bit_mask:number;

  led_color_states:Array<string>;
  led_color_bit_mask:number;

  digital_pins_states:Array<string>;
  digital_pins_bit_mask:number;

  //lab_sensor_types:Array<string>;

  constructor(){



    super();

    this.LaboratorySensorsDataRecievingState = SensorsDataRecievingStates.STOPED;
    this.ConnectedDevices = [];
    this.ConnectedLaboratories = [];
    this.ConnectedLaboratoriesSerials = [];

    this.led_states = ['off','off','off','off','off','off','off','off'];
    this.led_bit_mask = 0;

    this.led_color_states = ['off','off','off'];
    this.led_color_bit_mask = 0;

    this.digital_pins_states = ['off','off','off','off','off','off'];
    this.digital_pins_bit_mask = 0;

    this.lab_sensor_types = [];


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


                   if (self.ConnectedLaboratoriesSerials.indexOf(device.getSerialNumber()) == -1 ){

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

islaboratoryButtonPressed(laboratory_number:number, button_number:number):boolean{

  if ((this.ConnectedLaboratories.length - 1) >= laboratory_number ){


    if(this.ConnectedLaboratories[0].getDeviceID() == 2 && this.ConnectedLaboratories[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

          console.log(`islaboratoryButtonPressed button_number: ${button_number}`);

        return   (this.SensorsData.d8_13[0] & (1 << (button_number-1)))?true:false;

    } else return false;


  }else return false;




}

labDigitalPinState(laboratory_number:number, digital_pin:string):boolean{


  if ((this.ConnectedLaboratories.length - 1) >= laboratory_number ){


    if(this.ConnectedLaboratories[0].getDeviceID() == 2 && this.ConnectedLaboratories[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

          console.log(`labDigitalPinState digital_pin: ${digital_pin}`);

          var pin  = Number(digital_pin.replace("D","")) - 8;

          return   (this.SensorsData.d8_13[0] & (1 << (pin)))?true:false;

    } else return false;


  }else return false;





}

turnLedOn(led_position:number,laboratory_number:number){

  if ((this.ConnectedLaboratories.length - 1) >= laboratory_number ){


    if(this.ConnectedLaboratories[0].getDeviceID() == 2 && this.ConnectedLaboratories[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

      console.log(`Lab turnLedOn led_position: ${led_position}`);


   if (this.led_states[led_position] == 'off') {



         this.led_bit_mask = this.led_bit_mask | (1 << led_position);

         console.log(`led_bit_mask: ${this.led_bit_mask}`);

         this.led_states[led_position] = 'on';

         this.ConnectedLaboratories[0].command(DEVICES[2].commands.lab_lamps, [this.led_bit_mask], function(response){



                    });

   }



     }

  }


}


turnLedOff(led_position:number,laboratory_number:number){

 if ((this.ConnectedLaboratories.length - 1) >= laboratory_number ){


   if(this.ConnectedLaboratories[0].getDeviceID() == 2 && this.ConnectedLaboratories[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

     console.log(`Lab turnLedOff led_position: ${led_position}`);

   if (this.led_states[led_position] == 'on') {

     this.led_bit_mask = this.led_bit_mask & ~(1 << led_position);

     console.log(`led_bit_mask: ${this.led_bit_mask}`);

     this.led_states[led_position] = 'off';

     this.ConnectedDevices[0].command(DEVICES[2].commands.lab_lamps, [this.led_bit_mask], function(response){



                });

   }



   }

 }


}

turnColorLedOn(led_color:string,laboratory_number:number){


if ((this.ConnectedLaboratories.length - 1) >= laboratory_number ){


    if(this.ConnectedLaboratories[0].getDeviceID() == 2 && this.ConnectedLaboratories[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

      console.log(`Lab turnColorLedOn led_color: ${led_color}`);

  if(led_color== 'red' && this.led_color_states[0] == "off"){
   this.led_color_bit_mask = this.led_color_bit_mask | 4;

   this.ConnectedDevices[0].command(DEVICES[2].commands.lab_color_lamps, [this.led_color_bit_mask], function(response){



              });

   this.led_color_states[0] = 'on';
}

if(led_color== 'yellow' && this.led_color_states[1] == "off"){
 this.led_color_bit_mask = this.led_color_bit_mask | 2;

 this.ConnectedDevices[0].command(DEVICES[2].commands.lab_color_lamps, [this.led_color_bit_mask], function(response){



            });

 this.led_color_states[1] = 'on';
}

if(led_color== 'green' && this.led_color_states[2] == "off"){
 this.led_color_bit_mask = this.led_color_bit_mask | 1;

 this.ConnectedDevices[0].command(DEVICES[2].commands.lab_color_lamps, [this.led_color_bit_mask], function(response){



            });

 this.led_color_states[2] = 'on';
}

}

}

}


turnColorLedOff(led_color:string,laboratory_number:number){


  if ((this.ConnectedLaboratories.length - 1) >= laboratory_number ){


      if(this.ConnectedLaboratories[0].getDeviceID() == 2 && this.ConnectedLaboratories[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

        console.log(`Lab turnColorLedOff led_color: ${led_color}`);

    if(led_color== 'red' && this.led_color_states[0] == "on"){
     this.led_color_bit_mask = this.led_color_bit_mask & ~ 4;

     this.ConnectedDevices[0].command(DEVICES[2].commands.lab_color_lamps, [this.led_color_bit_mask], function(response){



                });

     this.led_color_states[0] = 'off';
  }

  if(led_color== 'yellow' && this.led_color_states[1] == "on"){
   this.led_color_bit_mask = this.led_color_bit_mask & ~ 2;

   this.ConnectedDevices[0].command(DEVICES[2].commands.lab_color_lamps, [this.led_color_bit_mask], function(response){



              });

   this.led_color_states[1] = 'off';
  }

  if(led_color== 'green' && this.led_color_states[2] == "on"){
   this.led_color_bit_mask = this.led_color_bit_mask & ~ 1;

   this.ConnectedDevices[0].command(DEVICES[2].commands.lab_color_lamps, [this.led_color_bit_mask], function(response){



              });

   this.led_color_states[2] = 'off';
  }

  }

  }

}

setDigitalOnOff(digital_pin:string,digital_pin_state:string,laboratory_number:number){

  if ((this.ConnectedLaboratories.length - 1) >= laboratory_number ){


      if(this.ConnectedLaboratories[0].getDeviceID() == 2 && this.ConnectedLaboratories[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

          console.log(`Lab setDigitalOnOff digital_pin: ${digital_pin} digital_pin_state: ${digital_pin_state} `);

            var pin = Number(digital_pin.replace("D",""));

            var digitalOutMask:number = 1 << (pin - 2);

            if(digital_pin_state == "on"){
               if(this.digital_pins_states[pin] == "off"){

                 this.ConnectedDevices[0].command(DEVICES[2].commands.lab_dig_on, [digitalOutMask], function(response){



                            });

                  this.digital_pins_states[pin] = "on";
               }
            }
            else{
               if(this.digital_pins_states[pin] == "on"){

                 this.ConnectedDevices[0].command(DEVICES[2].commands.lab_dig_off, [digitalOutMask], function(response){



                            });

                this.digital_pins_states[pin] = "off";
               }
            }

      }


    }

}

setDigitalPWM(digital_pin:string,pwm_value:number,laboratory_number:number){

  if ((this.ConnectedLaboratories.length - 1) >= laboratory_number ){


      if(this.ConnectedLaboratories[0].getDeviceID() == 2 && this.ConnectedLaboratories[0].getState() == DEVICE_STATES["DEVICE_IS_READY"]){

          console.log(`Lab setDigitalPWM digital_pin: ${digital_pin} pwm_value: ${pwm_value} `);


            var pin = Number(digital_pin.replace("D",""));

            if(pin == 3){

              this.ConnectedDevices[0].command(DEVICES[2].commands.lab_dig_pwm, [1,pwm_value], function(response){



                         });

              }
              if(pin == 5){

                this.ConnectedDevices[0].command(DEVICES[2].commands.lab_dig_pwm, [2,pwm_value], function(response){



                           });

              }
              if(pin == 6){

                this.ConnectedDevices[0].command(DEVICES[2].commands.lab_dig_pwm, [4,pwm_value], function(response){



                           });
              }

                }

      }


}

getSensorsData(): LaboratorySensorsData{


    return this.SensorsData;

}

// getSensorData(pin:number){
//
//     return this.SensorsData[`a${pin}`];
//
// }

setSensorType(sensor_name:string, sensor_type:string){


  this.lab_sensor_types[sensor_name] = sensor_type;

}

getSensorData(sensor_name:string):number{

  if ( typeof(this.SensorsData) != 'undefined' ){

      if (sensor_name.startsWith("A")){

            var pin = sensor_name.toLowerCase();

            if ( typeof(this.SensorsData) != 'undefined' ){

              if ( (this.lab_sensor_types[sensor_name] != 'nosensor') || ( typeof(this.lab_sensor_types[sensor_name]) != 'undefined') ){

                    switch (this.lab_sensor_types[sensor_name]) {

                      case "temperature":

                        if (this.ConnectedLaboratories[0].getDeviceID() == 2){

                              return this.SensorsData[pin];

                        }else{

                                return this.SensorsData[pin];

                        }

                    //  break;

                      case "clamps":

                        return this.SensorsData[pin];

                    //  break;

                      default:

                    }

                    return this.SensorsData[pin];

              }else {

                      return this.SensorsData[pin];

              }



            } else return -1;



      }else{

            switch (sensor_name) {

              case "light":

                  return   this.SensorsData.a5[0];



              case "sound":

                    return   this.SensorsData.a4[0];



              case "slider":

                    return   this.SensorsData.a7[0];



                    default: return -1;

            }
      }

  }else return -1;

}

runDataRecieveCommand(device:InterfaceDevice){

  console.log("runDataRecieveCommand laboratory");

device.command(DEVICES[2].commands.check, [], (response) => {


        this.SensorsData = response;

      //  console.log("laboratory_response: " + this.SensorsData);


     });


}


startDataRecievingLoop(laboratory:InterfaceDevice):void{




      console.log("startDataRecievingLoop");




            if (this.LaboratorySensorsDataRecievingState == SensorsDataRecievingStates.STOPED ){

                this.LaboratorySensorsDataRecievingState == SensorsDataRecievingStates.STARTED;

              this.DataRecievingLoopInterval = setInterval(this.runDataRecieveCommand.bind(this,laboratory),25);

              }





}



}
