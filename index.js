//use packages
//Loads .env file contents into process.env 
require('dotenv').config()
const express = require('express')
const cors = require('cors')
require('./db/connection')
const router = require('./Routes/router')
const middleware = require('./middlewares/authMiddleware')
//Creates an Express application
const bankServer = express()

//use cors
bankServer.use(cors())
//use json parser in server
bankServer.use(express.json())
bankServer.use(middleware.appMiddleware)
//use router
bankServer.use(router)
//setup port number to listen server
const port = 3000 || process.env.PORT

//run/listen server app
bankServer.listen(port,()=>{
    console.log(`Bank Server started at port no: ${port}`);
})

//http request
bankServer.get("/",(req,res)=>{
    res.status(200).send(`<h1>Bank Server Started</h1>`)
})