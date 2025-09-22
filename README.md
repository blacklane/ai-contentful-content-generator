# Contentful AI Page Generator

Professional web application for AI-powered content generation and Contentful CMS publishing. Built with TypeScript, Express, and modern web technologies to streamline content creation workflows for marketing teams and developers.

## ✨ Core Features

- **🤖 Advanced AI Content Generation** - Generate hero sections, FAQs, SEO text, and custom components using Blacklane's specialized AI models
- **🎨 Professional Dark UI** - Modern, responsive interface inspired by ChatGPT/Cursor with Tailwind CSS + DaisyUI
- **🌍 Multi-language Support** - Content generation in English, Spanish, German, French with localized schemas
- **🔗 Blacklane AI Integration** - Specialized AI models optimized for content generation
- **📦 Direct Contentful Publishing** - Seamless integration with Contentful CMS including draft management and releases
- **🔐 Enterprise Security** - JWT authentication, secure API endpoints, and role-based access control
- **💬 AI Assistant** - Interactive chat interface for content strategy and SEO optimization guidance
- **🎯 Component-Based Architecture** - Modular content components with validation and schema management

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp env.example .env
   ```
   
3. **Configure required services:**
   ```bash
   # Edit .env file with your credentials
   AI_API_KEY=sk-your_blacklane_api_key_here
   CONTENTFUL_SPACE_ID=your_space_id
   CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-your_token
   AUTH_USERNAME=admin
   AUTH_PASSWORD=your_secure_password
   ```

4. **Start application:**
   ```bash
   npm run dev
   ```

5. **Access application:**
   ```
   Frontend: http://localhost:8000
   Backend API: http://localhost:8001
   ```

## 📁 Architecture Overview

```
├── src/
│   ├── server.ts                 # Express server entry point
│   ├── frontend/                 # Frontend TypeScript application
│   │   ├── app.ts               # Main application logic
│   │   ├── components.ts        # Contentful component schemas
│   │   └── js/                  # Modular frontend components
│   │       ├── ai-assistant.ts  # Interactive AI chat
│   │       ├── auth.ts          # Authentication management
│   │       ├── content-generation.ts # Content creation workflow
│   │       └── step-management.ts    # Multi-step form handling
│   ├── server/                   # Backend API & middleware
│   │   ├── routes/              # API endpoints
│   │   ├── auth/                # JWT & credential management
│   │   └── middleware/          # Security & validation
│   ├── contentful/              # CMS integration layer
│   │   ├── client.ts            # Contentful API client
│   │   ├── *-schema.ts          # Component type definitions
│   │   └── *-mappings.ts        # Data transformation logic
│   ├── ai/                      # AI provider abstraction
│   │   ├── client.ts            # Multi-provider AI client
│   │   ├── prompt-builder.ts    # Dynamic prompt generation
│   │   └── schemas.ts           # AI response validation
│   └── validation/              # Zod schema validation
├── public/                      # Static assets & HTML
└── dist/                        # Production build output
```

## ⚙️ Required Configuration

### Environment Variables

```bash
# Authentication
AUTH_USERNAME=admin
AUTH_PASSWORD=your_secure_password_here

# Blacklane AI Integration
AI_API_KEY=sk-your_blacklane_api_key_here
AI_PROVIDER=blacklane
AI_BASE_URL=https://ai-chat.blacklane.net/api/v1
AI_MODEL_ID=seo-landing-page-generator

# Contentful CMS
CONTENTFUL_SPACE_ID=your_space_id
# For production use 'main', for development use alex's dev environment
CONTENTFUL_ENVIRONMENT_ID=alex-suprun-dev-new
CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-your_management_token

# Server Configuration
FRONTEND_PORT=8000
BACKEND_PORT=8001
HOST=0.0.0.0
NODE_ENV=development
```


## 🎯 Production Ready Features

### ✅ **Core Application**
- **TypeScript Architecture** - Full-stack TypeScript with Express server and modular frontend
- **Professional UI/UX** - Dark theme interface with responsive design and accessibility features
- **Advanced Content Generation** - Structured JSON output with schema validation and error handling
- **Multi-Language Support** - Localized content generation (EN, ES, DE, FR) with proper schema mapping
- **Interactive AI Assistant** - Real-time chat interface for content strategy and SEO guidance
- **Enterprise Security** - JWT authentication, secure API endpoints, CORS protection, and rate limiting

### ✅ **Contentful CMS Integration**
- **Direct Publishing** - Seamless content publishing to Contentful with draft management
- **Component Mapping** - Automated mapping for Hero, FAQ, SEO Text, and custom components
- **Release Management** - Support for Contentful Releases with draft content organization
- **Schema Validation** - Real-time validation against Contentful content models
- **Error Handling** - Comprehensive error handling with user-friendly feedback

### ✅ **Developer Experience**
- **Hot Reload Development** - Concurrent frontend and backend development with live updates
- **Code Quality Tools** - ESLint, Prettier, TypeScript checking with automated formatting
- **Modular Architecture** - Clean separation of concerns with reusable components
- **Comprehensive Logging** - Structured logging for debugging and monitoring
- **Environment Management** - Flexible configuration with secure secret handling

## 🚀 How It Works

### Step-by-Step Workflow

1. **🔐 Authenticate** - Secure login with username/password
2. **💬 AI Planning** - Interactive chat with AI assistant for content strategy
3. **📝 Project Setup** - Define topic, keywords, target language, and content components
4. **🤖 AI Generation** - Advanced AI creates structured, SEO-optimized content
5. **✅ Review & Edit** - Validate and customize generated content
6. **📦 Publish** - Direct publishing to Contentful CMS with release management

### Example Workflow

**Input:**
```
Topic: "Premium Airport Transfer Service"
Keywords: "luxury, professional, reliable transport"
Language: English
Components: Hero + FAQ + SEO Text
```

**AI-Generated Output:**
```json
{
  "hero": {
    "heading": "Experience Premium Airport Transfers with Professional Chauffeurs",
    "ctaText": "Book Your Luxury Ride",
    "ctaTargetLink": "/booking"
  },
  "faq": [
    {
      "question": "What makes your airport transfer service premium?",
      "answer": "Our professional chauffeurs, luxury vehicles, and personalized service..."
    }
  ],
  "seoText": {
    "title": "Luxury Airport Transfer Services - Professional & Reliable",
    "content": "Experience the finest in airport transportation..."
  }
}
```

**Result:** Ready-to-publish content in Contentful with proper schema validation and SEO optimization.

## 🛠️ Development & Deployment

### Essential Commands

```bash
# Development
npm run dev                 # Start both frontend and backend with hot reload
npm run dev:server         # Backend API server only
npm run dev:frontend       # Frontend Vite server only

# Production
npm run build              # Build both frontend and backend for production
npm start                  # Run production build

# Code Quality
npm run lint               # ESLint with auto-fix
npm run type-check         # TypeScript type validation
```

### Technology Stack

- **Backend:** Node.js + Express + TypeScript
- **Frontend:** Vanilla TypeScript + Tailwind CSS + DaisyUI
- **Build Tools:** Vite + ts-node-dev with hot reload
- **Validation:** Zod schemas for runtime type safety
- **Authentication:** JWT with bcrypt password hashing
- **AI Integration:** Blacklane AI with specialized content generation models
- **CMS:** Contentful Management API with release support

## 🎯 Use Cases

### **Marketing Teams**
- Generate SEO-optimized landing pages
- Create multilingual marketing content
- Develop FAQ sections and help content
- Streamline content approval workflows

### **Content Managers**
- Manage content releases and drafts
- Collaborate with AI for content strategy
- Maintain brand consistency across languages
- Scale content production efficiently

## 📝 Architecture Notes

- **No Framework Overhead** - Vanilla TypeScript for maximum performance and simplicity
- **Modular Design** - Clean separation between AI generation, content mapping, and CMS publishing  
- **Type Safety** - Full TypeScript coverage with Zod runtime validation
- **Scalable Architecture** - Easy to extend with new AI providers, content types, and CMS integrations
