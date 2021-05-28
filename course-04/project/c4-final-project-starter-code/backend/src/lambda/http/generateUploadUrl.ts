import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'


import * as AWS from 'aws-sdk'
import { DynamoDBUtils } from '../../aws/DynamoDBUtil'
import { getUserId } from '../utils'

const s3 = new AWS.S3({signatureVersion: 'v4'})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  
  const uploadUrl =  s3.getSignedUrl('putObject',{
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })


  const imageUrl =  `https://${bucketName}.s3.amazonaws.com/${todoId}`

  

  const userId = getUserId(event)
  await new DynamoDBUtils().updateToDoUrl(userId,todoId,imageUrl);
  
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
