import express from "express";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { v4 as uuidv4 } from 'uuid';
import authentication from "../utils/authentication.js";

const sqs = new SQSClient();
const sendEmail = express.Router();

sendEmail.post("/", authentication, async (req, res) => {
    let status = 200;
    let message = "ok"
    const payload = req.body;
    const messageId = uuidv4();

    try {
        await sqs.send(new SendMessageCommand({
            QueueUrl: process.env.QUEUE_URL,
            MessageBody: JSON.stringify({ ...payload, messageId }),
            MessageAttributes: {
                AttributeName: {
                    StringValue: "Attribute Value",
                    DataType: "String",
                },
            },
        }));
        message = "Message accepted!";
    } catch (error) {
        console.error(error);
        message = error;
        status = 400;
    }


    let retunPayload = {};

    if (status === 200) {
        retunPayload = { data: { messageId } }
    }

    return res.status(status).json({
        status: status,
        message: message,
        ...retunPayload
    });
});


export default sendEmail;