import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand
} from "@aws-sdk/lib-dynamodb";

import AWS from "aws-sdk";
import axios from "axios";
import nodemailer from "nodemailer";


const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);


const ses = nodemailer.createTransport({
    SES: new AWS.SES({ region: 'ap-south-1', apiVersion: '2010-12-01' })
});

const EMAILS_TABLE = process.env.EMAILS_TABLE;

const handler = async (event) => {
    for (const record of event.Records) {

        const payload = JSON.parse(record.body);
        const {
            messageId,
            to,
            cc = [],
            bcc = [],
            reply_to = [],
            from = "TriHox <no-reply@trihox.com>",
            type = "transactional",
            subject,
            body,
            attachements = [],
            provider = "ses",
            created_by = "SELF"
        } = payload;

        let info = {};
        let status = [];
        if (provider === "ses") {
            const emailParams = {
                from,
                to,
                cc,
                bcc,
                replyTo: reply_to,
                subject,
                html: body
            }

            // Add attachments if needed
            if (attachements.length > 0) {
                emailParams.attachments = [];
                for (const attachementPath of attachements) {
                    try {
                        const response = await axios.get(attachementPath, { responseType: 'arraybuffer' });
                        emailParams.attachments.push({
                            filename: attachementPath.split("/")[attachementPath.split("/").length - 1],
                            content: Buffer.from(response.data, 'binary'),
                        });
                    } catch (error) {
                        console.error("[Error]: attachments error", error);
                    }
                }
            }

            try {
                const data = await ses.sendMail(emailParams);
                status.push("SENT");
                info = { awsMessageID: data.messageId, response: data.response };
            } catch (error) {
                console.error('[Error] sending email:', error);
                status.push("FAILED");
            }
        } else {
            status.push("FAILED");
            console.error("[ERROR]: NO Emial provider");
        }


        const currentDate = new Date();
        const created_at = currentDate.toISOString();

        const params = {
            TableName: EMAILS_TABLE,
            Item: {
                messageId, from, sendTo: { to, cc, bcc, reply_to }, subject, body, attachements, type, provider, status, info, created_at, created_by
            },
        };
        try {
            await dynamoDbClient.send(new PutCommand(params), { removeUndefinedValues: true });
        } catch (error) {
            console.error("[Error]: ", error);
        }
    };

}


export { handler };