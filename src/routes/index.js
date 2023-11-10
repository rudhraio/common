import express from 'express';
import userRoute from './user.js';
import sendEmail from './send-email.js';
import fileUpload from './file-upload.js';

const routes = express.Router();
routes.use("/users", userRoute);
routes.use("/send-email", sendEmail);
routes.use("/file-upload", fileUpload);

export default routes;