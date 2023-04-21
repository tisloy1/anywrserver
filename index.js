const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const corsOption = {
    origin:'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}



app.use(cors(corsOption))
app.use(express.json());
app.use(cookieParser())
app.use(authRoutes);


const http = require('http').createServer(app);
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000
const mongoDB = "mongodb+srv://pratic:pratic@cluster0.stahks2.mongodb.net/test";


mongoose.connect(mongoDB, {useNewUrlParser:true, useUnifiedTopology:true})
    .then(()=>console.log('connected'))
    .catch(err => console.log(err))


app.get('/set-cookies', (req, res)=> {
    res.cookie('email', 'email')
    res.cookie('isAuthenticated', true,
        {httpOnly:true, secure:true, maxAge:24*60*60})
    res.send('the cookie are save')
})

app.get('/get-cookies', (req, res)=> {
    const cookies = req.cookies;
    console.log(cookies);
    res.json({cookies})
})



http.listen(PORT, () => {
    console.log('listening on *:5000');
});