# Fleet Portal - Client Vehicle Tracking MVP

A modern, real-time vehicle tracking dashboard for fleet management clients. Built with React, Supabase, and deployed on Vercel.

![Fleet Portal](https://img.shields.io/badge/React-18.x-blue) ![Supabase](https://img.shields.io/badge/Supabase-Latest-green) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

## ✨ Features

- **Real-time Vehicle Tracking** - Monitor vehicle status, location, and metrics
- **Status Indicators** - Active, Idle, and Maintenance status with visual indicators
- **Maintenance Alerts** - Automatic alerts for vehicles due for maintenance
- **Fuel Monitoring** - Track fuel levels with low-fuel warnings
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Demo Mode** - Runs with sample data without Supabase configuration
- **Modern UI** - Dark theme with distinctive typography and smooth animations

## 🚀 Quick Start

### Option 1: Run with Demo Data (No Setup Required)

```bash
npm install
npm run dev
```

The app will run in demo mode with sample vehicle data at `http://localhost:5173`

### Option 2: Connect to Supabase

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd fleet-portal
   npm install
   ```

2. **Set up Supabase**
   - Go to [Supabase](https://supabase.com) and create a new project
   - In your project's SQL Editor, run the contents of `supabase-schema.sql`
   - Get your project URL and anon key from Settings > API

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run**
   ```bash
   npm run dev
   ```

## 📦 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

### Manual Deploy

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   
3. **Add Environment Variables**
   - Go to your Vercel project dashboard
   - Settings > Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. **Redeploy**
   ```bash
   vercel --prod
   ```

## 🗄️ Database Schema

The app uses a single `vehicles` table with the following structure:

| Field | Type | Description |
|-------|------|-------------|
| id | bigserial | Primary key |
| vehicle_name | text | Vehicle identifier |
| license_plate | text | Unique plate number |
| status | text | active, idle, or maintenance |
| driver_name | text | Current driver (nullable) |
| location | text | Current location |
| last_update | timestamptz | Last status update |
| mileage | integer | Current mileage |
| fuel_level | integer | Fuel percentage (0-100) |
| next_maintenance | timestamptz | Next scheduled maintenance |
| maintenance_due | boolean | Maintenance alert flag |

## 🎨 Customization

### Branding

Edit colors in `src/styles.css`:

```css
:root {
  --color-bg: #0a0e14;          /* Background */
  --color-surface: #151a23;      /* Card background */
  --color-accent: #00e5ff;       /* Accent color */
  /* ... more variables */
}
```

### Adding Features

The app is structured for easy expansion:

- **Components**: Add new components in `src/components/`
- **Data**: Modify demo data in `src/utils/demoData.js`
- **Supabase**: Extend schema in `supabase-schema.sql`

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: CSS Variables, Custom Design System
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel
- **Date Handling**: date-fns

## 📱 Features Roadmap

- [ ] Real-time location map view
- [ ] Driver management
- [ ] Route history and playback
- [ ] Custom maintenance schedules
- [ ] Multi-client support with authentication
- [ ] Mobile app (React Native)
- [ ] PDF reports
- [ ] SMS/Email alerts

## 🤝 Usage for Your Business

This MVP is ready to show to clients. You can:

1. **Demo Mode**: Show the interface immediately with fake data
2. **Quick Setup**: Connect to Supabase in 10 minutes for real data
3. **Customize**: Add your logo, colors, and specific features
4. **Deploy**: Get it live on Vercel in minutes with a custom domain

## 💡 Next Steps

1. **Collect Feedback**: Show this to 3-5 clients and get their input
2. **Identify Must-Haves**: What features are dealbreakers?
3. **Add Authentication**: Implement multi-tenant support
4. **Build Mobile**: Consider a mobile companion app
5. **Scale Backend**: Add real-time subscriptions and webhooks

## 📄 License

MIT License - feel free to use this for your fleet management business

## 🙋 Support

Questions? Issues? Open an issue or reach out!

---

**Built with ❤️ for fleet management excellence**
