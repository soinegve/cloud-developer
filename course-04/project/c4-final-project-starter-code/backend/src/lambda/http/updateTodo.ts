import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()

const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)



  var params = {
    ExpressionAttributeNames: {
     "#N": "Name", 
     "#DD": "DueDate",
     "#D": "Done"
    }, 
    ExpressionAttributeValues: {
     ":n": {
       S: updatedTodo.name
      }, 
     ":dd": {
       S: updatedTodo.dueDate
      },
      ":d": {
        B: updatedTodo.done
       }
    }, 
    Key: {
     "todoId": todoId
    }, 
    ReturnValues: "ALL_NEW", 
    TableName: todoTable, 
    UpdateExpression: "SET #N = :n, #DD = :dd, #D = :d"
   };

  const result = await docClient.update(params).promise()


  return {

    statusCode:201,
    headers: {
        'Access-Control-Allow-Origin':'*'
    },
    body: JSON.stringify(result)
  }
}
