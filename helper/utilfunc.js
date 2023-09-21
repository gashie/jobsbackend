const dotenv = require("dotenv");
const { logger } = require("../logs/winston");
dotenv.config({ path: "./config/config.env" });
const jwt = require('jsonwebtoken');
const { DetectDevice, DetectIp, MainEnc } = require("./devicefuncs")
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");
// const { ApiCall } = require("./autoCalls");

module.exports = {
    sendResponse: (res, status, code, message, data) => {
        status == 0 ? logger.error(message) : logger.info(message)
        res.status(code).json({
            status: status,
            message: message,
            data: data ? data : [],
        })
    },
    sendCookie: async (UserInfo, status, code, res, req) => {
        const timestamp = new Date().getTime(); // current time
        const exp = timestamp + (60 * 60 * 24 * 1000 * 7)
        // let device = await DetectDevice(req.headers['user-agent'], req)
        let userIp = DetectIp(req)
        // UserInfo.devcrb = device
        UserInfo.devirb = userIp
        let EncUserInfo = MainEnc(UserInfo)  //encrypt entire user information
        const accessToken = jwt.sign({ EncUserInfo }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2d' })

        // // Create secure cookie with refresh token 
        const options = {
            httpOnly: true, //accessible only by web server 
            secure: false, //https
            // sameSite: 'None', //cross-site cookie 
            maxAge: 2 * 24 * 3600000 //cookie expiry: set to match rT
        }
        logger.info('Logged in successfully')
        // res.status(code).json({
        //     status: status,
        //     message: 'Logged in successfully',

        return res
            .status(code)
            .cookie("jtsid", accessToken, options)
            .json({ status: 1, message: "Logged in" });
    },
    clearResponse: (req, res) => {
        const cookies = req.cookies
        if (!cookies?.jtsid) return res.sendStatus(204) //No content
        res.clearCookie('jtsid', { httpOnly: true, sameSite: 'None', secure: true, expires: new Date(Date.now() + 10 * 1000), })
        logger.info('Logged out')
        res.json({ Message: 'Logged out' })
    },


    CatchHistory: async (data, req) => {
        data.service_name = process.env.ServiceName,
            // data.service_info,
            // data.location_info,
            // data.extra_data,
            data.date_ended = systemDate
        data.created_at = systemDate
        data.device = await DetectDevice(req.headers['user-agent'], req)
        data.ip = DetectIp(req)
        data.url = req.path

        console.log(data);
        //    ApiCall(`${process.env.AuditUrl}api/v1/savelogs`, 'POST', ``, data)

    },
    accessCode: () => {
        require('crypto').randomBytes(48, function (err, buffer) {
            var token = buffer.toString('hex');
        });
    },
    removeFile: async (dir, file) => {
        const fs = require('fs').promises;
        const path = require('path');
        await fs.unlink(path.join(dir, file))
        console.log('Deleted', file)
        return

    },

};