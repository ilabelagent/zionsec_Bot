// AWS Services Mock for Local Testing
// Simulates AWS services for deployment testing

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand } from '@aws-sdk/client-sqs';

// LocalStack configuration for testing
const LOCAL_CONFIG = {
    endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
    },
    forcePathStyle: true, // Required for S3
};

// Mock S3 Client
export const mockS3 = new S3Client({
    ...LOCAL_CONFIG,
    endpoint: `${LOCAL_CONFIG.endpoint}`,
});

// Mock DynamoDB Client
export const mockDynamoDB = new DynamoDBClient({
    ...LOCAL_CONFIG,
    endpoint: `${LOCAL_CONFIG.endpoint}`,
});

// Mock Lambda Client
export const mockLambda = new LambdaClient({
    ...LOCAL_CONFIG,
    endpoint: `${LOCAL_CONFIG.endpoint}`,
});

// Mock SQS Client
export const mockSQS = new SQSClient({
    ...LOCAL_CONFIG,
    endpoint: `${LOCAL_CONFIG.endpoint}`,
});

// Mock Services Implementation
export const awsMockServices = {
    // S3 Operations
    async uploadToS3(bucket, key, body) {
        try {
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: body,
            });
            const result = await mockS3.send(command);
            console.log(`✅ Uploaded to S3: ${bucket}/${key}`);
            return result;
        } catch (error) {
            console.error('❌ S3 Upload Error:', error);
            throw error;
        }
    },

    async getFromS3(bucket, key) {
        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            const result = await mockS3.send(command);
            console.log(`✅ Retrieved from S3: ${bucket}/${key}`);
            return result;
        } catch (error) {
            console.error('❌ S3 Get Error:', error);
            throw error;
        }
    },

    // DynamoDB Operations
    async putToDynamoDB(tableName, item) {
        try {
            const command = new PutItemCommand({
                TableName: tableName,
                Item: item,
            });
            const result = await mockDynamoDB.send(command);
            console.log(`✅ Saved to DynamoDB: ${tableName}`);
            return result;
        } catch (error) {
            console.error('❌ DynamoDB Put Error:', error);
            throw error;
        }
    },

    async getFromDynamoDB(tableName, key) {
        try {
            const command = new GetItemCommand({
                TableName: tableName,
                Key: key,
            });
            const result = await mockDynamoDB.send(command);
            console.log(`✅ Retrieved from DynamoDB: ${tableName}`);
            return result;
        } catch (error) {
            console.error('❌ DynamoDB Get Error:', error);
            throw error;
        }
    },

    // Lambda Operations
    async invokeLambda(functionName, payload) {
        try {
            const command = new InvokeCommand({
                FunctionName: functionName,
                Payload: JSON.stringify(payload),
            });
            const result = await mockLambda.send(command);
            console.log(`✅ Invoked Lambda: ${functionName}`);
            return result;
        } catch (error) {
            console.error('❌ Lambda Invoke Error:', error);
            throw error;
        }
    },

    // SQS Operations
    async sendToSQS(queueUrl, message) {
        try {
            const command = new SendMessageCommand({
                QueueUrl: queueUrl,
                MessageBody: JSON.stringify(message),
            });
            const result = await mockSQS.send(command);
            console.log(`✅ Sent to SQS: ${queueUrl}`);
            return result;
        } catch (error) {
            console.error('❌ SQS Send Error:', error);
            throw error;
        }
    },

    async receiveFromSQS(queueUrl) {
        try {
            const command = new ReceiveMessageCommand({
                QueueUrl: queueUrl,
                MaxNumberOfMessages: 10,
            });
            const result = await mockSQS.send(command);
            console.log(`✅ Received from SQS: ${queueUrl}`);
            return result;
        } catch (error) {
            console.error('❌ SQS Receive Error:', error);
            throw error;
        }
    },
};

// Test function to verify AWS services
export async function testAWSServices() {
    console.log('\n🧪 Testing AWS Mock Services...\n');
    
    try {
        // Test S3
        await awsMockServices.uploadToS3(
            'test-bucket',
            'test-file.json',
            JSON.stringify({ test: 'data' })
        );
        
        // Test DynamoDB
        await awsMockServices.putToDynamoDB('test-table', {
            id: { S: 'test-id' },
            data: { S: 'test-data' },
        });
        
        // Test SQS
        await awsMockServices.sendToSQS(
            'http://localhost:4566/000000000000/test-queue',
            { message: 'test' }
        );
        
        console.log('\n✅ All AWS mock services are working!\n');
    } catch (error) {
        console.error('\n❌ AWS mock services test failed:', error);
    }
}

export default awsMockServices;