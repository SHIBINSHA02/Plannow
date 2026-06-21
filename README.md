# Plannow 📅

**Planora** is an intelligent scheduling and organization management platform tailored for educational institutions. It streamlines the complex task of managing classrooms, teachers, and schedules through a centralized, automated system.

---

## ✨ Features

### 🏢 Organisation Management
- Create and manage educational organizations.
- Dashboard with high-level statistics and activity monitoring.
- Multi-user support with custom permissions (Admins & Editors).

### 🏫 Classroom & Teacher Portals
- Manage classrooms with specific subject requirements and teacher assignments.
- Track teacher workloads and availability across the organization.
- **Onboarding Link Generation**: Swiftly invite teachers and classroom admins using secure, time-limited onboarding links.

### ⚡ Intelligence & Automation
- **Auto-Assign Algorithm**: A greedy scheduling algorithm that automatically populates weekly slots based on subject requirements and teacher availability, preventing double-bookings.
- **Substitution System**: Manage teacher absences by finding and assigning available substitutes in real-time.

### 🔍 Verification & Compliance
- Review and verify submissions from classrooms and teachers to ensure data accuracy before finalizing schedules.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (using [Mongoose](https://mongoosejs.com/))
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Parsing**: [PapaParse](https://www.papaparse.com/) for CSV handling.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- MongoDB instance (local or Atlas)
- Clerk API keys

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your credentials:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
MONGODB_URI=...
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see your app in action.

---

## 📖 Related Documentation
- [Auto-Assignment Scheduling Algorithm](doc.md) - Deep dive into the greedy logic used for scheduling.

---

## 📄 License
This project is licensed under the [LICENSE](LICENSE) provided in the repository.
