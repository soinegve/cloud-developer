import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {getUserId} from '../utils'
import {DynamoDBUtils} from '../../aws/DynamoDBUtil'





export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const userId = getUserId(event)

  
  const todos = await new DynamoDBUtils().getAllTodosForUser(userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({items: todos})
  }

 
 
  

}
