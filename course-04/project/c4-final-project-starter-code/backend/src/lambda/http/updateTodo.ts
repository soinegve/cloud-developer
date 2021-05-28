import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { DynamoDBUtils } from '../../aws/DynamoDBUtil'




export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const result = await new DynamoDBUtils().updateTodo(todoId,updatedTodo)


  return {

    statusCode:201,
    headers: {
        'Access-Control-Allow-Origin':'*'
    },
    body: JSON.stringify(result)
  }
}
