const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");

const app = express();

const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

app.get("/signeblock", async function (req, res) {
  const params = {
    TableName: "users-table-dev",
  };

  try {
    const { Items } = await dynamoDbClient.scan(params).promise();
    if (Items) {
      res.json(Items);
    } else {
      res.status(404).json({ error: "Could not find users" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "There was an error" });
  }
});

// POST //

app.post("/signeblock", async function (req, res) {
  const { userId, name } = req.body;
  if (typeof userId !== "string") {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof name !== "string") {
    res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: "users-table-dev",
    Item: {
      userId: userId,
      name: name,
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    res.json({ userId, name });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
