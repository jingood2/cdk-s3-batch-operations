import * as path from 'path';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import { App, Construct, Duration, Stack, StackProps } from '@aws-cdk/core';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // define resources here...
    const s3BatchOperationsRole = new iam.Role(this, 'S3BatchOperationsRole', {
      assumedBy: new iam.ServicePrincipal('batchoperations.s3.amazonaws.com'),
    });

    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    /* lambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:*'],
        resources: ['*'],
      }),
    );
 */
    const existingContentBucket = new s3.Bucket(this, 'ExisitingContentBucket', { versioned: false } );
    existingContentBucket.grantReadWrite(lambdaExecutionRole);

    const inventoryAndLogsBucket = new s3.Bucket(this, 'InventoryAndLogsBucket', { versioned: false });
    inventoryAndLogsBucket.grantReadWrite(s3BatchOperationsRole);

    // S3 Batch Operations Event processor
    const s3BatchProcessor = new lambda.Function(this, 'S3BatchProcessor', {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda/s3batchprocessor')),
      handler: 'lambda_function.lambda_handler',
      timeout: Duration.seconds(30),
      role: lambdaExecutionRole,
      environment: {
        OUTPUT_BUCKET: existingContentBucket.bucketName,
      },
      reservedConcurrentExecutions: 1,
    });

    s3BatchProcessor.grantInvoke(s3BatchOperationsRole);
    s3BatchOperationsRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'lambda:*',
          's3:*',
        ],
        resources: ['*'],
      }),
    );
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'S3BatchOperations', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();