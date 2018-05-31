

import {InterfaceDevice,searchDevices,getConnectedDevices,DEVICES,DEVICE_STATES,trigger_logging} from './chrome';

export default  class DeviceControlAPI {

    constructor(){




    }


      searchAllDevices(){

            searchDevices();

      }

      triggerLogging(){


            trigger_logging();
      }



}
