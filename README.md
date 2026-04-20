# 🚀 Foundr: The Student Builder Community

<div align="center">
  <img alt="React" src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB"/>
  <img alt="Firebase" src="https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase"/>
  <img alt="TailwindCSS" src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  <img alt="Vite" src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white"/>
</div>

<br/>

## 🧠 Problem Statement
Many student developers and aspiring entrepreneurs build amazing projects in isolation. They struggle to find early user feedback, lack a platform to validate their concepts before writing code, and often find it difficult to connect with like-minded co-founders possessing complementary skills. 

**Foundr** solves this problem by providing a live, community-driven space for student builders to launch their startup ideas, collect honest feedback, and find the right co-founders. It acts as a critical bridge between ideation and execution, ensuring builders don't just write code, but actually solve real problems.

---

## ✨ Features
* **🔐 Secure Authentication:** Seamless email/password and Google OAuth login powered by Firebase Authentication.
* **💡 Interactive Startup Feed:** A dynamic, responsive dashboard to discover, filter, and sort new startup ideas from the community.
* **📝 Full Lifecycle CRUD:** Users can confidently post their ideas, edit their concepts as they pivot, and delete them if needed.
* **🤝 Co-founder Match:** A dedicated metadata tagging system indicating what roles an idea is actively recruiting for (e.g., UI/UX, Backend, Marketing).
* **💬 Real-Time Messaging:** Live, private direct messaging between matched co-founders using Firestore real-time listeners.
* **🤖 AI Mentor Feedback:** Integrated Google Gemini AI feedback that instantly analyzes an idea to provide actionable insights, identify key risks, and suggest the most critical next step.
* **👤 Comprehensive Builder Profiles:** Users can curate their identity adding tailored skills, a portfolio link (e.g. GitHub), and a bio. The profile acts as a private hub to track their bookmarked ideas and active launches.
* **📈 Build Logs (Progress Tracking):** Builders can transparently track their week-by-week progress by attaching build logs to their ideas.

---

## �️ Demo Recording
A full walkthrough of the project is available here:

* [View the recording on Google Drive](https://drive.google.com/file/d/1iSBJk96qHSMpquZJi8AE-lScgPpsz6n9/view?usp=sharing)
## 🌐 Live Demo
Try the live deployment here:

* [Foundr on Vercel](https://foundr-amber.vercel.app/)
---

## �🛠️ Tech Stack
This project was built with a modern, production-ready stack emphasizing performance and developer experience:

* **Frontend Framework:** React 18 (Functional Components, Custom Hooks)
* **Build Tool / Bundler:** Vite (for near-instant HMR)
* **Routing:** React Router v6 (Client-side routing)
* **State Management:** React Context API (`AuthContext`) & Custom Hooks encapsulation
* **Styling:** Tailwind CSS (Engineered with a premium Dark-mode, glassmorphism aesthetic)
* **Backend as a Service (BaaS):** Firebase
  * Authentication (Google & Password providers)
  * Firestore (Real-time NoSQL Database)
* **AI Integration:** Google Gemini API (via `claudeService.js`)

---

## 🚀 Setup Instructions

Follow these steps to run the Foundr environment locally on your machine.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "End_Term Project"
```

### 2. Install Dependencies
Ensure you have Node.js installed.
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory. You will need to provision a Firebase project and obtain your API keys.

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Integration
VITE_CLAUDE_API_KEY=your_ai_api_key
```
*(Note: If the AI API key is omitted or hits a rate limit, the application includes a dynamic local fallback to ensure the UI does not break).*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## 🏗️ Architecture & Best Practices
* **Performance:** Leverages `React.lazy()` and `<Suspense>` for route-based code-splitting, massively speeding up initial load times.
* **Optimization:** Extensive use of `useMemo` and `useCallback` to cache expensive calculations and prevent unnecessary DOM re-renders.
* **Separation of Concerns:** Clean layered architecture dividing UI (`/components`, `/pages`), State logic (`/hooks`, `/context`), and API calls (`/services`).
