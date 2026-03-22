# 🚀 CodeDaily

**CodeDaily** is a web-based daily coding challenge game focused on short, practical programming problems.

Inspired by games like Wordle, the goal is simple:
👉 **solve one programming challenge every day.**

---

## 🌐 Live Demo

👉 https://codedaily-nu.vercel.app

---

## ✨ Features

* 🧩 **Daily Challenge**
  A new challenge every day, same for everyone.

* 📊 **Difficulty Levels**

  * Beginner (Novato)
  * Intermediate (Intermedio)
  * Pro

* 🧠 **Hacker Mode**

  * Only Pro challenges
  * No hints
  * Max 3 attempts

* 🧪 **Real Python Execution**

  * Code is validated using **Pyodide (Python in the browser)**
  * Automatic test cases

* 💡 **Progressive Hints**

  * Unlock hints when failing attempts

* 🌍 **Multilingual Content**

  * Challenges available in **Spanish 🇪🇸 / English 🇬🇧**
  * Same solution regardless of language

* 💾 **Local Progress Tracking**

  * Saves attempts, completion, and hints in local storage

* 📅 **Archive Mode**

  * Play challenges from past days (from launch date)

---

## 🧱 Tech Stack

* ⚛️ React (Vite)
* 🎨 CSS (custom styling)
* 🐍 Pyodide (Python execution in browser)
* ☁️ Vercel (deployment)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   └── challenge/
├── pages/
├── services/
├── data/
│   └── challenges/
├── context/
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

The project is deployed using **Vercel**.

To deploy:

1. Push your repo to GitHub
2. Import the project in Vercel
3. Set:

   * Build Command: `npm run build`
   * Output Directory: `dist`

---

## 🧠 How It Works

* Challenges are stored in JSON files
* A daily challenge is selected deterministically using the date
* User code is executed in-browser using Pyodide
* Results are validated against predefined tests
* Progress is stored locally

---

## 🔮 Roadmap

* ☕ Java support (coming soon)
* 🔐 User accounts
* 🏆 Leaderboards
* 🌍 More languages
* 🧠 Smarter hints
* 🎯 More challenge types

---

## 🤝 Contributing

This is currently a personal project, but feedback is always welcome!

Feel free to open issues or suggest improvements.

---

## 📣 Feedback

If you try the project, I’d love to hear your thoughts 🙌

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Created by Yeray

---

## ⭐ If you like the project

Give it a star on GitHub and share it 🚀
