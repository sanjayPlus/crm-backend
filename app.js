require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
// importing routes
const userRoutes = require('./routes/userRoutes')
const adminRoutes = require('./routes/adminRoutes')
const crmRoutes = require('./routes/crmRoutes')
const adminController = require('./controllers/adminController')


// mongoDB connection
mongoose.connect(process.env.MONGODB_URL).then(() => {
console.log("MongoDb Connected Successfully!!!");
}).catch((err) => {
    console.log(err);
})

app.use(cors())
app.use(express.json())
app.use(express.static('public'));

// use routes
app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/crm', crmRoutes)

const PORT = process.env.PORT || 8000

app.get('/',(req,res)=>{
    res.send('<h1 style="color:red">Server running successfully... and waiting for client requests!!</h1>') 
})


app.listen(PORT, (err) => {
    if (err) {
       return console.log(err);
    }
    console.log(`server is running on port ${PORT}`);
})

cron.schedule('0 8,12 * * *', () => {
    const code = adminController.generateCode();
    adminController.saveCode(code);
});