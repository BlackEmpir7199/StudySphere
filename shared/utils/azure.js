const { GoogleGenerativeAI } = require('@google/generative-ai');
const ContentModeratorClient = require('@azure/cognitiveservices-contentmoderator').ContentModeratorClient;
const msRest = require('@azure/ms-rest-azure-js');

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

// Initialize Content Moderator client
let moderatorClient = null;
if (AZURE_MODERATOR_KEY && AZURE_MODERATOR_ENDPOINT) {
  try {
    const credentials = new msRest.ApiKeyCredentials({
      inHeader: { 'Ocp-Apim-Subscription-Key': AZURE_MODERATOR_KEY }
    });
    moderatorClient = new ContentModeratorClient(credentials, AZURE_MODERATOR_ENDPOINT);
    console.log('✅ Azure Content Moderator initialized');
  } catch (error) {
    console.warn('⚠️  Content Moderator initialization failed:', error.message);
    console.warn('Content moderation will use fallback method');
  }
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
 * Moderate text content using Azure Content Moderator or fallback
 * @param {string} text - Text to moderate
 * @returns {Promise<Object>} Moderation result with isClean and reason
 */
async function moderateContent(text) {
  // Use simple moderation for now (Content Moderator SDK has compatibility issues)
  return simpleModerate(text);
  
  /* Azure Content Moderator integration (disabled for now)
  if (!moderatorClient) {
    return simpleModerate(text);
  }

  try {
    const screenResult = await moderatorClient.textModeration.screenText(
      'text/plain',
      Buffer.from(text),
      {
        language: 'eng',
        autocorrect: true,
        pII: true,
        classify: true,
      }
    );

    const isClean = !(
      (screenResult.terms && screenResult.terms.length > 0) ||
      (screenResult.classification && (
        screenResult.classification.category1?.score > 0.7 ||
        screenResult.classification.category2?.score > 0.7 ||
        screenResult.classification.category3?.score > 0.7
      ))
    );

    let reason = null;
    if (!isClean) {
      if (screenResult.terms && screenResult.terms.length > 0) {
        reason = 'Contains offensive language';
      } else if (screenResult.classification) {
        reason = 'Contains inappropriate content';
      }
    }

    return { isClean, reason };
  } catch (error) {
    console.error('Error moderating content:', error.message);
    return simpleModerate(text);
  }
  */
}

/**
 * Simple text-based moderation fallback (when Azure is not configured)
 * @param {string} text - Text to moderate
 * @returns {Object} Moderation result
 */
function simpleModerate(text) {
  const offensiveWords = [
    'spam', 'scam', 'hate', 'violence', 'abuse',
    // Add more words as needed for demo purposes
  ];

  const lowerText = text.toLowerCase();
  const hasOffensive = offensiveWords.some(word => lowerText.includes(word));

  return {
    isClean: !hasOffensive,
    reason: hasOffensive ? 'Contains potentially offensive content' : null,
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

