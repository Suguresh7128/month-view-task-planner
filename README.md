# Month View Task Planner

A simplified month-view calendar with task scheduling — built with **React + Vite**, styled with **Tailwind CSS**, enhanced with **Framer Motion** animations. Features include drag-and-drop rescheduling, label/status filters, and click-to-edit tasks.

##  Features
- Month view calendar (Google Calendar–style, simplified)
- Add, edit, and delete tasks
- **Drag & drop** to reschedule across days
- **Filter** by labels and status + search by text
- **Color-coded** labels (Design/Dev/Content/Ops)
- **Framer Motion** for smooth animations
- **Responsive** (mobile/tablet/desktop)
- Data persisted in **localStorage**

##  Tech Stack
- React 18 + Vite
- Tailwind CSS
- Framer Motion

##  Getting Started (Local)
```bash
npm install
npm run dev
# open http://localhost:5173
```

##  Build
```bash
npm run build
npm run preview
```

##  Deploy (Vercel)
1. Push this project to a **public GitHub repo**.
2. Go to **https://vercel.com → New Project → Import GitHub Repo**.
3. Framework preset: **Vite**  
   - Build command: `npm run build`  
   - Output directory: `dist`
4. Click **Deploy**. Done!

##  Project Structure
```
month-view-task-planner/
├─ public/
├─ src/
│  ├─ App.jsx
│  ├─ index.css
│  └─ main.jsx
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
└─ vite.config.js
```

##  Notes
- All tasks are saved in your browser via `localStorage`. Clearing site data will reset them.
- Week starts on **Sunday** (adjustable in code if needed).
- This project is intentionally **framework-light** and readable for evaluators.
```
```
