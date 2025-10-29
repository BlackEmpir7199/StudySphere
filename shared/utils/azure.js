const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Google Gemini Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

// Azure Content Moderator Configuration
const AZURE_MODERATOR_KEY = process.env.AZURE_MODERATOR_KEY;
const AZURE_MODERATOR_ENDPOINT = process.env.AZURE_MODERATOR_ENDPOINT;

// Initialize Gemini client
let genAI = null;
let geminiModel = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  geminiModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  console.log(`✅ Gemini AI initialized with model: ${GEMINI_MODEL}`);
} else {
  console.warn('⚠️  Gemini API key not configured, using mock responses');
}

// Check Azure Content Moderator configuration
let azureModeratorEnabled = false;
if (AZURE_MODERATOR_KEY && AZURE_MODERATOR_ENDPOINT) {
  azureModeratorEnabled = true;
  console.log('✅ Azure Content Moderator configured');
} else {
  console.warn('⚠️  Azure Content Moderator not configured, using enhanced fallback moderation');
  if (!AZURE_MODERATOR_KEY) console.warn('   Missing: AZURE_MODERATOR_KEY');
  if (!AZURE_MODERATOR_ENDPOINT) console.warn('   Missing: AZURE_MODERATOR_ENDPOINT');
}

/**
 * Classify quiz answers into interest categories using Google Gemini
 * @param {Array<string>} answers - User's quiz answers
 * @returns {Promise<Array<string>>} Array of classified interests
 */
async function classifyQuizAnswers(answers) {
  if (!geminiModel) {
    console.warn('Gemini API not configured, returning mock interests');
    return ['Computer Science', 'Mathematics', 'Programming'];
  }

  try {
    const prompt = `You are an educational assistant that classifies student interests based on quiz answers.

Quiz Answers:
${answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Based on these answers, identify 3-5 specific academic interests or subject areas the student is interested in.
Return ONLY a JSON array of interests, for example: ["Computer Science", "Algorithms", "Mathematics", "Machine Learning"]

Do not include any other text, just the JSON array.`;

    console.log('📤 Sending to Gemini for classification...');
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    
    console.log('📥 Gemini response:', content);
    
    // Parse JSON response
    try {
      // Remove markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const interests = JSON.parse(cleaned);
      return Array.isArray(interests) ? interests : [];
    } catch (parseError) {
      // Fallback: extract interests from text
      const matches = content.match(/\[([^\]]+)\]/);
      if (matches) {
        const parsed = JSON.parse(matches[0]);
        return Array.isArray(parsed) ? parsed : [];
      }
      // Last resort: extract quoted strings
      const quotedStrings = content.match(/"([^"]+)"/g);
      if (quotedStrings) {
        return quotedStrings.map(s => s.replace(/"/g, '')).slice(0, 5);
      }
      return answers.filter(a => a && a.length > 2).slice(0, 5);
    }
  } catch (error) {
    console.error('Error classifying quiz answers:', error.message);
    // Fallback to basic classification
    return answers.filter(a => a && a.length > 2).slice(0, 5);
  }
}

/**
 * Moderate text content using Azure Content Moderator REST API or fallback
 * @param {string} text - Text to moderate
 * @returns {Promise<Object>} Moderation result with isClean and reason
 */
async function moderateContent(text) {
  // Try Azure Content Moderator first, fallback to simple moderation
  if (!azureModeratorEnabled) {
    return simpleModerate(text);
  }

  try {
    // Call Azure Content Safety API (NEW API)
    const url = `${AZURE_MODERATOR_ENDPOINT}/contentsafety/text:analyze?api-version=2024-09-15-preview`;
    
    const response = await axios.post(url, {
      text: text,
      categories: ['Hate', 'SelfHarm', 'Sexual', 'Violence'],
      outputType: 'FourSeverityLevels',
      haltOnBlocklistHit: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': AZURE_MODERATOR_KEY,
      },
      timeout: 5000, // 5 second timeout
    });

    const result = response.data;

    // NEW API Response Format:
    // categoriesAnalysis: [{category: 'Hate', severity: 0-6}]
    // blocklistsMatch: [{blocklistName, blocklistItemId, blocklistItemText}]
    
    const categories = result.categoriesAnalysis || [];
    const blocklistsMatch = result.blocklistsMatch || [];
    
    // Log moderation results for debugging
    console.log('🛡️  Azure Content Safety Results:', {
      hate: categories.find(c => c.category === 'Hate')?.severity || 0,
      selfHarm: categories.find(c => c.category === 'SelfHarm')?.severity || 0,
      sexual: categories.find(c => c.category === 'Sexual')?.severity || 0,
      violence: categories.find(c => c.category === 'Violence')?.severity || 0,
      blockedTerms: blocklistsMatch.length,
    });

    // Severity levels: 0 (safe), 2 (low), 4 (medium), 6 (high)
    // Flag if ANY category has severity >= 2 (very strict for educational platform)
    const SEVERITY_THRESHOLD = 1; // Flag if severity is 2 or higher
    
    const flaggedCategories = categories.filter(c => c.severity >= SEVERITY_THRESHOLD);
    const hasBlockedTerms = blocklistsMatch.length > 0;
    
    // Content is flagged if any condition is met
    const isClean = flaggedCategories.length === 0 && !hasBlockedTerms;

    // Determine specific reason for moderation
    let reason = null;
    let detectedIssues = [];
    
    if (!isClean) {
      if (hasBlockedTerms) {
        const blockedWords = blocklistsMatch.map(b => b.blocklistItemText).slice(0, 3);
        reason = `Contains blocked terms: ${blockedWords.join(', ')}`;
        detectedIssues.push('Blocked terms');
      }
      
      if (flaggedCategories.length > 0) {
        const worst = flaggedCategories.sort((a, b) => b.severity - a.severity)[0];
        if (!reason) {
          if (worst.category === 'Hate') {
            reason = `Contains hate speech (severity: ${worst.severity}/6)`;
          } else if (worst.category === 'Sexual') {
            reason = `Contains sexual content (severity: ${worst.severity}/6)`;
          } else if (worst.category === 'Violence') {
            reason = `Contains violent content (severity: ${worst.severity}/6)`;
          } else if (worst.category === 'SelfHarm') {
            reason = `Contains self-harm content (severity: ${worst.severity}/6)`;
          }
        }
        detectedIssues = flaggedCategories.map(c => `${c.category}:${c.severity}`);
      }
    }

    return { 
      isClean, 
      reason,
      details: {
        categories: {
          hate: categories.find(c => c.category === 'Hate')?.severity || 0,
          selfHarm: categories.find(c => c.category === 'SelfHarm')?.severity || 0,
          sexual: categories.find(c => c.category === 'Sexual')?.severity || 0,
          violence: categories.find(c => c.category === 'Violence')?.severity || 0,
        },
        detectedIssues,
        blockedTermsCount: blocklistsMatch.length,
        source: 'azure-content-safety',
      }
    };
  } catch (error) {
    console.error('❌ Azure Content Moderator error:', error.response?.data || error.message);
    console.warn('⚠️  Falling back to enhanced simple moderation');
    // Fallback to simple moderation if Azure fails
    return simpleModerate(text);
  }
}

/**
 * Simple text-based moderation fallback (when Azure is not configured)
 * @param {string} text - Text to moderate
 * @returns {Object} Moderation result
 */
function simpleModerate(text) {
  // Educational platform content filters
  const offensivePatterns = {
    spam: ['spam', 'scam', 'phishing', 'buy now', 'click here', 'limited time'],
    harassment: ['hate', 'abuse', 'bully', 'harass', 'threaten', 'attack'],
    violence: ['violence', 'kill', 'hurt', 'harm', 'weapon', 'attack'],
    explicit: ['sex', 'porn', 'explicit', 'nsfw'],
    drugs: ['drug', 'weed', 'cocaine', 'marijuana'],
    profanity: ['fuck', 'shit', 'damn', 'bitch', 'ass', 'hell'],
  };

  const lowerText = text.toLowerCase();
  let detectedCategory = null;
  
  // Check each category
  for (const [category, words] of Object.entries(offensivePatterns)) {
    for (const word of words) {
      // Use word boundaries to avoid false positives
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lowerText)) {
        detectedCategory = category;
        break;
      }
    }
    if (detectedCategory) break;
  }

  // Check for excessive caps (potential spam/shouting)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  const isExcessiveCaps = text.length > 10 && capsRatio > 0.7;

  // Check for repeated characters (spam pattern)
  const hasRepeatedChars = /(.)\1{4,}/.test(text);

  // Check for suspicious URLs (basic check)
  // Allow whitelisted domains like Google Meet, Zoom, Drive, GitHub, etc.
  const urlRegex = /http[s]?:\/\/([^\s\/]+)/gi;
  const urls = text.match(urlRegex) || [];
  const whitelist = ['meet.google.com', 'zoom.us', 'drive.google.com', 'github.com', 'stackoverflow.com', 'docs.google.com'];
  const hasSuspiciousUrl = urls.some(url => {
    const domain = url.toLowerCase().replace(/https?:\/\//, '');
    return !whitelist.some(allowed => domain.includes(allowed));
  });

  const hasIssue = detectedCategory || isExcessiveCaps || hasRepeatedChars || hasSuspiciousUrl;

  let reason = null;
  if (hasIssue) {
    if (detectedCategory === 'spam') reason = 'Contains spam or promotional content';
    else if (detectedCategory === 'harassment') reason = 'Contains harassment or threatening language';
    else if (detectedCategory === 'violence') reason = 'Contains violent content';
    else if (detectedCategory === 'explicit') reason = 'Contains explicit content';
    else if (detectedCategory === 'drugs') reason = 'Contains drug-related content';
    else if (detectedCategory === 'profanity') reason = 'Contains profanity';
    else if (isExcessiveCaps) reason = 'Excessive use of capital letters';
    else if (hasRepeatedChars) reason = 'Contains spam patterns';
    else if (hasSuspiciousUrl) reason = 'Contains suspicious link';
  }

  console.log(`🔍 Simple Moderation: ${hasIssue ? '❌ FLAGGED' : '✅ CLEAN'} - ${reason || 'No issues'}`);

  return {
    isClean: !hasIssue,
    reason,
    details: {
      detectedCategory,
      isExcessiveCaps,
      hasRepeatedChars,
      hasSuspiciousUrl,
      source: 'fallback',
    }
  };
}

/**
 * Summarize resource content using Google Gemini
 * @param {string} title - Resource title
 * @param {string} content - Resource content to summarize
 * @returns {Promise<string>} Bullet-point summary
 */
async function summarizeResource(title, content) {
  if (!geminiModel) {
    console.warn('Gemini API not configured, returning mock summary');
    return `• Summary for: ${title}\n• Key concepts extracted from content\n• Main topics covered`;
  }

  try {
    const prompt = `Summarize the following educational resource in 3-5 concise bullet points:

Title: ${title}

Content:
${content.substring(0, 3000)} ${content.length > 3000 ? '...' : ''}

Provide a clear, student-friendly summary with the most important concepts and takeaways.
Format as bullet points starting with • (bullet character).`;

    console.log('📤 Sending to Gemini for summarization...');
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();
    
    console.log('📥 Gemini summary generated');
    return summary;
  } catch (error) {
    console.error('Error summarizing resource:', error.message);
    return `• Summary for: ${title}\n• Content summary unavailable\n• Please review the full resource`;
  }
}

/**
 * Generate study suggestions based on user interests using Google Gemini
 * @param {Array<string>} interests - User's interests
 * @returns {Promise<Array<string>>} Study group suggestions
 */
async function generateStudySuggestions(interests) {
  if (!geminiModel) {
    return interests.map(i => `${i} Study Group`);
  }

  try {
    const prompt = `Based on these student interests: ${interests.join(', ')}

Suggest 5 relevant study group names and topics that would be beneficial. 
Return ONLY a JSON array of strings.
Example: ["Advanced Algorithms Study Circle", "Machine Learning Practical Projects", ...]

Do not include any other text, just the JSON array.`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    
    try {
      // Remove markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const suggestions = JSON.parse(cleaned);
      return Array.isArray(suggestions) ? suggestions : interests.map(i => `${i} Study Group`);
    } catch {
      return interests.map(i => `${i} Study Group`);
    }
  } catch (error) {
    console.error('Error generating suggestions:', error.message);
    return interests.map(i => `${i} Study Group`);
  }
}

/**
 * Generate AI response for chat messages using Google Gemini
 * @param {string} prompt - User's prompt/question
 * @returns {Promise<string>} AI response
 */
async function generateAIResponse(prompt) {
  if (!geminiModel) {
    console.warn('Gemini API not configured, returning mock response');
    return "I'm Sphere, your AI study assistant! I'm here to help with your academic questions. However, I'm currently in demo mode. Please configure the Gemini API for full functionality.";
  }

  try {
    const systemPrompt = `You are Sphere, an AI study assistant for StudySphere, a collaborative study platform for college students. 

Your role:
- Help students with academic questions and study guidance
- Provide clear, educational explanations
- Suggest study strategies and resources
- Be encouraging and supportive
- Keep responses concise but helpful (2-3 sentences max for most queries)
- For complex topics, break them down into digestible parts

User prompt: ${prompt}

Respond as Sphere with a helpful, educational tone.`;

    console.log('📤 Sending to Gemini for AI response...');
    const result = await geminiModel.generateContent(systemPrompt);
    const response = await result.response;
    const aiResponse = response.text().trim();
    
    console.log('📥 Gemini AI response generated');
    return aiResponse;
  } catch (error) {
    console.error('Error generating AI response:', error.message);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact support if the issue persists.";
  }
}

module.exports = {
  classifyQuizAnswers,
  moderateContent,
  simpleModerate,
  summarizeResource,
  generateStudySuggestions,
  generateAIResponse,
};

