# 🚀 Quick Start Guide

Get your Fleet Portal MVP running in 5 minutes!

## Step 1: Run Locally (Demo Mode)

```bash
cd fleet-portal
npm install
npm run dev
```

Open http://localhost:5173 - you'll see 6 demo vehicles with real-time data!

## Step 2: Show to a Client

The demo is fully functional. Show them:
- ✅ Real-time vehicle status
- ✅ Maintenance alerts
- ✅ Fuel monitoring
- ✅ Filter by status
- ✅ Professional design

## Step 3: Deploy to Vercel (5 minutes)

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts. Your app will be live at a vercel.app URL!

## Step 4: Connect Supabase (Optional)

Only do this when you want real data:

1. Go to https://supabase.com
2. Create new project
3. Run SQL from `supabase-schema.sql` in SQL Editor
4. Copy `.env.example` to `.env`
5. Add your Supabase URL and key
6. In Vercel dashboard, add the same env variables
7. Redeploy: `vercel --prod`

## What to Show Clients

**Demo Script:**
1. "This is your vehicle fleet at a glance"
2. Show the stats cards (total, active, alerts)
3. Click through the filters
4. Hover over a vehicle card
5. Point out maintenance alerts
6. "This updates in real-time as vehicles move"

**Close:**
- "We can customize this with your branding"
- "Add features you need like route history, driver ratings, etc."
- "Can be live in 2 weeks"

## Pricing Strategy Ideas

- $99/month per client (up to 20 vehicles)
- $199/month (unlimited vehicles)
- Or sell to your company as a new product offering

## Need Help?

Check the full README.md for detailed docs!
