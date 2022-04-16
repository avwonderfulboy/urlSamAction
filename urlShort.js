"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const dynamodb = new aws_sdk_1.DynamoDB({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});
exports.handler = (event) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      if (event.requestContext.httpMethod === "GET") {
        const { short_url } = event.queryStringParameters;
        if (
          (short_url === null || short_url === void 0
            ? void 0
            : short_url.length) === 0
        )
          return {
            statusCode: 400,
            body: "Short url cannot be empty ",
          };
        let resp = yield dynamodb
          .getItem({
            TableName: "shortner",
            Key: {
              short_url: { S: short_url },
            },
          })
          .promise();
        if (resp.Item === undefined) {
          return {
            statusCode: 400,
            body: "Opps! its not here.Please create short Url for this Url",
          };
        }
        return {
          statusCode: 302,
          headers: {
            location: `https://${resp.Item.long_url.S}`,
          },
        };
      }
      if (event.requestContext.httpMethod === "POST") {
        const { long_url } = JSON.parse(event.body);
        if (long_url.length == 0) return { body: " url cannot be empty  " };
        let short_url =
          Math.random().toString(32).substring(2, 4) +
          Math.random().toString(32).substring(2, 4);
        let response = yield dynamodb
          .putItem({
            TableName: "shortner",
            Item: {
              short_url: { S: short_url },
              long_url: { S: long_url },
            },
          })
          .promise();
        short_url = process.env.api + short_url;
        return { short_url };
      }
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify(err),
      };
    }
  });
