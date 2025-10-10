# 🔑 Get Your Gemini API Key (2 Minutes!)

## Quick Steps

### 1. Open Google AI Studio
**Go to:** https://aistudio.google.com/app/apikey

### 2. Sign In
- Use your **Gmail account** (any Gmail works!)
- If you don't have Gmail, create one quickly

### 3. Create API Key
Click the button: **"Get API key"** or **"Create API key"**

You'll see two options:
- **"Create API key in new project"** ← Click this!
- Or "Create API key in existing project" (if you have one)

### 4. Copy Your Key
You'll see something like:
```
AIzaSyAbc123def456ghi789jkl012mno345pqr678
```

**Click the copy button** or select and copy (Ctrl+C)

⚠️ **IMPORTANT:** Save this key somewhere safe!

### 5. Add to .env

**Open:** `.env` file in your project root

**Add this line:**
```env
GEMINI_API_KEY="AIzaSyAbc123def456ghi789jkl012mno345pqr678"
```
(Replace with your actual key)

**Save the file!**

---

## ✅ That's It!

Now run:
```bash
node test-gemini.js
```

Should show:
```
✅ Test 1: PASSED
✅ Test 2: PASSED
✅ Test 3: PASSED

🎉 All tests passed!
```

---

## 💰 Cost

**Gemini 2.0 Flash (Experimental):**
- ✅ **FREE** - 1,500 requests per day
- ✅ No credit card needed
- ✅ No approval needed
- ✅ Works immediately

**Perfect for your project!**

---

## 🆘 Troubleshooting

### Can't access Google AI Studio?
**Try:** VPN or different browser

### Error: "API key not valid"
**Fix:** 
1. Go back to https://aistudio.google.com/app/apikey
2. Delete old key
3. Create new key
4. Copy and paste carefully

### Error: "Quota exceeded"
**Fix:**
- Free tier: 1,500/day
- Wait until midnight PST
- Or create another Google account

---

**Next:** Run `node test-gemini.js` to verify!

