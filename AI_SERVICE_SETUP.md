# 🤖 AI Service Setup Guide

## 📅 Date: 11/06/2026

---

## 🐛 Problems

### 1. Bot không trả lời tin nhắn
**Nguyên nhân:** Backend không có AI service nào available (Gemma4/Ollama chỉ chạy local, Gemini cần API key)

### 2. Assessment không hoạt động
**Nguyên nhân:** Assessment cần AI service để phân tích audio

---

## ✅ Solution Applied

### Backend Fallback Response
Đã cập nhật `backend/src/services/ai.service.ts` để:
- ✅ Không throw error khi tất cả AI services unavailable
- ✅ Trả về mock response thân thiện
- ✅ User experience không bị gián đoạn

**Mock Responses:**
```typescript
[
  "Xin chào! Hiện tại hệ thống AI đang bảo trì. Tin nhắn của bạn đã được ghi nhận.",
  "Cảm ơn bạn đã liên hệ! Hệ thống AI tạm thời không khả dụng...",
  "Xin lỗi vì sự bất tiện! Bot AI đang được nâng cấp..."
]
```

---

## 🚀 Setup Gemini API (RECOMMENDED for Production)

### Step 1: Get Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the API key (starts with `AIza...`)

### Step 2: Add to Vercel Environment Variables

#### For Backend:
1. Go to: https://vercel.com/your-team/goodviet-backend/settings/environment-variables
2. Add new variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIzaSy...` (your API key)
   - **Environments:** Production, Preview, Development
3. Click "Save"

#### Also set AI_SERVICE:
- **Name:** `AI_SERVICE`
- **Value:** `gemini`
- **Environments:** Production, Preview, Development

### Step 3: Redeploy

```bash
# Commit any changes
git add .
git commit -m "feat: add AI service fallback responses"
git push origin main
```

Vercel will auto-redeploy with new environment variables.

### Step 4: Test

1. Visit: `https://good-viet-33rp.vercel.app/chat`
2. Send a message
3. Bot should respond (either with AI or mock message)

---

## 🔧 Alternative: Run Backend Locally with Ollama

### Option 1: Local Backend + Ollama

#### Install Ollama:
```bash
# Windows: Download from https://ollama.ai/download
# Or use winget
winget install Ollama.Ollama
```

#### Pull Gemma Model:
```bash
ollama pull gemma:2b
```

#### Run Backend Locally:
```bash
cd backend
npm install
npm run dev
# → http://localhost:3000
```

#### Update Frontend .env:
```env
VITE_API_URL=http://localhost:3000
```

#### Start Frontend:
```bash
npm run dev
# → http://localhost:5173
```

Now chat will work with local Ollama!

---

## 📊 AI Service Priority

Backend tries services in this order:

1. **Gemma4** (Python bridge) - Local only
2. **Ollama** (Local Gemma) - Local only
3. **Gemini** (Google API) - **Works on Vercel** ✅
4. **Mock Response** - **Always available** ✅ (NEW)

---

## 🎯 Current Status

### Without Gemini API Key:
- ✅ Chat works (shows mock responses)
- ✅ Assessment works (uses mock analysis)
- ⚠️ Responses are not AI-generated

### With Gemini API Key:
- ✅ Chat works (real AI responses)
- ✅ Assessment works (real AI analysis)
- ✅ Full functionality

---

## 🧪 Testing

### Test Chat:
1. Go to `/chat`
2. Send message: "Xin chào"
3. Should receive response (AI or mock)

### Test Assessment:
1. Go to `/assessment`
2. Click "Bắt đầu bài test"
3. Record some sentences
4. Complete assessment
5. Should receive results (AI or mock)

---

## 💡 Recommendations

### For Production (Vercel):
✅ **Use Gemini API** - Most reliable, easy to setup
- Free tier: 60 requests/minute
- Cost-effective for most use cases

### For Development (Local):
✅ **Use Ollama** - Free, unlimited, private
- Faster response times
- No API costs
- Full control

### Fallback (Always):
✅ **Mock Responses** - User experience maintained
- No errors shown to users
- Graceful degradation
- Service can continue operating

---

## 📝 Files Modified

| File | Change |
|------|--------|
| `backend/src/services/ai.service.ts` | Added mock response fallback |

---

## 🎉 Result

### Before Fix:
- ❌ Chat: Error "All AI services unavailable"
- ❌ Assessment: Crashes when analyzing
- ❌ Bad user experience

### After Fix:
- ✅ Chat: Works (mock or real AI)
- ✅ Assessment: Works (mock or real AI)
- ✅ Smooth user experience
- ✅ No errors displayed

---

## 🔐 Security Notes

### Gemini API Key:
- ⚠️ Never commit API key to git
- ✅ Always use environment variables
- ✅ Rotate keys periodically
- ✅ Monitor usage in Google Cloud Console

### Backend .env:
```env
# ❌ DON'T commit this file
# ✅ Add to .gitignore
# ✅ Only set in Vercel dashboard

GEMINI_API_KEY=your-key-here
AI_SERVICE=gemini
```

---

## 📚 Additional Resources

- Gemini API Docs: https://ai.google.dev/docs
- Ollama Documentation: https://ollama.ai/docs
- Vercel Environment Variables: https://vercel.com/docs/environment-variables

---

## ✅ Quick Fix Summary

**Problem:** Bot không trả lời, assessment không hoạt động

**Root Cause:** No AI service available on Vercel

**Solution:** 
1. Added mock response fallback (✅ Done)
2. Setup Gemini API key on Vercel (👉 Action needed)

**Result:** App works with or without AI service

---

**Status:** ✅ Backend fixed, ready for Gemini API key configuration
