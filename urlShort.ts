import {
  APIGatewayEvent,
  APIGatewayProxyEventQueryStringParameters,
} from "aws-lambda";
import { DynamoDB, Lambda } from "aws-sdk";

const dynamodb = new DynamoDB({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

exports.handler = async (event: APIGatewayEvent) => {
  try {
    if (event.requestContext.httpMethod === "GET") {
      const { short_url } =
        event.queryStringParameters as APIGatewayProxyEventQueryStringParameters;

      if (short_url?.length === 0)
        return {
          statusCode: 400,
          body: "Short url cannot be empty ",
        };

      let resp = await dynamodb
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
      const { long_url }: { long_url: string } = JSON.parse(
        event.body as string
      );
      if (long_url.length == 0) return { body: " url cannot be empty  " };
      let short_url =
        Math.random().toString(32).substring(2, 4) +
        Math.random().toString(32).substring(2, 4);

      let response = await dynamodb
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
};
