const express = require('express')
const db = require('./config/database')

require('dotenv').config()

const app = express()

const PORT = process.env.PORT

app.use(express.json())

app.listen(PORT, () => console.log(`Server listen on ${PORT}`))

db.connect()

app.get('/', () =>{
    console.log("Hello")
})
