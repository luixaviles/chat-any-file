# Chat Any File

<div align="center">
  <p>
    <strong>Chat with any file using AI - PDFs, Images, Videos, and Audio</strong>
  </p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.io/)
  [![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![Gemini](https://img.shields.io/badge/Gemini-4285F4?style=flat&logo=google&logoColor=white)](https://gemini.google.com/)
</div>

## 🚀 Overview

ChatAnyFile is a powerful full-stack application that allows you to interact with your files using AI. Upload PDFs, images, videos, and audio files, and start having meaningful conversations with them. The application uses Google's Gemini AI to understand and respond to your queries about the content of your files.

<div align="center">
  <img src="./images/chat-any-file.gif?raw=true" width="500px">
</div>


### ✨ Features

- 📄 Upload and chat with PDF documents
- 🖼️ Process and understand images
- 🎥 Analyze video content
- 🎵 Interact with audio files
- 🔗 Support for file upload via drag & drop or by URL
- 💬 Natural language conversations with your files
- 🎨 Creative content generation based on multimedia files

## 🏗️ Project Structure

This project is built using [Nx monorepo](https://nx.dev/), which provides a powerful set of tools for managing and scaling enterprise-level applications with multiple applications and shared libraries.

```
chat-any-file/
├── apps/
│   ├── client/          # Angular frontend application
│   └── server/          # NestJS backend application
├── libs/                # Shared libraries
```

## 🛠️ Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Firebase account
- Google Cloud account
- Gemini API key

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/luixaviles/chat-any-file.git
cd chat-any-file
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

#### Backend (NestJS Server)

1. Navigate to the server directory:
   ```bash
   cd apps/server
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Configure the following environment variables:
   - `API_KEY`: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/)
   - `GOOGLE_CLOUD_STORAGE_BUCKET`: Your Firebase Storage bucket name. See more information [here](https://firebase.google.com/docs/storage/web/start)
   - `GOOGLE_APPLICATION_CREDENTIALS`: Path to your service account JSON file. See more information [here](https://cloud.google.com/docs/authentication/application-default-credentials)

#### Frontend (Angular App)

1. Create environment files:
   ```bash
   cd libs/environments/src/lib/environments
   cp environment.template.ts environment.ts
   cp environment.template.ts environment.development.ts
   ```

2. Configure Firebase in your environment files:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click on the web icon (</>) to add a new web app
   - Copy the Firebase configuration object
   - Paste it into both `environment.ts` and `environment.development.ts`

### 4. Start the Development Servers

In separate terminal windows:

```bash
# Start the backend server
npx nx serve server

# Start the frontend application
npx nx serve client
```

The application will be available at:
- Frontend: http://localhost:4200
- Backend: http://localhost:3000/api

## 📚 Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [Angular Documentation](https://angular.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.