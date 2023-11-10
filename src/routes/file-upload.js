import express from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3 } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand
} from "@aws-sdk/lib-dynamodb";

import authentication from "../utils/authentication.js";
import { convertToAlphanumeric } from "../utils/common.js";

const s3 = new S3({
    region: 'ap-south-1'
});

const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

const fileUpload = express.Router();
const FILES_TABLE = process.env.FILES_TABLE;



// Set storage engine for multer
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'trihox',
        key: function (req, file, cb) {
            const org = req?.headers?.org ? req?.headers?.org + "/" : "";
            const path = req?.headers?.path ? req?.headers?.path : "default/";
            const filePath = org + path + Date.now().toString() + '_' + convertToAlphanumeric(file.originalname);
            cb(null, filePath);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
});

fileUpload.post("/", authentication, upload.single('file'), async (req, res) => {
    let status = 200, message = "ok", data = [];

    if (!req?.file) {
        status = 400;
        message = "Upload failed";
    } else {

        const currentDate = new Date();
        let Item = {
            fileId: uuidv4(),
            name: req.file.originalname,
            url: `https://trihox.s3.ap-south-1.amazonaws.com/${req.file.key}`,
            size: parseInt(req.file.size ? req.file.size : req.get('Content-Length')),
            type: req.file.originalname.split(".")[req.file.originalname.split(".").length - 1],
            mimetype: req.file.mimetype,
            active: true,
            org: req.headers.org ? req.headers.org : "common",
            created_at: currentDate.toISOString(),
            created_by: req?.body?.created_by ? req?.body?.created_by : "SELF",
        }


        data = {
            fileId: Item.fileId,
            url: Item.url
        };

        const params = {
            TableName: FILES_TABLE,
            Item
        };
        try {
            await dynamoDbClient.send(new PutCommand(params), { removeUndefinedValues: true });
        } catch (error) {
            console.error("[Error]: ", error);
        }

    }

    return res.status(status).json({
        status,
        message,
        data
    })
});

export default fileUpload;