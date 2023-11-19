const express = require("express");
require("dotenv").config();
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 4000;

require('./controllers')(app);

app.listen(PORT, ()=>{
    console.log(`Server is listening at ${PORT}...`)
})
