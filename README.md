# midnightwishes ✨
> *A private, time-locked midnight birthday surprise studio.*

A client-side web application designed to craft intimate, elegant, and interactive midnight birthday surprises. Build a custom countdown, sweet interludes, and sequential memory photo chapters for the people you cherish most.

Created with ❤️ by **Krishang Mittal**

---

## ✨ Features

- 🎨 **Minimalist Studio Workspace**: Curated aesthetic featuring ambient lighting, glassmorphism, and elegant typography (*Instrument Serif* & *Inter*).
- ⏳ **Live Midnight Countdown**: Accurate to the second, locking the experience until the exact birthday moment.
- 🎂 **Midnight Reveal & Celebration**:
  - Distinct floating celebratory particle showers (`🎈`, `🍫`, `✨`, `💗`).
  - Sleek recipient badge floating seamlessly across the modal's top edge.
- 🐾 **Double Cat Interludes**:
  - **Treat 1 (Chocolate)**: Cute kitten card paired with a falling chocolate shower (`🍫`).
  - **Treat 2 (Flowers)**: Fresh flowers kitten card paired with a falling petal and bloom shower (`🌸`, `🌺`, `🌷`, `💐`).
- 📸 **Sequential Memory Chapters**: Add custom photographs, tender captions, and smooth step-by-step page-turning with active emoji showers.
- 💌 **Sealed Outro Card**: Modern sans-serif closing note wrapped with confetti bursts.
- 🔒 **100% Client-Side**: No backend or external database required; surprises are generated and encoded right in the browser using `localStorage` and URL parameters.

---

## 🚀 Getting Started

### Prerequisites
Any modern web browser (Google Chrome, Safari, Firefox, Edge, Brave).

### Running Locally

1. **Option 1: Direct File Opening**
   - Simply double-click `index.html` to open it directly in your browser.

2. **Option 2: Local HTTP Server (Recommended)**
   ```bash
   # Navigate to the project directory
   cd gjb

   # Run Python's built-in HTTP server
   python3 -m http.server 8000
   ```
   Open your browser and visit:
   ```text
   http://localhost:8000
   ```

---

## 🛠️ Project Structure

```
gjb/
├── index.html        # Main application structure & screens
├── style.css         # Custom tokens, responsive layouts, & micro-animations
├── app.js            # State management, time-lock logic, & particle controllers
├── catchoco.jpeg     # Cat chocolate interlude illustration
├── cat flow.jpeg     # Cat flowers interlude illustration
├── .gitignore        # Ignored files and local environment caches
├── LICENSE           # MIT License
└── README.md         # Project documentation
```

---

## 📖 How It Works

1. **Create an Account / Log In**: Local session-based authentication stored in your browser.
2. **Design the Surprise**:
   - Set the birthday star's name, nickname, and exact countdown unlock time.
   - Customize the midnight headline and heartfelt closing note.
   - Upload favorite memory photos with narrative captions.
3. **Share the Private Link**:
   - Generate your unique link and send it to the receiver.
   - The site remains locked with a gentle countdown until the clock strikes the target time!

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
