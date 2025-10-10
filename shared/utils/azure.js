const { OpenAI } = require('openai');
const ContentModeratorClient = require('@azure/cognitiveservices-contentmoderator').ContentModeratorClient;
const msRest = require('@azure/ms-rest-azure-js');

// Azure OpenAI Configuration
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';

// Azure Content Moderator Configuration
const AZURE_MODERATOR_KEY = process.env.AZURE_MODERATOR_KEY;
const AZURE_MODERATOR_ENDPOINT = process.env.AZURE_MODERATOR_ENDPOINT;

// Initialize OpenAI client
let openaiClient = null;
if (AZURE_OPENAI_KEY && AZURE_OPENAI_ENDPOINT) {
  openaiClient = new OpenAI({
    apiKey: AZURE_OPENAI_KEY,
    baseURL: `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}`,
    defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
    defaultHeaders: { 'api-key': AZURE_OPENAI_KEY },
  });
}

// Initialize Content Moderator client
let moderatorClient = null;
if (AZURE_MODERATOR_KEY && AZURE_MODERATOR_ENDPOINT) {
  const credentials = new msRest.ApiKeyCredentials({
    inHeader: { 'Ocp-Apim-Subscription-Key': AZURE_MODERATOR_KEY }
  });
  moderatorClient = new ContentModeratorClient(credentials, AZURE_MODERATOR_ENDPOINT);
}

/**
 * Classify quiz answers into interest categories using Azure OpenAI
 * @param {Array<string>} answers - User's quiz answers
 * @returns {Promise<Array<string>>} Array of classified interests
 */
async function classifyQuizAnswers(answers) {
  if (!openaiClient) {
    console.warn('Azure OpenAI not configured, returning mock interests');
    return ['Computer Science', 'Mathematics'];
  }

  try {
    const prompt = `You are an educational assistant that classifies student interests based on quiz answers.

Quiz Answers:
${answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Based on these answers, identify 3-5 specific academic interests or subject areas the student is interested in.
Return ONLY a JSON array of interests, for example: ["Computer Science", "Algorithms", "Mathematics", "Machine Learning"]

Interests:`;

    const response = await openaiClient.chat.completions.create({
      model: AZURE_OPENAI_DEPLOYMENT,
      messages: [
        { role: 'system', content: 'You are a helpful educational assistant that identifies student interests.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0].message.content.trim();
    
    // Parse JSON response
    try {
      const interests = JSON.parse(content);
      return Array.isArray(interests) ? interests : [];
    } catch (parseError) {
      // Fallback: extract interests from text
      const matches = content.match(/\[([^\]]+)\]/);
      if (matches) {
        const parsed = JSON.parse(matches[0]);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    }
  } catch (error) {
    console.error('Error classifying quiz answers:', error.message);
    // Fallback to basic classification
    return answers.filter(a => a && a.length > 2).slice(0, 5);
  }
}

/**
 * Moderate text content using Azure Content Moderator
 * @param {string} text - Text to moderate
 * @returns {Promise<Object>} Moderation result with isClean and reason
 */
async function moderateContent(text) {
  if (!moderatorClient) {
    console.warn('Azure Content Moderator not configured, returning clean result');
    return { isClean: true, reason: null };
  }

  try {
    // Screen text for profanity and offensive content
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

    // Check if content is flagged
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
    // Fail open - allow content if moderation fails
    return { isClean: true, reason: null };
  }
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
 * Summarize resource content using Azure OpenAI
 * @param {string} title - Resource title
 * @param {string} content - Resource content to summarize
 * @returns {Promise<string>} Bullet-point summary
 */
async function summarizeResource(title, content) {
  if (!openaiClient) {
    console.warn('Azure OpenAI not configured, returning mock summary');
    return `• Summary for: ${title}\n• Key concepts extracted from content\n• Main topics covered`;
  }

  try {
    const prompt = `Summarize the following educational resource in 3-5 concise bullet points:

Title: ${title}

Content:
${content.substring(0, 3000)} ${content.length > 3000 ? '...' : ''}

Provide a clear, student-friendly summary with the most important concepts and takeaways.
Format as bullet points starting with •`;

    const response = await openaiClient.chat.completions.create({
      model: AZURE_OPENAI_DEPLOYMENT,
      messages: [
        { role: 'system', content: 'You are a helpful educational assistant that summarizes study materials.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error summarizing resource:', error.message);
    return `• Summary for: ${title}\n• Content summary unavailable\n• Please review the full resource`;
  }
}

/**
 * Generate study suggestions based on user interests
 * @param {Array<string>} interests - User's interests
 * @returns {Promise<Array<string>>} Study group suggestions
 */
async function generateStudySuggestions(interests) {
  if (!openaiClient) {
    return interests.map(i => `${i} Study Group`);
  }

  try {
    const prompt = `Based on these student interests: ${interests.join(', ')}

Suggest 5 relevant study group names and topics that would be beneficial. Format as a JSON array of strings.
Example: ["Advanced Algorithms Study Circle", "Machine Learning Practical Projects", ...]`;

    const response = await openaiClient.chat.completions.create({
      model: AZURE_OPENAI_DEPLOYMENT,
      messages: [
        { role: 'system', content: 'You are a helpful educational assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    const content = response.choices[0].message.content.trim();
    
    try {
      const suggestions = JSON.parse(content);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch {
      return interests.map(i => `${i} Study Group`);
    }
  } catch (error) {
    console.error('Error generating suggestions:', error.message);
    return interests.map(i => `${i} Study Group`);
  }
}

module.exports = {
  classifyQuizAnswers,
  moderateContent,
  simpleModerate,
  summarizeResource,
  generateStudySuggestions,
};

