import AWS from 'aws-sdk';

export function constructStandardQueueMessage(
    statusQueueUrl: string,
    messageBody: string,
    messageAttributes?: AWS.SQS.MessageBodyAttributeMap): AWS.SQS.SendMessageRequest {
    return {
        QueueUrl: statusQueueUrl,
        MessageBody: messageBody,
        MessageAttributes: {
            ...messageAttributes,
            createdAt: {
                DataType: 'Number',
                StringValue: String(Date.now())
            },
        },
    };
}

export function constructFifoQueueMessage(
    statusQueueUrl: string,
    messageBody: string,
    messageGroupId: string,
    messageDeduplicationId: string,
    messageAttributes?: AWS.SQS.MessageBodyAttributeMap): AWS.SQS.SendMessageRequest {
    return {
        QueueUrl: statusQueueUrl,
        MessageBody: messageBody,
        MessageGroupId: messageGroupId,
        MessageDeduplicationId: messageDeduplicationId,
        MessageAttributes: {
            ...messageAttributes,
            createdAt: {
                DataType: 'Number',
                StringValue: String(Date.now())
            },
        },
    };
}
