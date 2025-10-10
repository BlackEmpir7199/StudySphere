# 🚀 Google Gemini Setup (5 Minutes!)

**Way faster than Azure OpenAI - no approval needed!**

---

## Step 1: Get Gemini API Key (2 minutes)

### 1A: Go to Google AI Studio

**Open:** https://aistudio.google.com/app/apikey

**Sign in:** with your Google account (Gmail)

### 1B: Create API Key

1. Click **"Get API key"** or **"Create API key"**
2. Choose **"Create API key in new project"**
   - Or select existing project if you have one
3. **Copy the API key** (looks like: `AIzaSyA...`)

⚠️ **Save this key! You won't see it again!**

---

## Step 2: Add to .env (1 minute)

**Open:** `.env` file in your project root

**Add these lines:**
```env
# Google Gemini AI (Replace with your actual key)
GEMINI_API_KEY="AIzaSyA_your_actual_key_here"
GEMINI_MODEL="gemini-2.0-flash-exp"
```

**Save the file!**

---

## Step 3: Install Dependencies (2 minutes)

```bash
# Install Gemini package in shared
cd shared
npm install @google/generative-ai

# Install in user-service
cd ../services/user-service
npm install @google/generative-ai

# Install in chat-service
cd ../chat-service
npm install @google/generative-ai

cd ../..
```

---

## Step 4: Test Gemini (1 minute)

```bash
# Run test script
node test-gemini.js
```

**Expected output:**
```
✅ Success!
Response: Hello from Gemini AI! ...

Test 1: ✅ PASSED
Test 2: ✅ PASSED
Test 3: ✅ PASSED

🎉 All tests passed!
```

---

## Step 5: Restart & Test (2 minutes)

```bash
# Rebuild with Gemini support
docker-compose down
docker-compose up --build -d
```

**Wait 3-5 minutes for build to complete**

---

## 🧪 Test in Browser

**Open:** http://localhost

### Test 1: Quiz Classification ✨
1. Register new user
2. Complete 5-question quiz
3. Should see **AI-generated interests** like:
   - "Computer Science"
   - "Machine Learning"
   - "Artificial Intelligence"
   - "Data Structures"

### Test 2: Resource Summarization ✨
1. Go to a channel
2. Click "Resources" tab
3. Click "Add Resource"
4. Fill in:
   - Title: "Data Structures Notes"
   - Content: Paste any educational text (100+ words)
5. Submit
6. Should see **AI summary with bullet points** and sparkle icon ✨

---

## 💰 Why Gemini?

**Advantages:**
- ✅ **FREE tier** - 1,500 requests/day
- ✅ **No approval needed** - instant access
- ✅ **Fast** - low latency from India
- ✅ **High quality** - comparable to GPT-4
- ✅ **Easy setup** - just API key needed

**Perfect for your demo!**

---

## 📊 Gemini vs Azure OpenAI

| Feature | Gemini | Azure OpenAI |
|---------|--------|--------------|
| **Approval** | None needed | 1-2 days wait |
| **Free Tier** | 1,500/day | Very limited |
| **Setup Time** | 5 minutes | 30+ minutes |
| **India Support** | Excellent | Good |
| **Cost** | FREE | ~$0.00005/request |
| **Quality** | Excellent | Excellent |

**For students: Gemini is better!** ✅

---

## 🆘 Troubleshooting

### Error: "API key not valid"
**Fix:**
- Go back to https://aistudio.google.com/app/apikey
- Create a new key
- Make sure you copied the full key (starts with `AIza`)

### Error: "Quota exceeded"
**Fix:**
- Free tier: 1,500 requests/day
- Wait until next day (resets midnight PST)
- Or upgrade to pay-as-you-go (still very cheap)

### Error: "Model not found"
**Fix:**
- Try `gemini-1.5-flash` instead
- Update in .env: `GEMINI_MODEL="gemini-1.5-flash"`

---

## 📝 For Your Project Report

**Update your documentation:**

### Use Case 1: Quiz Classification
- **Service:** Google Gemini (gemini-2.0-flash-exp)
- **Why chosen:** Free tier, no approval needed, excellent for education
- **Cost:** $0 (free tier)

### Use Case 3: Resource Summarization
- **Service:** Google Gemini (gemini-2.0-flash-exp)
- **Why chosen:** Fast, accurate, free tier perfect for students
- **Cost:** $0 (free tier)

**Keep Content Moderator for Use Case 2** (chat moderation)

---

## ✅ Updated GenAI Stack

Your app now uses:
1. **Google Gemini** - Quiz classification & summarization
2. **Azure Content Moderator** - Chat moderation (still Azure!)

**This is actually BETTER for a student project:**
- ✅ Shows you can integrate multiple AI providers
- ✅ Cost-effective (mostly free)
- ✅ No waiting for approvals
- ✅ Works immediately

---

## 🎯 Quick Commands

```bash
# Test Gemini
node test-gemini.js

# Test Content Moderator (still Azure)
node test-content-moderator.js

# Rebuild everything
docker-compose down
docker-compose up --build -d

# Check logs
docker-compose logs -f user-service
docker-compose logs -f chat-service
```

---

## 🎬 For Your Presentation

**Mention:**
- "We use Google Gemini for AI features"
- "gemini-2.0-flash-exp - latest experimental model"
- "Free tier perfect for education"
- "Azure Content Moderator for safety"
- "Best of both platforms!"

**Show:**
- Google AI Studio with your API key
- Working quiz with Gemini
- Working resource summary
- Cost analysis (FREE!)

---

## 📸 New Screenshots Needed

- [ ] Google AI Studio - API key page
- [ ] Working quiz with Gemini interests
- [ ] Resource with Gemini summary
- [ ] Terminal showing test-gemini.js passing

**Update your presentation:**
- Replace "Azure OpenAI" with "Google Gemini" for Use Cases 1 & 3
- Keep Azure Content Moderator for Use Case 2
- Show diversity in AI providers

---

**That's it! Much simpler than Azure OpenAI! 🎉**

**Total setup time:** 5 minutes  
**Total cost:** $0  
**Works in:** India, worldwide

