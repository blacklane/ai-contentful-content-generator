# Contentful AI Page Generator

AI-powered content generation tool for creating SEO landing pages using Blacklane's internal AI and publishing to Contentful.

## ✨ Features

- **🤖 AI Content Generation** - Generate hero sections, FAQs, and SEO text
- **🎨 Modern Dark UI** - ChatGPT/Cursor-style interface with Tailwind CSS + DaisyUI
- **🌍 Multi-language Support** - English, Spanish, German, French
- **🔗 Blacklane AI Integration** - Uses internal `ai-chat.blacklane.net` endpoint
- **📊 Multiple AI Models** - Support for GPT-5, GPT-4o, Claude, Gemini, and more
- **🚀 Real-time Generation** - Instant content creation with structured JSON output

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp env.example .env
   ```
   
3. **Add your Blacklane AI API key:**
   ```bash
   # Edit .env file
   AI_API_KEY=sk-your_blacklane_api_key_here
   ```

4. **Start application:**
   ```bash
   # Start both backend and frontend with hot reload
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:8000
   ```

   **Default Ports:**
   - Frontend: `http://localhost:8000`
   - Backend API: `http://localhost:8001`

6. **Setup Contentful (Optional):**
   ```bash
   # Add to .env file for publishing features
   CONTENTFUL_SPACE_ID=your_space_id
   CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-your_token
   ```

## 📁 Project Structure

```
├── src/
│   ├── server.ts                 # Express server entry point
│   ├── frontend/                 # Frontend TypeScript code
│   ├── server/                   # Backend API routes & middleware
│   ├── contentful/              # Contentful integration & mappings
│   ├── ai/                      # AI client & prompt handling
│   └── utils/                   # Shared utilities
├── public/                      # Static frontend assets
├── dist/                        # Compiled TypeScript output
├── .env                         # Environment variables
└── package.json
```

## 🔧 Environment Variables

### Required Variables

```bash
# AI API (Blacklane Internal)
AI_API_KEY=sk-your_blacklane_api_key_here
```

### Optional Configuration

```bash
# Server Ports
BACKEND_PORT=8001          # API server port
FRONTEND_PORT=8000         # Frontend dev server port
NODE_ENV=development

# AI Models (choose one)
AI_MODEL_ID=gpt-5-chat          # Default: GPT-5 Chat
AI_MODEL_ID=azure/gpt-4o        # Most powerful
AI_MODEL_ID=azure/gpt-4o-mini   # Fast & cost-effective
AI_MODEL_ID=Claude-Sonnet-4     # Anthropic Claude
AI_MODEL_ID=gemini-2.5-pro      # Google Gemini

# Authentication
AUTH_USERNAME=admin
AUTH_PASSWORD=your_secure_password_here

# Contentful (for publishing features)
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ENVIRONMENT_ID=master
CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-your_token

# Security & CORS
CORS_ORIGIN=http://localhost:8000

```

## 🎯 Current Status

✅ **MVP Complete - Ready for Use!**
- ✅ TypeScript backend with Express server
- ✅ Modern dark UI with Tailwind CSS + DaisyUI  
- ✅ Blacklane AI integration (`ai-chat.blacklane.net`)
- ✅ Multi-model support (GPT-5, GPT-4o, Claude, Gemini)
- ✅ Structured JSON content generation
- ✅ Multi-language support (EN, ES, DE, FR)
- ✅ Real-time generation with loading states
- ✅ Error handling and validation
- ✅ JWT-based authentication system
- ✅ Secure API endpoints with rate limiting

✅ **Contentful Integration Ready!**
- 📦 Direct publishing to Contentful CMS
- 🎯 Component mapping (Hero, FAQ, SEO Text)
- 📊 Draft content management with Releases support
- 🔄 Real Contentful schema validation
- 🔐 JWT authentication for secure publishing

## 📖 Usage Example

1. **Fill the form:**
   - **Topic:** "Premium Airport Transfer Service"
   - **Keywords:** "luxury, professional, blacklane"
   - **Language:** English
   - **Content Types:** Hero Component + Benefits Component

2. **Click "Generate Content"**

3. **Get structured JSON output:**
   ```json
   {
     "topic": "Premium Airport Transfer Service",
     "language": "en",
     "generatedSections": [
       {
         "type": "hero",
         "title": "Experience Luxury with Blacklane Premium Transfer",
         "subtitle": "Arrive in style with professional chauffeurs...",
         "cta": "Book Your Blacklane Ride Today"
       },
     ],
     "metadata": {
       "keywordsUsed": ["luxury", "professional", "blacklane"],
       "generatedAt": "2025-08-19T14:43:03.467Z"
     }
   }
   ```

## 🛠️ Development

### Available Scripts

**Development:**
- `npm run dev` - Start development server with hot reload
- `npm run dev:server` - Start only backend server
- `npm run dev:frontend` - Start only frontend (Vite)

**Build & Production:**
- `npm run build` - Build both server and frontend
- `npm start` - Run production build

**Code Quality:**
- `npm run lint` - ESLint with auto-fix
- `npm run type-check` - TypeScript type checking
- `npm run format` - Format code with Prettier


## 🤖 Available AI Models

The Blacklane AI endpoint supports multiple models:

### **Recommended Models:**
- `gpt-5-chat` - **Current default** (GPT-5 optimized for chat)
- `azure/gpt-4o` - Most powerful GPT-4o
- `azure/gpt-4o-mini` - Fast and cost-effective

### **Alternative Models:**
- `gpt-5`, `gpt-5-mini`, `gpt-5-nano` - GPT-5 variants
- `azure/o1`, `azure/o1-mini` - OpenAI reasoning models
- `Claude-Sonnet-4`, `bedrock/claude-3-7-sonnet` - Anthropic Claude
- `gemini-2.5-pro`, `gemini-2.5-flash` - Google Gemini
- `azure/o3-mini`, `o3`, `o3-pro` - Latest OpenAI models

### **Model Selection Tips:**
- **For quality**: `azure/gpt-4o` or `gpt-5-chat`
- **For speed**: `azure/gpt-4o-mini`
- **For reasoning**: `azure/o1-mini`
- **GPT-5 models**: Require `temperature=1` (handled automatically)

## 📝 Notes

- No React/Next.js - keeping it simple with vanilla HTML/JS
- Tailwind + DaisyUI for quick styling without brain overhead
- TypeScript for better development experience
- Separate concerns: AI generation → mapping → Contentful publishing
