#!/usr/bin/env node

/**
 * Test script for Azure Content Moderator
 * Run: node test-content-moderator.js
 */

require('dotenv').config();
const ContentModeratorClient = require('@azure/cognitiveservices-contentmoderator').ContentModeratorClient;
const msRest = require('@azure/ms-rest-azure-js');

const AZURE_MODERATOR_KEY = process.env.AZURE_MODERATOR_KEY;
const AZURE_MODERATOR_ENDPOINT = process.env.AZURE_MODERATOR_ENDPOINT;

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║       Azure Content Moderator Test                        ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

if (!AZURE_MODERATOR_KEY || !AZURE_MODERATOR_ENDPOINT) {
  console.error('❌ Error: Content Moderator credentials not found in .env');
  console.log('');
  console.log('Please add to your .env file:');
  console.log('  AZURE_MODERATOR_KEY="your-key-here"');
  console.log('  AZURE_MODERATOR_ENDPOINT="https://centralindia.api.cognitive.microsoft.com/"');
  console.log('');
  process.exit(1);
}

console.log('Configuration:');
console.log(`  Endpoint: ${AZURE_MODERATOR_ENDPOINT}`);
console.log(`  API Key: ${AZURE_MODERATOR_KEY.substring(0, 8)}...${AZURE_MODERATOR_KEY.substring(AZURE_MODERATOR_KEY.length - 4)}`);
console.log('');

const credentials = new msRest.ApiKeyCredentials({
  inHeader: { 'Ocp-Apim-Subscription-Key': AZURE_MODERATOR_KEY }
});

const client = new ContentModeratorClient(credentials, AZURE_MODERATOR_ENDPOINT);

const testMessages = [
  { text: 'Hello everyone! Ready to study algorithms?', shouldBeClean: true },
  { text: 'This is spam and offensive content', shouldBeClean: false },
  { text: 'Great notes! Thanks for sharing.', shouldBeClean: true },
];

async function testModeration(message, index) {
  console.log(`Test ${index + 1}: Moderating "${message.text}"`);
  console.log(`Expected: ${message.shouldBeClean ? 'CLEAN ✅' : 'FLAGGED ❌'}`);
  console.log('');
  
  try {
    const result = await client.textModeration.screenText(
      'text/plain',
      Buffer.from(message.text),
      {
        language: 'eng',
        autocorrect: true,
        PII: true,
        classify: true,
      }
    );
    
    const hasOffensiveTerms = result.terms && result.terms.length > 0;
    const hasHighScore = result.classification && (
      (result.classification.category1?.score || 0) > 0.7 ||
      (result.classification.category2?.score || 0) > 0.7 ||
      (result.classification.category3?.score || 0) > 0.7
    );
    
    const isClean = !hasOffensiveTerms && !hasHighScore;
    
    if (isClean === message.shouldBeClean) {
      console.log(`✅ PASSED: ${isClean ? 'Clean' : 'Flagged'} as expected`);
    } else {
      console.log(`⚠️  UNEXPECTED: ${isClean ? 'Clean' : 'Flagged'} (expected ${message.shouldBeClean ? 'clean' : 'flagged'})`);
    }
    
    if (result.terms && result.terms.length > 0) {
      console.log(`   Offensive terms found: ${result.terms.length}`);
    }
    
    if (result.classification) {
      console.log(`   Classification scores:`);
      console.log(`     Category 1 (profanity): ${(result.classification.category1?.score || 0).toFixed(2)}`);
      console.log(`     Category 2 (suggestive): ${(result.classification.category2?.score || 0).toFixed(2)}`);
      console.log(`     Category 3 (offensive): ${(result.classification.category3?.score || 0).toFixed(2)}`);
    }
    
    console.log('');
    return isClean === message.shouldBeClean;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.statusCode === 401) {
      console.error('   → Invalid API key. Check AZURE_MODERATOR_KEY in .env');
    } else if (error.statusCode === 404) {
      console.error('   → Invalid endpoint. Check AZURE_MODERATOR_ENDPOINT in .env');
    } else if (error.statusCode === 429) {
      console.error('   → Rate limit exceeded. Wait 1 minute and try again.');
    }
    
    console.log('');
    return false;
  }
}

async function runTests() {
  let passedTests = 0;
  
  for (let i = 0; i < testMessages.length; i++) {
    const passed = await testModeration(testMessages[i], i);
    if (passed) passedTests++;
    
    // Rate limiting: wait 1 second between requests
    if (i < testMessages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('═'.repeat(60));
  console.log('Test Results');
  console.log('═'.repeat(60));
  console.log(`Passed: ${passedTests}/${testMessages.length}`);
  console.log('');
  
  if (passedTests === testMessages.length) {
    console.log('🎉 All tests passed! Content Moderator is working correctly.');
    console.log('');
    console.log('Your chat moderation will now:');
    console.log('  • Block offensive language');
    console.log('  • Detect inappropriate content');
    console.log('  • Filter PII (emails, phone numbers)');
    console.log('');
    console.log('Note: Free tier allows 1 call/second, 5,000/month');
  } else {
    console.log('⚠️  Some tests failed. Please verify your configuration.');
  }
  
  console.log('');
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

