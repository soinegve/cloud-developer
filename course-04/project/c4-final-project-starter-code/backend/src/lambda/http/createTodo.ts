import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import {getUserId} from '../utils'
import { DynamoDBUtils } from '../../aws/DynamoDBUtil'
import { TodoItem } from '../../models/TodoItem'


const uuid = require('uuid')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const userId = getUserId(event)
  const todoId = uuid.v4()

  const item : TodoItem = { todoId, userId, ...newTodo, createdAt: newTodo.dueDate, done: false}

  await new DynamoDBUtils().createTodo(item)

  return {

    statusCode:201,
    headers: {
        'Access-Control-Allow-Origin':'*'
    },
    body: JSON.stringify({item})
  }
}
