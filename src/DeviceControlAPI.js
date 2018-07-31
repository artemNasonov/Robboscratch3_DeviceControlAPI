

import {InterfaceDevice,searchDevices,getConnectedDevices,DEVICES,DEVICE_STATES,trigger_logging} from './chrome';

import {flash_firmware,search_ports} from './firmware_flasher_new';

export default  class DeviceControlAPI {

    constructor(){




    }


      searchAllDevices(){

            searchDevices();

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
