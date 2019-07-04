

import {InterfaceDevice,searchDevices,getConnectedDevices,DEVICES,DEVICE_STATES,trigger_logging} from './chrome';

import {flash_firmware,search_ports} from './firmware_flasher_new';

export default  class DeviceControlAPI {

    constructor(){


      this.onErrorCb = () => {};
      this.onFirmwareVersionDiffersCb =   () => {};

      this.onDevicesNotFoundCb = () => {};

    }


      searchAllDevices(){

        //var devices = [];

            searchDevices((devices) => {

              if (devices.length == 0){

                this.onDevicesNotFoundCb();
              }

              for (let index = 0; index < devices.length; index++){

                  devices[index].registerFirmwareVersionDiffersCallback(this.onFirmwareVersionDiffersCb);
                  devices[index].registerErrorCallback(this.onErrorCb);

              }

            });



      }

      registerFirmwareVersionDiffersCallback(cb){

        if (typeof(cb) == 'function'){

             this.onFirmwareVersionDiffersCb = cb;

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



}
