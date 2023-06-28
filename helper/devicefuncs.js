
// At request level
const DeviceDetector = require('node-device-detector');
const ClientHints    = require('node-device-detector/client-hints')
module.exports = {


    DetectDevice:async(agent,req)=>{
   
    
        const detector = new DeviceDetector({
          clientIndexes: true,
          deviceIndexes: true,
          deviceAliasCode: false,
          indexes:false,
          // ... all options scroll to Setter/Getter/Options
        });
        
        const clientHints = new ClientHints();
        const clientHintData = clientHints.parse(req.headers);
        
        // result promise
        // added for 2.0.4 version or later
        const resulttwo = await detector.detect(agent, clientHintData);
        return JSON.stringify(resulttwo)
      },
  
    DetectIp: (req) => {
        var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress;
        return ip.split(':').pop()
    },
  
};