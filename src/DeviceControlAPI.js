

import {InterfaceDevice,searchDevices,getConnectedDevices,DEVICES,DEVICE_STATES,trigger_logging} from './chrome';

import {flash_firmware,search_ports} from './firmware_flasher_new';

export default  class DeviceControlAPI {

    constructor(){


      this.onErrorCb = () => {};
      this.onFirmwareVersionDiffersCbMap = {};

      this.onDevicesNotFoundCb = () => {};

      this.onDeviceStatusChangeCbMap = {};

      this.onDeviceFoundCb = () => {};

      this.deviceList = [];

    }


      searchAllDevices(){

        //var devices = [];

            searchDevices((devices) => {

              this.deviceList = devices;

              if (devices.length == 0){

                this.onDevicesNotFoundCb();
              }

              for (let index = 0; index < devices.length; index++){

                  devices[index].registerFirmwareVersionDiffersCallback( (result) => {


                    let cb =  this.onFirmwareVersionDiffersCbMap[devices[index].getPortName()];

                     if (typeof(cb) == 'function'){

                       cb(result);

                    }

                     

                  });

                  devices[index].registerErrorCallback(this.onErrorCb);
                
                  devices[index].registerDeviceStatusChangeCallback((state) => {

                    let cb =  this.onDeviceStatusChangeCbMap[devices[index].getPortName()];

                     if (typeof(cb) == 'function'){

                       cb(state);

                    }

                  

                  });


                  let device = {

                     // deviceSerial: devices[index].getShorterSerialNumber(),
                      devicePort: devices[index].getPortName(),
                       deviceId: devices[index].getDeviceID() 
                     // deviceFirmwareVersion: devices[index].getFirmwareVersion()
                  }

                    //  console.warn("onDeviceFound");

                     this.onDeviceFoundCb(device);

              }

            });



      }

      registerFirmwareVersionDiffersCallback(port_name,cb){

        if (typeof(cb) == 'function'){

             this.onFirmwareVersionDiffersCbMap[port_name] = cb;

        }


      }

      registerErrorCallback(cb){

        if (typeof(cb) == 'function'){

             this.onErrorCb = cb;

        }


      }

      registerDevicesNotFoundCallback(cb){

         if (typeof(cb) == 'function'){

             this.onDevicesNotFoundCb = cb;

        }

      }

      registerDeviceFoundCallback(cb){

        if (typeof(cb) == 'function'){

             this.onDeviceFoundCb = cb;

        }

      }

       registerDeviceStatusChangeCallback(port_name,cb){

         if (typeof(cb) == 'function'){

             this.onDeviceStatusChangeCbMap[port_name] = cb;

        }

      }

      triggerLogging(){


            trigger_logging();
      }

      flashFirmware(port_path,config,callback){

        // config.device.device_id = 2;
        // config.device.device_firmware_version = 2;

          flash_firmware(port_path,callback,config);

      }

      searchPorts(callback){

        console.log(`searchPorts`)

            search_ports(callback);

      }

      getDevices(){


          return this.deviceList;
      }



}
