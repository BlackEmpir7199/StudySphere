# Quick Start: Azure Setup (15 Minutes)

**For students who just want to test GenAI features quickly!**

## 🎯 Goal
Get Azure OpenAI and Content Moderator working so you can:
- ✅ Test quiz classification
- ✅ Test chat moderation  
- ✅ Test resource summarization

**No Terraform or Kubernetes needed for this!**

---

## Step 1: Azure Account (2 minutes)

1. Go to **https://portal.azure.com**
2. Sign in with **college email**
3. Verify you have **Azure for Students** activated
   - Check: https://aka.ms/studentcredits
   - Should show $100 credit

---

## Step 2: Azure OpenAI (10 minutes + waiting time)

### 2A: Request Access (One-time, takes 1-2 days)

**If you haven't done this:**

1. Go to **https://aka.ms/oai/access**
2. Fill form:
   - **Organization:** Your college name
   - **Country:** India
   - **Use case:** "Educational cloud computing project"
3. Submit and **wait for approval email** (check spam!)

**If already approved, skip to 2B**

### 2B: Create OpenAI Resource

1. **Portal:** https://portal.azure.com
2. **Create Resource** → Search "Azure OpenAI"
3. **Fill in:**
   - Resource group: Create new → `studysphere-rg`
   - Region: **East US** (best for students)
   - Name: `studysphere-openai`
   - Pricing: Standard S0
4. **Create** (wait 2 mins)

### 2C: Deploy Model

1. **Open resource** → Click "Model deployments"
2. **Create deployment:**
   - Model: `gpt-4o-mini`
   - Deployment name: `gpt-4o-mini`
3. **Create** (wait 1 min)

### 2D: Get Keys

1. **Keys and Endpoint** (left menu)
2. **Copy:**
   - KEY 1
   - Endpoint

3. **Paste in `.env`:**
   ```env
   AZURE_OPENAI_KEY="paste-key-here"
   AZURE_OPENAI_ENDPOINT="https://studysphere-openai.openai.azure.com/"
   ```

---

## Step 3: Content Moderator (5 minutes)

1. **Portal** → Create Resource → Search "Content Moderator"
2. **Fill in:**
   - Resource group: `studysphere-rg` (use existing)
   - Region: **Central India** (closest to you)
   - Name: `studysphere-moderator`
   - Pricing: **Free F0** ← Important!
3. **Create** (wait 1 min)
4. **Get Keys:**
   - Keys and Endpoint → Copy KEY 1 and Endpoint
5. **Paste in `.env`:**
   ```env
   AZURE_MODERATOR_KEY="paste-key-here"
   AZURE_MODERATOR_ENDPOINT="https://centralindia.api.cognitive.microsoft.com/"
   ```

---

## Step 4: Test It Works

```bash
# Test OpenAI
node test-azure-openai.js

# Test Moderator
node test-content-moderator.js
```

**Both should show ✅ Success!**

---

## Step 5: Restart & Test in Browser

```bash
# Restart Docker
docker-compose down
docker-compose up -d

# Open browser
http://localhost
```

**Test:**
1. Register → Complete quiz → See **real AI interests** (not mock)
2. Chat → Type "spam" → See **moderation warning**
3. Upload resource → See **AI summary with ✨ icon**

---

## 💰 Cost Tracking

**To avoid surprise charges:**

1. **Set Budget Alert:**
   - Portal → Cost Management → Budgets
   - Create budget: $80 (leaves $20 buffer)
   - Alert at 80% ($64)

2. **Check Daily:**
   - Portal → Cost Management → Cost analysis
   - View daily spending

**Expected costs with this setup:**
- OpenAI (gpt-4o-mini): ~$2-5/month (very cheap!)
- Content Moderator (F0): $0 (free tier)
- **Total: ~$5/month maximum**

Your $100 credit will last **20+ months**!

---

## 🆘 Common Issues

### "Access Denied" for Azure OpenAI
- **Reason:** Not approved yet
- **Solution:** Wait for approval email or use mock responses
- Code already handles this gracefully!

### "Region not available" for Content Moderator
- **Try these regions:**
  1. Central India
  2. Southeast Asia
  3. East US
  4. West Europe

### "Quota exceeded"
- **Free tier limits:**
  - Content Moderator: 1 call/second, 5K/month
  - OpenAI: 10K tokens/minute
- **Solution:** Wait or upgrade (not needed for demo)

### Tests fail but keys look correct
- **Check:** Endpoint URL must have trailing `/`
  - ✅ `https://...openai.azure.com/`
  - ❌ `https://...openai.azure.com`

---

## 📸 Screenshot Checklist

**For your presentation:**

- [ ] Azure Portal home (showing resources)
- [ ] OpenAI resource overview
- [ ] OpenAI model deployments (showing gpt-4o-mini)
- [ ] Content Moderator overview
- [ ] Cost Management (showing credits used)

**Blur sensitive info:**
- API keys
- Subscription IDs
- Personal email (if different from college)

---

## For Your Project Report

**What to include:**

1. **Why Azure OpenAI?**
   - Enterprise-grade security
   - Student-friendly pricing
   - Easy integration
   - GDPR compliant

2. **Why Content Moderator?**
   - Free tier available
   - Real-time processing
   - Education-sector compliance
   - Multi-language support

3. **Cost Analysis:**
   - Total: ~$5/month
   - Well within $100 student budget
   - Scalable for production

---

## ⏭️ Next Steps

After GenAI works locally:

**Optional (for extra credit):**
1. Deploy to Kubernetes (see Terraform guide)
2. Setup CI/CD with GitHub Actions
3. Configure custom domain

**Required for demo:**
1. ✅ Test all three GenAI use cases
2. ✅ Take screenshots
3. ✅ Record demo video (backup)
4. ✅ Practice presentation

---

**That's it! You're ready for the demo! 🚀**

