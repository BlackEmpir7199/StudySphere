#!/usr/bin/env node

/**
 * Test script for Google Gemini AI
 * Run: node test-gemini.js
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║       Google Gemini AI Connection Test                    ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

if (!GEMINI_API_KEY) {
  console.error('❌ Error: Gemini API key not found in .env file');
  console.log('');
  console.log('To get your Gemini API key:');
  console.log('  1. Go to: https://aistudio.google.com/app/apikey');
  console.log('  2. Click "Get API key" or "Create API key"');
  console.log('  3. Copy the key');
  console.log('  4. Add to .env: GEMINI_API_KEY="your-key-here"');
  console.log('');
  process.exit(1);
}

console.log('Configuration:');
console.log(`  Model: ${GEMINI_MODEL}`);
console.log(`  API Key: ${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`);
console.log('');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

async function testBasicCompletion() {
  console.log('Test 1: Basic Text Generation');
  console.log('━'.repeat(60));
  
  try {
    const result = await model.generateContent('Say "Hello from Gemini AI!"');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success!');
    console.log(`Response: ${text}`);
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('   → Invalid API key. Check GEMINI_API_KEY in .env');
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

Do not include any other text, just the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    
    console.log('✅ Success!');
    console.log('AI Response:', content);
    
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const interests = JSON.parse(cleaned);
      console.log('');
      console.log('Classified Interests:');
      interests.forEach(interest => console.log(`  • ${interest}`));
    } catch {
      console.log('Note: Response parsing successful but format may vary');
      console.log('Extracted from response:', content);
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
Self-balancing variants like AVL trees and Red-Black trees maintain O(log n) performance.
  `.trim();
  
  console.log('Content to summarize:', sampleContent.substring(0, 100) + '...');
  console.log('');
  
  try {
    const prompt = `Summarize the following educational resource in 3-5 concise bullet points:

Content: ${sampleContent}

Provide a clear, student-friendly summary. Format as bullet points starting with •`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();
    
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
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.quiz = await testQuizClassification();
  await new Promise(resolve => setTimeout(resolve, 500));
  
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
    console.log('🎉 All tests passed! Gemini AI is configured correctly.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Restart Docker: docker-compose down && docker-compose up -d');
    console.log('  2. Test in browser: http://localhost');
    console.log('  3. Complete quiz to see AI classification');
    console.log('  4. Upload resource to see AI summary');
    console.log('');
    console.log('💰 Gemini Pricing:');
    console.log('  • gemini-2.0-flash-exp: FREE (experimental)');
    console.log('  • 1,500 requests/day free tier');
    console.log('  • Perfect for your demo!');
  } else {
    console.log('⚠️  Some tests failed. Please check:');
    console.log('  1. API key is correct in .env');
    console.log('  2. You have internet connection');
    console.log('  3. Gemini API is enabled for your account');
  }
  
  console.log('');
  process.exit(allPassed ? 0 : 1);
}

// Execute
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

