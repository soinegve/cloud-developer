import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import {getUserId} from '../utils'


const AWS = require('aws-sdk')
const uuid = require('uuid')
const docClient = new AWS.DynamoDB.DocumentClient()

const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const userId = getUserId(event)
  const todoId = uuid.v4()

  const item = { todoId, userId,...newTodo}

  await docClient.put({TableName: todoTable, Item : item}).promise()

  return {

    statusCode:201,
    headers: {
        'Access-Control-Allow-Origin':'*'
    },
    body: JSON.stringify({item})
  }
}
