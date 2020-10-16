#!/bin/bash
set -x

awslocal sqs create-queue --queue-name FibonacciTaskQueue --region ap-southeast-1 --attributes '{
    "VisibilityTimeout": "7",
    "MessageRetentionPeriod": "60",
    "ReceiveMessageWaitTimeSeconds": "20"
}'

awslocal sqs create-queue --queue-name FibonacciStatusQueue --region ap-southeast-1 --attributes '{
    "VisibilityTimeout": "7",
    "MessageRetentionPeriod": "60",
    "ReceiveMessageWaitTimeSeconds": "20"
}'

# awslocal sqs create-queue --queue-name TaskQueue.fifo --region ap-southeast-1 --attributes '{
#     "FifoQueue": "true",
#     "VisibilityTimeout": "10",
#     "ContentBasedDeduplication": "false",
#     "MessageRetentionPeriod": "20",
#     "ReceiveMessageWaitTimeSeconds": "5"
# }'

# awslocal sqs create-queue --queue-name StatusQueue.fifo --region ap-southeast-1 --attributes '{
#     "FifoQueue": "true",
#     "VisibilityTimeout": "10",
#     "ContentBasedDeduplication": "false",
#     "MessageRetentionPeriod": "20",
#     "ReceiveMessageWaitTimeSeconds": "5"
# }'

set +x
