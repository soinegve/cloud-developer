import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'


const AWSXRay = require('aws-xray-sdk')


const XAWS = AWSXRay.captureAWS(AWS)



export class DynamoDBUtils {


  constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODO_TABLE) {}

  async updateToDoUrl(userId: string, todoId: string, imageUrl: string) {
    
    
    const updateUrlOnTodo = {
        TableName: this.todoTable,
        Key: { 
          'todoId': todoId,
          'userId':userId
           },
        UpdateExpression: "set attachmentUrl = :a",
        ExpressionAttributeValues: {
          ":a": imageUrl,
        },
        ReturnValues: "UPDATED_NEW",
      };

      this.docClient.update(updateUrlOnTodo).promise()


  }
  async updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest) {
    
    
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
         "todoId": todoId,
         "userId": userId
        }, 
        ReturnValues: "ALL_NEW", 
        TableName: this.todoTable, 
        UpdateExpression: "SET #N = :n, #DD = :dd, #D = :d"
       };


       const result = await this.docClient.update(params).promise()

       return result
  }
  
  
  async  delete(todoId: string, userId: string) {
       this.docClient.delete({TableName: this.todoTable, Key:{"todoId" : todoId,"userId":userId}}).promise()
  }

  
  

  async getAllTodosForUser(userId : string): Promise<TodoItem[]> {
    console.log('Getting all todos')
   
    const result = await this.docClient.query({
        TableName: this.todoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      }).promise()

    

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()

    return todo
  }
}



