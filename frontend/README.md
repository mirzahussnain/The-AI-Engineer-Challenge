# AI Engineer Challenge Terminal (Futuristic Anime-Style UI)

This is a futuristic anime-style terminal UI for the AI Engineer Challenge, built with React and TypeScript, and powered by a FastAPI backend.

## Features
- Neon glow effects and immersive anime terminal look
- Animated terminal header and custom anime-style loading animation
- Real-time chat with OpenAI via FastAPI backend
- High contrast, visual clarity, and pleasant UX
- Password-style input for sensitive fields (API key)

## How to Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set the backend API URL:**
   Create a `.env.local` file in this directory with:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
   (Change the URL if your FastAPI server runs elsewhere)
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it Works
- Enter your OpenAI API key, a user message, and (optionally) a system prompt and model.
- The frontend sends a POST request to `/api/chat` on your FastAPI backend.
- The response is streamed and displayed in the terminal UI.
- While waiting for a response, an anime-style glowing cursor animation is shown.

## Design Decisions
- **Visual Clarity:** Neon colors on a dark background, with strong contrast and readable fonts.
- **Anime Terminal Feel:** Animated glows, terminal prompt, and monospace font.
- **UX:** Inputs and boxes grow to fit content, and all interactive elements have clear focus/hover states.
- **Accessibility:** Sufficient color contrast and keyboard-friendly controls.

## Deployment
This app is ready for deployment anywhere React apps are supported. The backend is powered by FastAPI.

---

*For any sensitive input fields, password-style boxes are used as per project rules.*
