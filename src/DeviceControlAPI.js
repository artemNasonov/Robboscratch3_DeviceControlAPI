

import {InterfaceDevice,searchDevices,getConnectedDevices,DEVICES,DEVICE_STATES,trigger_logging} from './chrome';

import {flash_firmware,search_ports} from './firmware_flasher';

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

          flash_firmware(port_path,callback,config);

      }

      searchPorts(callback){

        console.log(`searchPorts`)

            search_ports(callback);

      }



}
