import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from './../models/TodoUpdate'
import { TodosAccess } from './todosAcess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'

// TODO: Implement businessLogic
const logger = createLogger('Todos business logic log')

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

// TODO: Implement businessLogic
const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()
export async function getAllToDo(userId: string): Promise<TodoItem[]> {
  return todoAccess.getAllToDo(userId)
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
  const itemId = uuid.v4()

  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false
  })
}

export async function updateTodo(
  todoId: string,
  userId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoUpdate> {
  return await todoAccess.updateTodo(todoId, userId, {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  })
}

export async function deleteTodo(todoId: string, userId: string) {
  await todoAccess.deleteTodo(todoId, userId)
}

export async function createAttachmentPresignedUrl(
  todoId: string,
  userId: string
) {
  logger.info('Create attachment presigned url')
  const imageId = uuid.v4()
  const url = `https://${bucketName}.s3.amazonaws.com/${imageId}`
  await attachmentUtils.updateAttachmentUrl(todoId, userId, url)
  return getUploadUrl(imageId)
}

function getUploadUrl(imageId: string) {
  logger.info('Get upload url - urlExpiration: ', urlExpiration)
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: Number(urlExpiration)
  })
}
