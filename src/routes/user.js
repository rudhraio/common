import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";
import express from "express";


const USERS_TABLE = process.env.USERS_TABLE;
const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

const userRoute = express.Router();

userRoute.get("/:userId", async function (req, res) {
    const params = {
        TableName: USERS_TABLE,
        Key: {
            userId: req.params.userId,
        },
    };

    try {
        const { Item } = await dynamoDbClient.send(new GetCommand(params));
        if (Item) {
            const { userId, name } = Item;
            res.json({ userId, name });
        } else {
            res
                .status(404)
                .json({ error: 'Could not find user with provided "userId"' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not retreive user" });
    }
});

userRoute.post("/", async function (req, res) {
    const { userId, name } = req.body;
    if (typeof userId !== "string") {
        res.status(400).json({ error: '"userId" must be a string' });
    } else if (typeof name !== "string") {
        res.status(400).json({ error: '"name" must be a string' });
    }

    const params = {
        TableName: USERS_TABLE,
        Item: {
            userId: userId,
            name: name,
        },
    };

    try {
        await dynamoDbClient.send(new PutCommand(params));
        res.json({ userId, name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not create user" });
    }
});

export default userRoute;