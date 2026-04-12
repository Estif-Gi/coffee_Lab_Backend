require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');


const HttpError = require('./models/http_error');
const httpSuccess = require('./models/http_success');
const menuRoutes = require('./routes/menu_route');
const eventRoutes = require('./routes/event_route');
const promotionRoutes = require('./routes/promotion_route');
const userRoutes = require('./routes/user_route');
const { routerError } = require('./controller/app_error_controller');
// const contactRoutes = require('./routes/contact_route');


const app = express();
app.use(bodyParser.json());

app.use(cors());
app.use("/api/menu", menuRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/promotions", promotionRoutes);
// app.use("/api/contact", contactRoutes);
app.use( (req,res,next)=>{
    const error = new HttpError("Could not find this route.", 404);
    return next(error);
});
app.use(routerError);
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@coffeelab.ol249js.mongodb.net/`, {
}).then(() => {
    console.log('************Connected to MongoDB*************');
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port http://localhost:${process.env.PORT || 3000}`);
    });
}).catch((err) => {
    console.log(err);
});

