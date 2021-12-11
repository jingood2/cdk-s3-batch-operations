import json
import os
import uuid
import urllib
import boto3

def processRequest(request):

    output = ""

    print("request: {}".format(request))

    bucketName = request["bucketName"]
    objectName = request["objectName"]
    outputBucket = request["outputBucket"]

    jobId = request["jobId"]
    invocationId = request['invocationId']
    invocationSchemaVersion = request['invocationSchemaVersion']
    taskId = request['taskId']

    print("Input Object: {}/{}".format(bucketName, objectName))

    s3 = boto3.client('s3');

    copy_source = {'Bucket': bucketName, 'Key': objectName }
    newObjectName = 'rename/'+ str(uuid.uuid1())
    s3.copy_object(CopySource = copy_source, Bucket = outputBucket, Key = newObjectName)
    s3.delete_object(Bucket = bucketName, Key = objectName)

    results = [{
        'taskId': taskId,
        'resultCode': 'Succeeded',
        'resultString': "rename Object key from {} to {}".format(objectName,newObjectName)
    }]
    
    return {
        'invocationSchemaVersion': invocationSchemaVersion,
        'treatMissingKeysAs': 'PermanentFailure',
        'invocationId': invocationId,
        'results': results
    }

def lambda_handler(event, context):

    print("event: {}".format(event))

    request = {}

    # Parse job parameters
    request["jobId"] = event['job']['id']
    request["invocationId"] = event['invocationId']
    request["invocationSchemaVersion"] = event['invocationSchemaVersion']

    # Task
    request["task"] = event['tasks'][0]
    request["taskId"] = event['tasks'][0]['taskId']
    request["objectName"] = urllib.parse.unquote_plus(event['tasks'][0]['s3Key'])
    request["s3VersionId"] = event['tasks'][0]['s3VersionId']
    request["s3BucketArn"] = event['tasks'][0]['s3BucketArn']
    request["bucketName"] = request["s3BucketArn"].split(':')[-1]

    request["outputBucket"] = os.environ['OUTPUT_BUCKET']

    return processRequest(request)