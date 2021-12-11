# CDK S3 Batch Operations

## Prerequisites
- Node.js
- AWS CLI

## Setup
- Download this repo on your local machine
- Install AWS Cloud Development Kit (CDK): npm install -g aws-cdk
- Install Projen : npm install -g projen
- Go to folder cdk-s3-batch-perations and run: npx projen build

## Deployment
- configure AWS Credentials or AWS_PROFILE env
- Run "cdk bootstrap"
- Run "npx projen deploy" to deploy stack

## How to use
- Go to the Amazon S3 bucket "S3BatchOperations-existingcontentbucketxxxx" create by the stack and upload few files.
- Go to the Amazon S3 bucket "S3BatchOperations-inventoryandlogsxxxxx" and upload a csv file containing the list of item names you just uploaded to the bucket "S3BatchOperations-existingcontentbucketxxxx". CSV file should have two columns bucketName,objectName. 
- Go to S3 in AWS Console and click on Batch Operations.
- Click on Create job, select CSV or S3 inventory report and click Next.
- Under Choose operation: select Invoke AWS Lambda function.
- Under Invoke AWS Lambda function: select "S3BatchOperations-S3BatchProcessorxxxx" and click Next.
- Under path to completion report destination: browse and select Amazon S3 bucket "S3BatchOperations-inventoryandlogsxxxxx".
- Under Permissions: for IAM role, select "S3BatchOperations-S3BatchOperationRolexxxx" and click Next.
- Review and click Create job.
- From Amazon S3 Batch operations page, click on the Job ID link for the job you just created.
- Click "Confirm and run" and then "Run job".
- From S3 Batch operations page, click refresh to see the job status.
- Go to S3 bucket "S3BatchOperations-inventoryandlogsxxxxx" and you should see output generated for items in your list.

