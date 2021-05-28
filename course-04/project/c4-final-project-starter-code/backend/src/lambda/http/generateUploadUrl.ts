import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'


import * as AWS from 'aws-sdk'

const s3 = new AWS.S3({signatureVersion: 'v4'})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const docClient = new AWS.DynamoDB.DocumentClient()

const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  
  const uploadUrl =  s3.getSignedUrl('putObject',{
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })


  const imageUrl =  `https://${bucketName}.s3.amazonaws.com/${todoId}`


  const updateUrlOnTodo = {
    TableName: todoTable,
    Key: { 
      'todoId': todoId
       },
    UpdateExpression: "set attachmentUrl = :a",
    ExpressionAttributeValues: {
      ":a": imageUrl,
    },
    ReturnValues: "UPDATED_NEW",
  };

  await docClient.update(updateUrlOnTodo).promise();
  
  return {

    statusCode:201,
    headers: {
        'Access-Control-Allow-Origin':'*'
    },
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }

}
