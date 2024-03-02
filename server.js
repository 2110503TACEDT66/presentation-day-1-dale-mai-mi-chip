const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');

//load env vars from config
dotenv.config({path:'./config/config.env'});

connectDB();

const app = express();
app.use(express.json());


const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');


const messageShops = require(`./routes/messageShops`);
const auth = require('./routes/auth');
const reservations = require('./routes/reservations');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors')


const limiter = rateLimit({
    windowMs : 10*60*1000000,
    max: 10000000000000
});

const swaggerOptions = {
    swaggerDefinition : {
        openapi : '3.0.0',
        info : {
            title : 'Library API',
            version : '1.0.0',
            description : 'A simple Express VacQ API'
        },
        servers : [
            {
                url : 'http://localhost:5000/api/v1'
            }
        ],
    },
    apis : ['./routes/*.js']
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use(hpp());   //Prevent http param pollutionsa
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(limiter);
app.use(`/api/v1/hospitals`, hospitals);
app.use('/api/v1/auth', auth);
app.use('/api/v1/reservations', reservations);
app.use(cookieParser());
app.use(mongoSanitize());


const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error ${err.message}`);
    server.close(() => process.exit(1));
})


