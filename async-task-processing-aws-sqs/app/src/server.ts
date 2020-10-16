import AWS from 'aws-sdk'
import express from 'express'
import { Consumer } from 'sqs-consumer'

import { constructStandardQueueMessage } from '../../common/sqs'
import { FibonacciResult } from '../../types/fibonacci'
import { Dictionary, Status } from "../../types/common"

const awsRegion = process.env.AWS_REGION as string
const taskQueueUrl = process.env.TASK_QUEUE_URL as string
const statusQueueUrl = process.env.STATUS_QUEUE_URL as string

AWS.config.update({ region: awsRegion })

const app = express()
const sqs = new AWS.SQS()

const db: Dictionary<FibonacciResult> = {}

app.get('/', (_, res) => res.send('hello from app'))

/**
 * Enqueues the value in a task queue for a downstream worker to
 * compute the Fibonacci number.
 * @param {number} req.query.value
 */
app.get('/fibonacci', (req, res) => {
  const value = Number(req.query.value)


  const message = constructStandardQueueMessage(taskQueueUrl, String(value))

  sqs.sendMessage(message).promise()
    .then(data => {
      const messageId = String(data.MessageId)
      console.info(`Enqueued: messageId=${messageId}\t`)
      db[messageId] = { status: Status.PENDING }
      res.json({
        value,
        callbackUrl: `http://localhost:5000/fibonacci/status/${messageId}`
      })
    })
    .catch((error) => {
      console.error(error)
      res.sendStatus(500)
    })
})

app.get('/fibonacci/status/:messageId', (req, res) => {
  const messageId = req.params.messageId
  return res.json(db[messageId])
})

/**
 * Listens for the job
 */
const fibStatusConsumer = Consumer.create({
  sqs: sqs,
  queueUrl: statusQueueUrl,
  waitTimeSeconds: 3,
  visibilityTimeout: 10,
  messageAttributeNames: ['createdAt','status','replyMessageId'],
  handleMessage: async (message) => {
    const replyMessageId = message.MessageAttributes?.replyMessageId.StringValue
    const status = message.MessageAttributes?.status.StringValue

    if (!replyMessageId || !status) return console.error('Unknown message received:\t', message)

    const body = JSON.parse(message.Body!)

    console.info(`Status received: replyMessageId=${replyMessageId}`)

    switch (status) {
      case Status.COMPLETED:
        db[replyMessageId] = {
          status,
          value: body.value
        }
        return
      case Status.FAILED:
        db[replyMessageId] = { status, error: message.Body}
        return
      default:
        throw new Error(`Unknown message received:\t${message}`)
    }

  }
})

fibStatusConsumer.on('error', console.error)
fibStatusConsumer.on('processing_error', console.error)


app.listen(5000, () => console.log('App running on port 5000'))
fibStatusConsumer.start()
