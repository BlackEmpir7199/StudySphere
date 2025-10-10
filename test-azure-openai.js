#!/usr/bin/env node

/**
 * Test script for Azure OpenAI connection
 * Run: node test-azure-openai.js
 */

require('dotenv').config();
const { OpenAI } = require('openai');

// Get from .env file
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║       Azure OpenAI Connection Test                        ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

// Check if keys are configured
if (!AZURE_OPENAI_KEY || !AZURE_OPENAI_ENDPOINT) {
  console.error('❌ Error: Azure OpenAI credentials not found in .env file');
  console.log('');
  console.log('Please add to your .env file:');
  console.log('  AZURE_OPENAI_KEY="your-key-here"');
  console.log('  AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"');
  console.log('  AZURE_OPENAI_DEPLOYMENT="gpt-4o-mini"');
  console.log('');
  process.exit(1);
}

console.log('Configuration:');
console.log(`  Endpoint: ${AZURE_OPENAI_ENDPOINT}`);
console.log(`  Deployment: ${AZURE_OPENAI_DEPLOYMENT}`);
console.log(`  API Key: ${AZURE_OPENAI_KEY.substring(0, 8)}...${AZURE_OPENAI_KEY.substring(AZURE_OPENAI_KEY.length - 4)}`);
console.log('');

const client = new OpenAI({
  apiKey: AZURE_OPENAI_KEY,
  baseURL: `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
  defaultHeaders: { 'api-key': AZURE_OPENAI_KEY },
});

async function testBasicCompletion() {
  console.log('Test 1: Basic Text Completion');
  console.log('━'.repeat(60));
  
  try {
    const response = await client.chat.completions.create({
      model: AZURE_OPENAI_DEPLOYMENT,
      messages: [
        { role: 'user', content: 'Say "Hello from Azure OpenAI!"' }
      ],
      max_tokens: 50
    });
    
    console.log('✅ Success!');
    console.log(`Response: ${response.choices[0].message.content}`);
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
    return false;
  }
}

async function testQuizClassification() {
  console.log('Test 2: Quiz Classification (Use Case 1)');
  console.log('━'.repeat(60));
  
  const quizAnswers = [
    'Computer Science',
    'Machine Learning',
    'Evening',
    'Group study',
    'Project-based'
  ];
  
  console.log('Quiz Answers:', quizAnswers.join(', '));
  console.log('');
  
  try {
    const prompt = `You are an educational assistant that classifies student interests based on quiz answers.

Quiz Answers:
${quizAnswers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Based on these answers, identify 3-5 specific academic interests or subject areas.
Return ONLY a JSON array of interests, for example: ["Computer Science", "Algorithms", "Mathematics"]

Interests:`;

    const response = await client.chat.completions.create({
      model: AZURE_OPENAI_DEPLOYMENT,
      messages: [
        { role: 'system', content: 'You are a helpful educational assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });
    
    const content = response.choices[0].message.content.trim();
    console.log('✅ Success!');
    console.log('AI Response:', content);
    
    try {
      const interests = JSON.parse(content);
      console.log('');
      console.log('Classified Interests:');
      interests.forEach(interest => console.log(`  • ${interest}`));
    } catch {
      console.log('Note: Response parsing may need adjustment');
    }
    
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.log('');
    return false;
  }
}

async function testResourceSummarization() {
  console.log('Test 3: Resource Summarization (Use Case 3)');
  console.log('━'.repeat(60));
  
  const sampleContent = `
Binary Search Trees (BST) are fundamental data structures in computer science.
A BST is a node-based structure where each node has at most two children.
The left child must be less than the parent, and the right child must be greater.
This property enables efficient searching, insertion, and deletion operations.
Time complexity is O(log n) on average but can degrade to O(n) in worst case.
  `.trim();
  
  console.log('Content to summarize:', sampleContent.substring(0, 100) + '...');
  console.log('');
  
  try {
    const prompt = `Summarize the following educational resource in 3-5 concise bullet points:

Content: ${sampleContent}

Provide a clear, student-friendly summary. Format as bullet points starting with •`;

    const response = await client.chat.completions.create({
      model: AZURE_OPENAI_DEPLOYMENT,
      messages: [
        { role: 'system', content: 'You are a helpful educational assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 300,
    });
    
    const summary = response.choices[0].message.content.trim();
    console.log('✅ Success!');
    console.log('AI Summary:');
    console.log(summary);
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.log('');
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = {
    basic: false,
    quiz: false,
    summarize: false
  };
  
  results.basic = await testBasicCompletion();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  
  results.quiz = await testQuizClassification();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.summarize = await testResourceSummarization();
  
  // Summary
  console.log('═'.repeat(60));
  console.log('Test Summary');
  console.log('═'.repeat(60));
  console.log(`Basic Completion:        ${results.basic ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Quiz Classification:     ${results.quiz ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Resource Summarization:  ${results.summarize ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('');
  
  const allPassed = results.basic && results.quiz && results.summarize;
  
  if (allPassed) {
    console.log('🎉 All tests passed! Azure OpenAI is configured correctly.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Restart Docker: docker-compose down && docker-compose up -d');
    console.log('  2. Test in browser: http://localhost');
    console.log('  3. Complete quiz to see AI classification');
    console.log('  4. Upload resource to see AI summary');
  } else {
    console.log('⚠️  Some tests failed. Please check:');
    console.log('  1. API keys are correct in .env');
    console.log('  2. Deployment name matches (gpt-4o-mini)');
    console.log('  3. Endpoint URL is correct');
    console.log('  4. You have quota remaining');
  }
  
  console.log('');
  process.exit(allPassed ? 0 : 1);
}

// Execute
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

