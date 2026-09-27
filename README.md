# 🤖 AI Interview Coach

An AI-powered interview preparation platform that helps users practice technical, HR, behavioral, and mixed interviews with real-time AI-generated questions, answer evaluation, personalized feedback, performance tracking, and interview analytics.

## 🚀 Features

* 🔐 **User Authentication**

  * Secure registration and login
  * JWT-based authentication
  * Protected user-specific data

* 🎯 **AI Interview Practice**

  * Choose your target role
  * Select difficulty level
  * Choose interview type
  * AI-generated interview questions

* 🤖 **AI Answer Evaluation**

  * Evaluates interview answers using AI
  * Provides a score out of 100
  * Identifies strengths
  * Suggests improvements
  * Provides detailed feedback

* 📊 **Performance Dashboard**

  * Total interviews
  * Average score
  * Best score
  * Improvement tracking
  * Interview readiness overview

* 📈 **Analytics**

  * Score progression
  * Performance by interview type
  * Performance by role
  * Overall performance trends

* 📚 **Interview History**

  * Stores previous interviews
  * Review questions and answers
  * View AI feedback
  * View strengths and improvement areas
  * Practice again

* 🧠 **AI-Powered Coaching**

  * Personalized performance insights
  * Identifies areas for improvement
  * Recommends future practice

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* React Router
* Axios
* Lucide React
* CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* JWT Authentication
* Pydantic

### Database

* SQLite

### AI

* Ollama
* Llama 3.2

### Development Tools

* VS Code
* Git
* GitHub
* Uvicorn
* npm

## 🏗️ Project Structure

```text
AI-Interview-Coach/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── database.py
│   │   ├── models.py
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/aritrochatterjee2006/AI-Interview-Coach.git
cd AI-Interview-Coach
```

### 2. Backend Setup

Open a terminal:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

```env
SECRET_KEY=your-secret-key
ALGORITHM=HS256
DATABASE_URL=sqlite:///./interview_coach.db
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:latest
```

> Never commit your actual `.env` file or secret keys to GitHub.

### 4. Install Ollama

Install Ollama and download the required model:

```bash
ollama pull llama3.2
```

Make sure Ollama is running before starting the application.

### 5. Start the Backend

From the `backend` directory:

```bash
python -m uvicorn app.main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

## 💻 Start the Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## 🔄 How It Works

```text
User
  ↓
React Frontend
  ↓
FastAPI Backend
  ↓
Authentication / Interview API
  ↓
Ollama + Llama 3.2
  ↓
AI Question / Answer Evaluation
  ↓
Database
  ↓
Dashboard + Analytics + History
```

## 🎯 Interview Flow

1. User logs into the application.
2. User selects a role.
3. User selects difficulty.
4. User selects interview type.
5. AI generates an interview question.
6. User submits an answer.
7. AI evaluates the answer.
8. The system generates:

   * Score
   * Feedback
   * Strengths
   * Improvements
9. Interview results are saved.
10. Dashboard and analytics are updated automatically.
11. User can review previous interviews from History.

## 🔐 Security

The project includes:

* JWT-based authentication
* Password hashing
* Protected API endpoints
* User-specific interview history
* Environment variables for sensitive configuration
* `.gitignore` protection for secrets and local files

## 📊 Main API Endpoints

| Method | Endpoint                        | Purpose                     |
| ------ | ------------------------------- | --------------------------- |
| POST   | `/api/auth/register`            | Register user               |
| POST   | `/api/auth/login`               | Login                       |
| GET    | `/api/auth/me`                  | Get current user            |
| POST   | `/api/interview/start`          | Generate interview question |
| POST   | `/api/interview/evaluate`       | Evaluate answer             |
| POST   | `/api/interview/save`           | Save interview              |
| GET    | `/api/interview/history`        | Get interview history       |
| GET    | `/api/interview/history/{id}`   | Get interview details       |
| GET    | `/api/interview/analytics`      | Get performance analytics   |
| GET    | `/api/interview/coach-insights` | Get AI coaching insights    |

## 🧠 AI Capabilities

The application uses **Llama 3.2 through Ollama** to:

* Generate realistic interview questions
* Evaluate candidate answers
* Provide personalized feedback
* Identify strengths
* Identify improvement areas
* Generate interview coaching insights

## 📌 Future Improvements

* 🎤 Voice-based interviews
* 🗣️ Speech-to-text answer evaluation
* 📹 Video interview practice
* 📄 Resume-based interview questions
* 💼 Job-description-based interviews
* 📧 Interview performance reports
* 🌐 Cloud deployment
* 📱 Mobile-responsive improvements

## 👨‍💻 Author

**Aritro Chatterjee**

B.Tech Computer Science & Technology

Interested in:

* Artificial Intelligence
* Machine Learning
* Full Stack Development
* Generative AI
* Cybersecurity
* Real-World AI Applications

## ⭐ Project Goal

The goal of AI Interview Coach is to provide an interactive platform where students and job seekers can practice interviews, receive AI-powered feedback, track their progress, and continuously improve their interview performance.
