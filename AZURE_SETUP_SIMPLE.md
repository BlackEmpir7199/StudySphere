# 🚀 Simple Azure Setup (For Your Demo)

## What You Need (Minimum)

**For a working demo, you only need 2 things:**

1. ✅ **Azure OpenAI** (for quiz & summarization)
2. ✅ **Content Moderator** (for chat moderation)

**You DON'T need (yet):**
- ❌ Kubernetes (AKS)
- ❌ Container Registry (ACR)  
- ❌ Azure PostgreSQL (use local Docker)
- ❌ Terraform (manual is fine)

---

## 📋 Simple 5-Step Process

### Step 1️⃣: Azure Portal Login (1 min)

```
https://portal.azure.com
→ Sign in with college email
→ Verify $100 credits active
```

---

### Step 2️⃣: Request Azure OpenAI Access (2 min)

**Go to:** https://aka.ms/oai/access

**Fill form:**
- Name: [Your name]
- Email: [College email]
- Organization: [Your college]
- Country: India
- Use case: "Educational cloud computing project for study group platform"

**Submit → Wait for email (1-2 days)**

**⏰ While waiting:** Do Step 3 and 4!

---

### Step 3️⃣: Create Content Moderator (5 min)

**In Azure Portal:**

1. Click **"+ Create a resource"** (top left corner)
2. Type **"Content Moderator"** in search
3. Click **"Create"**
4. Fill in:
   - Resource group: **Create new** → `studysphere-rg`
   - Region: **Central India**
   - Name: `studysphere-moderator`
   - Pricing: **Free F0** ← Choose this!
5. Click **"Review + create"**
6. Click **"Create"**
7. Wait 1-2 minutes
8. Click **"Go to resource"**
9. Click **"Keys and Endpoint"** (left sidebar)
10. **Copy KEY 1 and Endpoint**

**Paste in your `.env` file:**
```env
AZURE_MODERATOR_KEY="your-key-here"
AZURE_MODERATOR_ENDPOINT="https://centralindia.api.cognitive.microsoft.com/"
```

✅ **Done! Moderation will now work!**

---

### Step 4️⃣: Create Azure OpenAI Resource (After Email Approval)

**After you get approval email:**

1. Portal → **"+ Create a resource"**
2. Search **"Azure OpenAI"**
3. Click **"Create"**
4. Fill in:
   - Resource group: Use existing → `studysphere-rg`
   - Region: **East US**
   - Name: `studysphere-openai`
   - Pricing: Standard S0
5. Click **"Review + create"** → **"Create"**
6. Wait 2 minutes
7. Click **"Go to resource"**
8. Click **"Model deployments"**
9. Click **"+ Create new deployment"**
10. Select model: **gpt-4o-mini**
11. Deployment name: `gpt-4o-mini`
12. Click **"Create"**
13. Wait 1 minute

**Get your keys:**
14. Click **"Keys and Endpoint"** (left sidebar)
15. **Copy KEY 1 and Endpoint**

**Paste in `.env`:**
```env
AZURE_OPENAI_KEY="your-openai-key"
AZURE_OPENAI_ENDPOINT="https://studysphere-openai.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT="gpt-4o-mini"
```

✅ **Done! Quiz and summarization will work!**

---

### Step 5️⃣: Test Everything (5 min)

```bash
# Test OpenAI
node test-azure-openai.js

# Test Moderator  
node test-content-moderator.js

# Restart Docker
docker-compose down
docker-compose up -d

# Open browser
http://localhost
```

**Test in app:**
1. Register → Quiz → See real AI interests ✅
2. Chat → Type "spam" → Moderation warning ✅
3. Upload resource → AI summary with sparkles ✅

---

## 🎯 Your .env Should Look Like This

```env
# Local database (Docker) - Already working!
DATABASE_URL="postgresql://studysphere:studysphere123@localhost:5432/studysphere?schema=public"

# JWT - Already set!
JWT_SECRET="your-super-secret-jwt-key-change-in-production-12345"

# Azure OpenAI - ADD YOUR VALUES HERE 👇
AZURE_OPENAI_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
AZURE_OPENAI_ENDPOINT="https://studysphere-openai.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT="gpt-4o-mini"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"

# Azure Content Moderator - ADD YOUR VALUES HERE 👇
AZURE_MODERATOR_KEY="x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6"
AZURE_MODERATOR_ENDPOINT="https://centralindia.api.cognitive.microsoft.com/"

# Everything else - Already set!
REDIS_URL="redis://localhost:6379"
CORS_ORIGIN="http://localhost:5173"
```

**That's it! Only 2 sections to fill!**

---

## 💰 Costs

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Content Moderator** | Free F0 | **$0** |
| **Azure OpenAI** | Pay-per-use | **~$2-5** |
| **Total** | | **~$5/month** |

**Your $100 lasts:** 20+ months! 🎉

---

## 📞 Quick Help

### Error: "Access Denied" for OpenAI
**Reason:** Not approved yet  
**Fix:** Wait for email OR use mock responses (already coded!)

### Error: "Invalid subscription key"
**Reason:** Wrong API key  
**Fix:** Copy-paste KEY 1 again (not KEY 2)

### Error: "Deployment not found"
**Reason:** Wrong deployment name  
**Fix:** Make sure it's exactly `gpt-4o-mini`

### Error: "Region not available"
**Reason:** Service not in that region  
**Fix:** Try East US or West Europe

---

## 📸 Screenshots You Need

**For presentation:**

1. Azure Portal showing your resources ✅
2. OpenAI resource with gpt-4o-mini deployed ✅
3. Content Moderator resource ✅
4. Working quiz with AI interests in browser ✅
5. Chat with moderated message ✅
6. Resource with AI summary ✅

---

## ⏱️ Timeline

**Day 1 (Today):**
- ✅ Create Azure account
- ✅ Request OpenAI access
- ✅ Create Content Moderator
- ✅ Test moderator

**Day 2-3 (Wait for approval):**
- ⏳ Check email for OpenAI approval
- 📚 Work on presentation slides
- 🎨 Practice demo flow

**Day 4 (After approval):**
- ✅ Create OpenAI resource
- ✅ Deploy model
- ✅ Test everything
- ✅ Take screenshots
- ✅ Final demo run

---

## ✅ Final Checklist

**Before demo:**

- [ ] Both Azure resources created
- [ ] Both test scripts pass
- [ ] All three GenAI features work in browser
- [ ] Screenshots taken and saved
- [ ] .env file backed up (don't lose keys!)
- [ ] Spending < $10 total
- [ ] Demo practiced 3 times

**You're ready! 🎉**

---

**Pro tip:** If OpenAI isn't approved by demo day, the app still works with mock responses. Just explain "pending approval" and show the request form!

