import AWS, { SQS } from 'aws-sdk'
import express from 'express'
import { Consumer } from 'sqs-consumer'

import { constructStandardQueueMessage } from '../../common/sqs'
import { Status } from '../../types/common'
import { fibonacci } from './fibonacci'

const awsRegion = process.env.AWS_REGION as string
const taskQueueUrl = process.env.TASK_QUEUE_URL as string
const statusQueueUrl = process.env.STATUS_QUEUE_URL as string

const app = express()
app.get('/', (_, res) => res.send('hello from worker'))
app.listen(4000, () => console.log('Worker running on port 4000'))

AWS.config.update({ region: awsRegion })
const sqs = new AWS.SQS()

const fibTaskConsumer = Consumer.create({
    sqs: sqs,
    queueUrl: taskQueueUrl,
    waitTimeSeconds: 3,
    visibilityTimeout: 10,
    messageAttributeNames: ['createdAt','requestId'],
    handleMessage: async (message) => {
        // Receive argument
        const N = Number(message.Body)
        const messageId = message.MessageId
        
        if (!messageId) return console.error('Unknown message received:\t', message)

        console.info(`Processing:\trequestId=${messageId}`)

        let reply
        try {
            // Attempt to perform some long-running task
            const fib = await fibonacci(N)
            reply = constructStandardQueueMessage(
                statusQueueUrl,
                JSON.stringify({
                    arg: N,
                    value: fib
                }), {
                    status: {
                        DataType: 'String',
                        StringValue: Status.COMPLETED
                    },
                    replyMessageId: {
                        DataType: 'String',
                        StringValue: messageId
                    }
                  }
            )
        } catch {
            // Task failed
            reply = constructStandardQueueMessage(
                statusQueueUrl,
                JSON.stringify({ message: `Invalid request in message.Body:${message.Body}`}), {
                    status: {
                        DataType: 'String',
                        StringValue: Status.FAILED
                    },
                    replyMessageId: {
                        DataType: 'String',
                        StringValue: messageId
                      }
                  }
            )
        } finally {
            // Send the reply
            await sqs.sendMessage(reply as AWS.SQS.SendMessageRequest).promise()
            return
        }
    }
})

fibTaskConsumer.on('error', console.error)
fibTaskConsumer.on('processing_error', console.error)

fibTaskConsumer.start()
