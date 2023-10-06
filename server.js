const path = require("path");
const https = require("https");
const http = require("http");
const fs = require("fs");
const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const fileupload = require("express-fileupload");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/error");
const { logger, morganMiddleware } = require("./logs/winston");
const routes = require("./routes/setup");
const cookieParser = require('cookie-parser')

//load env vars
dotenv.config({ path: "./config/config.env" });
//initialise express
const app = express();

const ssslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'certp','key.pem')),
    cert:fs.readFileSync(path.join(__dirname, 'certp','cert.pem')),
},app)
const httpServer = http.createServer({
    key: fs.readFileSync(path.join(__dirname, 'certp','key.pem')),
    cert:fs.readFileSync(path.join(__dirname, 'certp','cert.pem')),
},app)
//body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//fileuploader middleware
app.use(fileupload());

//Set Security Headers
app.use(helmet({ crossOriginResourcePolicy: false }));
//Set Security Headers
var __dirname = path.resolve()
app.use(express.static(path.join(__dirname,'build')))

//Prevent XSS Attack
app.use(xss())

if (process.env.NODE_ENV === "development") {
    app.use(morganMiddleware);

}

app.use(cookieParser())


app.use(function (req, res, next) {
    res.removeHeader("x-powered-by");
    res.removeHeader("set-cookie");
    res.removeHeader("Date");
    res.removeHeader("Connection");

    next();
});
app.use(function (req, res, next) {
    /* Clickjacking prevention */
    res.header('Content-Security-Policy', "frame-ancestors directive")
    next()
})


//Mount routes
app.use("/api/v1/jobs", routes);


app.use('/uploads', express.static(path.join(__dirname, '/uploads')))
app.get('/*',function(req,res){
    res.sendFile(path.join(__dirname,'build','index.html'))
  })
app.use(errorHandler);

//errror middleware
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        status: 0,
        message: error.message,
    });
    logger.error(error.message);
});
//create port
const PORT = process.env.PORT || 9000;
//listen to portnpm
ssslServer.listen(PORT, () => {
    console.log(
        `JOBSINGH: Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`
    );
    logger.debug(`JOBSINGH: Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`);
});
httpServer.listen(5055, () => {
    console.log(
        `JOBSINGH: Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`
    );
    logger.debug(`JOBSINGH: Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`);
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    logger.error(err.message);
    // Close server & exit process
    // server.close(() => process.exit(1));
});
