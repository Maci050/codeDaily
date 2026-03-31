# 🚀 CodeDaily

**CodeDaily** is a web-based daily coding challenge game focused on short, practical programming problems.

Inspired by games like Wordle, the goal is simple:
👉 **solve one programming challenge every day.**s

---

## 🌐 Live Demo

👉 https://codedaily-nu.vercel.app

---

## ✨ Features

* 🧩 **Daily Challenge**
  A new challenge every day, same for everyone. Deterministically selected by date.

* 📊 **Difficulty Levels**
  * Beginner (Novato)
  * Intermediate (Intermedio)
  * Pro

* 🧠 **Hacker Mode**
  * Only Pro challenges
  * No hints
  * Max 3 attempts

* 🐍☕ **Two Programming Languages**
  * **Python** — executed in the browser via Pyodide (no backend needed)
  * **Java** — executed via the Judge0 public API
  * Same challenge available in both languages every day

* 🧪 **Real Code Execution**
  * Solutions run against automatic test cases
  * Real Python in the browser, real Java via Judge0

* 💡 **Progressive Hints**
  Unlock hints on failed attempts (Normal mode only)

* 🌍 **Multilingual Content**
  Challenges available in **Spanish 🇪🇸 / English 🇬🇧**

* 💾 **Local Progress Tracking**
  Saves attempts, completion, hints, streak, and preferences in localStorage

* 📅 **Archive Mode**
  Play challenges from past days (from launch date: 2026-03-22)

* 🎮 **Extra Game Modes**
  Three additional modes available under the **Modes** section:

  * **What does it return?** — Read code and predict the output. 3 attempts, solution revealed only after all attempts are used.
  * **Find the bug** — Fix broken code so all tests pass. Uses real Python execution via Pyodide.
  * **What's the complexity?** — Multiple choice: pick the correct Big O time complexity. 2 attempts, wrong options are disabled progressively.

---

## 🧱 Tech Stack

* ⚛️ React 19 + Vite
* 🎨 CSS (custom IDE dark theme, JetBrains Mono)
* 🐍 Pyodide (Python execution in browser)
* ☕ Judge0 public API (Java execution)
* ☁️ Vercel (deployment)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/                     # Header, Footer
│   └── challenge/
│       ├── ChallengePlayer.jsx     # Daily challenge (Python & Java)
│       ├── GuessOutputPlayer.jsx   # "What does it return?" mode
│       ├── FindBugPlayer.jsx       # "Find the bug" mode
│       └── GuessComplexityPlayer.jsx # "What's the complexity?" mode
├── pages/
│   ├── HomePage.jsx
│   ├── DailyPage.jsx
│   ├── ArchivePage.jsx
│   ├── ProfilePage.jsx
│   └── ModesPage.jsx
├── services/
│   ├── challengeService.js           # Challenge selection logic
│   ├── progressService.js            # localStorage progress tracking
│   ├── pythonRunnerService.js        # Pyodide integration
│   ├── javaRunnerService.js          # Judge0 integration
│   ├── solutionValidationService.js  # Language-agnostic validator
│   └── uiService.js                  # UI preferences persistence
├── data/
│   └── challenges/
│       ├── python_novato.json
│       ├── python_intermedio.json
│       ├── python_pro.json
│       ├── java_novato.json
│       ├── java_intermedio.json
│       ├── java_pro.json
│       ├── guess_output.json         # "What does it return?" challenges
│       ├── find_bug.json             # "Find the bug" challenges
│       └── guess_complexity.json     # "What's the complexity?" challenges
├── context/
│   └── LanguageContext.jsx
└── styles.css
```

---

## 🛠️ Installation & Setup

Clone the repository:

```bash
git clone https://github.com/Maci050/codeDaily.git
cd codedaily
```

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## 📦 Deployment

The project is deployed using **Vercel** as a fully static site.

To deploy:

1. Push your repo to GitHub
2. Import the project in Vercel
3. Set:
   * Build Command: `npm run build`
   * Output Directory: `dist`

No backend or environment variables required — Python runs in the browser via Pyodide, and Java uses the free public Judge0 API (`ce.judge0.com`).

---

## 🧠 How It Works

* Challenges are stored in JSON files (150 Python + 150 Java for the daily mode, plus 64 challenges across the three extra modes)
* A daily challenge is selected deterministically using the date and difficulty — same index for both languages so switching between Python and Java always shows the same problem
* Python code is executed entirely in the browser using Pyodide (WebAssembly)
* Java code is sent to the Judge0 public API and results are polled
* Extra modes use their own challenge banks and share the same progress system (localStorage)
* Progress is stored locally in localStorage (no account needed)

---

## 🔮 Roadmap

* 🌍 More programming languages
* 🎯 More challenge types
* 📤 Share your result (Wordle-style)

---

## 🤝 Contributing

This is currently a personal project, but feedback is always welcome!

Feel free to open issues or suggest improvements.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Created by Yeray

---

## ⭐ If you like the project

Give it a star on GitHub and share it 🚀