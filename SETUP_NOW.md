# ⚡ DO THIS NOW - 5 Minute Setup

## Your Action Plan

### Step 1: Get Gemini API Key (2 min) 

1. **Open:** https://aistudio.google.com/app/apikey
2. **Sign in** with Gmail
3. **Click:** "Create API key in new project"
4. **Copy** the key (starts with `AIza...`)

### Step 2: Update .env (1 min)

**Open:** `.env` file

**Add:**
```env
GEMINI_API_KEY="AIzaSyA_your_actual_key_paste_here"
GEMINI_MODEL="gemini-2.0-flash-exp"
```

**Save!**

### Step 3: Test It (1 min)

```bash
node test-gemini.js
```

**Should show:**
```
✅ Test 1: Basic completion PASSED
✅ Test 2: Quiz classification PASSED  
✅ Test 3: Resource summarization PASSED

🎉 All tests passed!
```

### Step 4: Rebuild Docker (3 min)

```bash
docker-compose down
docker-compose up --build -d
```

**Wait for build to complete...**

### Step 5: Test in Browser (2 min)

**Open:** http://localhost

1. **Register** new user
2. **Complete quiz** → See AI interests ✨
3. **Upload resource** with content → See AI summary ✨

---

## ✅ Done!

**Your app now has:**
- ✅ Gemini AI for quiz & summarization (FREE!)
- ✅ Content Moderator for chat safety (setup later, optional)

**Total cost:** $0  
**Setup time:** 5 minutes  
**Works:** Immediately!

---

## What's Working Now

✅ **Quiz Classification** - Gemini analyzes answers  
✅ **Resource Summarization** - Gemini creates summaries  
⏳ **Chat Moderation** - Add Content Moderator later (optional)

---

## For Your Demo

**Say:**
- "We use Google Gemini AI (gemini-2.0-flash-exp)"
- "Free tier - 1,500 requests/day"
- "Perfect for educational projects"
- "Shows multi-provider AI integration"

**Show:**
- Working quiz with real AI interests
- Working resource summary with sparkles
- Google AI Studio with your key
- Test script passing

---

**Questions? The app is ready to demo! 🚀**

