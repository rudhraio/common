import express from 'express';
import userRoute from './user.js';
import sendEmail from './send-email.js';

const routes = express.Router();
routes.use("/users", userRoute);
routes.use("/send-email", sendEmail);

export default routes;