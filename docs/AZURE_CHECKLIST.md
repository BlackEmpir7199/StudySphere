# ✅ Azure Setup Checklist

**Print this or keep it open while setting up!**

---

## 🎓 Part 1: Azure Account (5 min)

- [ ] Go to https://portal.azure.com
- [ ] Sign in with college email
- [ ] Verify Azure for Students is active
- [ ] Check credits: https://aka.ms/studentcredits
- [ ] Should show **$100 available**

**Screenshot:** Azure Portal home page  
**Save as:** `docs/screenshots/azure-portal.png`

---

## 🤖 Part 2: Azure OpenAI (15 min + waiting)

### Request Access
- [ ] Go to https://aka.ms/oai/access
- [ ] Fill form with college details
- [ ] Use case: "Educational cloud computing project"
- [ ] Submit form
- [ ] **Wait for approval email** (1-2 business days)
- [ ] Check spam folder!

### Create Resource (After Approval)
- [ ] Portal → Create a resource
- [ ] Search "Azure OpenAI"
- [ ] Click Create

### Configuration
- [ ] Subscription: Azure for Students
- [ ] Resource group: **Create new** → `studysphere-rg`
- [ ] Region: **East US**
- [ ] Name: `studysphere-openai` (or add your name if taken)
- [ ] Pricing: Standard S0
- [ ] Network: All networks
- [ ] Click Review + Create
- [ ] Click Create
- [ ] **Wait 2-3 minutes**

### Deploy Model
- [ ] Click "Go to resource"
- [ ] Click "Model deployments"
- [ ] Create new deployment
- [ ] Model: `gpt-4o-mini`
- [ ] Deployment name: `gpt-4o-mini`
- [ ] Click Create
- [ ] **Wait 1-2 minutes**
- [ ] Status shows "Succeeded" ✅

### Get Keys
- [ ] Click "Keys and Endpoint" (left menu)
- [ ] Copy **KEY 1**
- [ ] Copy **Endpoint**
- [ ] Save to `.env` file

**Screenshot:** Model deployments page  
**Save as:** `docs/screenshots/azure-openai.png`

---

## 🛡️ Part 3: Content Moderator (5 min)

### Create Resource
- [ ] Portal → Create a resource
- [ ] Search "Content Moderator"
- [ ] Click Create

### Configuration
- [ ] Subscription: Azure for Students
- [ ] Resource group: **Use existing** → `studysphere-rg`
- [ ] Region: **Central India** (or Southeast Asia, East US)
- [ ] Name: `studysphere-moderator`
- [ ] Pricing: **Free F0** ← Important!
- [ ] Click Review + Create
- [ ] Click Create
- [ ] **Wait 1-2 minutes**

### Get Keys
- [ ] Click "Go to resource"
- [ ] Click "Keys and Endpoint"
- [ ] Copy **KEY 1**
- [ ] Copy **Endpoint**
- [ ] Save to `.env` file

**Screenshot:** Content Moderator overview  
**Save as:** `docs/screenshots/content-moderator.png`

---

## 📝 Part 4: Update .env File (2 min)

Open `.env` in notepad and update:

```env
# Copy your actual values here
AZURE_OPENAI_KEY="paste-your-openai-key-1"
AZURE_OPENAI_ENDPOINT="https://studysphere-openai.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT="gpt-4o-mini"

AZURE_MODERATOR_KEY="paste-your-moderator-key-1"
AZURE_MODERATOR_ENDPOINT="https://centralindia.api.cognitive.microsoft.com/"
```

- [ ] AZURE_OPENAI_KEY filled
- [ ] AZURE_OPENAI_ENDPOINT filled
- [ ] AZURE_MODERATOR_KEY filled
- [ ] AZURE_MODERATOR_ENDPOINT filled
- [ ] Saved file

---

## 🧪 Part 5: Test Setup (5 min)

### Test OpenAI
```bash
node test-azure-openai.js
```

- [ ] Test 1: Basic completion ✅
- [ ] Test 2: Quiz classification ✅
- [ ] Test 3: Resource summarization ✅
- [ ] All tests passed!

**If tests fail:**
- Double-check keys in `.env`
- Verify deployment name is `gpt-4o-mini`
- Check endpoint has trailing `/`

### Test Content Moderator
```bash
node test-content-moderator.js
```

- [ ] Test 1: Clean message ✅
- [ ] Test 2: Offensive message flagged ✅
- [ ] Test 3: Clean message ✅
- [ ] All tests passed!

---

## 🚀 Part 6: Restart and Demo (5 min)

### Restart Services
```bash
docker-compose down
docker-compose up -d
```

- [ ] All containers started
- [ ] No errors in logs

### Test in Browser

Open **http://localhost**

**Test 1: Quiz Classification**
- [ ] Register new user
- [ ] Complete 5-question quiz
- [ ] See **real AI interests** (not "Computer Science", "Mathematics")
- [ ] Interests saved to profile

**Test 2: Chat Moderation**
- [ ] Join or create a group
- [ ] Send normal message: "Hello everyone!"
- [ ] Message appears ✅
- [ ] Send: "This is spam"
- [ ] See moderation warning ❌
- [ ] Message blocked or marked as moderated

**Test 3: Resource Summarization**
- [ ] Click "Resources" tab
- [ ] Click "Add Resource"
- [ ] Title: "Test Notes"
- [ ] Content: Paste some text (50+ words)
- [ ] Submit
- [ ] See AI summary with ✨ sparkle icon
- [ ] Summary has bullet points

---

## 📸 Screenshots Needed

- [ ] `azure-portal.png` - Portal home
- [ ] `azure-openai.png` - OpenAI resource with model
- [ ] `content-moderator.png` - Moderator resource
- [ ] `quiz-ai-results.png` - Browser showing AI interests
- [ ] `chat-moderation.png` - Moderated message
- [ ] `resource-summary.png` - AI summary with sparkle icon

---

## 💰 Cost Check

- [ ] Go to Cost Management in Portal
- [ ] Check spending (should be <$5 so far)
- [ ] Set budget alert at $80

**Expected monthly costs:**
- OpenAI: ~$2-5 (very low usage)
- Content Moderator: $0 (free tier)
- **Total: ~$5/month**

---

## ✅ You're Done When...

- [ ] Both test scripts pass ✅
- [ ] Quiz shows real AI interests (not mock)
- [ ] Chat moderation blocks offensive content
- [ ] Resources get AI summaries
- [ ] Screenshots taken
- [ ] Spending tracked

---

## 🎯 For Demo Day

**Show the instructor:**

1. **Azure Portal** with your resources
2. **Model deployments** (gpt-4o-mini active)
3. **Working quiz** with AI classification
4. **Working moderation** blocking spam
5. **Working summarization** with sparkles

**Explain:**
- "Using Azure for Students credits"
- "Free tier for Content Moderator"
- "Cost-effective choice: gpt-4o-mini"
- "All three GenAI use cases working"

---

## 🆘 Emergency Fallback

**If Azure OpenAI is NOT approved yet:**

Your code already has mock responses! Just:
- Leave `AZURE_OPENAI_KEY` empty or commented
- App still works with mock data
- For presentation, say: "Pending Azure approval, showing mock results"
- Show the approval request form as proof

**The moderator can still work independently!**

---

**Total time:** 15 minutes (if OpenAI already approved)  
**Total cost:** ~$5/month  
**Credits used:** <5% of your $100

🎉 **You're ready to demo!**

