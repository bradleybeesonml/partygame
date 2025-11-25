# 🤖 Secret Clanker

**Play Now:** [partygame-tau.vercel.app](https://partygame-tau.vercel.app)

A hilarious party game where players try to spot the AI impostor hiding among their answers!

---

## 🎮 How to Play

### Game Setup
1. **Host creates a game** on a TV or large screen
2. **Players join** using the 4-digit game code on their phones
3. Minimum **2 players** required to start

### Game Flow

#### 1️⃣ **Question Phase**
- Each player submits creative questions for the group
- Questions can be funny, personal, or thought-provoking
- Examples: "What's your go-to karaoke song?" or "What would you do with a million dollars?"

#### 2️⃣ **Answer Phase**
- Players see questions submitted by others (not their own)
- Everyone submits their answer to the question
- **The AI secretly generates a fake answer** trying to blend in!

#### 3️⃣ **Voting Phase**
- All answers are displayed in random order
- Players vote for which answer they think is the **Secret Clanker** (AI impostor)
- Try to identify the AI while avoiding being too obvious yourself!

#### 4️⃣ **Reveal & Scoring**
- The AI answer is revealed
- **Points awarded:**
  - ✅ **+500 points** for correctly identifying the AI
  - 🎭 **+250 points** per player you fooled with your answer
  - 🔥 **Streak bonus** for consecutive correct guesses
  - ❌ **-250 points** for guessing wrong

#### 5️⃣ **Next Round**
- Continue through multiple rounds
- Final scores and leaderboard shown at game end
- 🎉 Confetti for the winner!

---

## 🎯 Strategy Tips

- **Be creative but believable** - too generic and you'll get caught, too wild and you'll be suspected as the AI
- **Match the group's vibe** - pay attention to answer length, tone, and style
- **The AI learns** - it tries to mimic player writing styles, so staying unpredictable is key
- **Streaks matter** - consecutive correct guesses give bonus points!

---

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast builds
- **Deployed on Vercel**

### Backend
- **FastAPI** (Python)
- **PostgreSQL** database (Supabase)
- **OpenAI API** for AI answer generation
- **Deployed on Render**

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL database

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file with:
# DATABASE_URL=postgresql://user:pass@host:5432/dbname
# OPENAI_API_KEY=your_openai_key

uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file with:
# VITE_API_BASE_URL=http://localhost:8000

npm run dev
```

---

## 🎨 Features

- 📱 **Mobile-optimized** player experience
- 🖥️ **TV-friendly** host display
- 🤖 **Smart AI** that mimics player writing styles
- 🎊 **Real-time updates** across all devices
- 🏆 **Dynamic leaderboard** with medals
- 🌈 **Animated backgrounds** and smooth UI
- 🔒 **Session persistence** - players can rejoin if disconnected

---

## 📝 Game Rules Summary

- Minimum 2 players to start
- Questions are distributed fairly among players
- All answers automatically converted to lowercase for consistency
- Answer order randomized each round
- No player sees their own question during answering
- AI answer generated based on player responses and question context

---

## 🤝 Contributing

This is an open-source party game project. Feel free to fork, modify, and improve!

---

## 📄 License

MIT License - feel free to use and modify for your own party games!

---

**Made with ❤️ for epic game nights** 🎉

