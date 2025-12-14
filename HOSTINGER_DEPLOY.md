# Hostinger Deployment Guide

## 🚀 Quick Deploy (Without Nginx)

### Step 1: Upload Files to Hostinger
1. Login to Hostinger control panel
2. Go to **File Manager** or use **FTP/SFTP**
3. Upload entire `Training_software` folder to: `/home/username/public_html/`
4. Or upload to subdomain: `/home/username/domains/subdomain.yourdomain.com/public_html/`

### Step 2: Setup Node.js Application (Hostinger Panel)
1. Go to **Advanced** → **Node.js**
2. Click **Create Application**
3. Settings:
   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `/home/username/public_html/Training_software`
   - **Application URL**: your domain (e.g., training.yourdomain.com)
   - **Application startup file**: `backend/server.js`
   - **Port**: Leave as auto-assigned (Hostinger handles this)

### Step 3: Build Frontend
SSH into your server and run:
```bash
cd /home/username/public_html/Training_software
npm run install-all
cd frontend
npm run build
```

### Step 4: Configure Environment Variables
In Hostinger Node.js panel, add environment variables:
```
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_secret
ZOHO_REFRESH_TOKEN=your_token
ZOHO_ORG_ID=your_org_id
PORT=5000
NODE_ENV=production
```

### Step 5: Start Application
1. Click **Start Application** in Node.js panel
2. Your app will be live at: `https://yourdomain.com`

## 📝 Alternative: Manual Setup via SSH

```bash
# 1. Connect via SSH
ssh username@yourdomain.com

# 2. Navigate to directory
cd /home/username/public_html/Training_software

# 3. Install dependencies
npm run install-all

# 4. Build frontend
cd frontend
npm run build
cd ..

# 5. Create .env file
nano backend/.env
# Add your environment variables

# 6. Install PM2 (process manager)
npm install -g pm2

# 7. Start application
pm2 start backend/server.js --name training-system

# 8. Save PM2 config
pm2 save
pm2 startup
```

## 🔧 Database Setup
SQLite database will be created automatically at:
`/home/username/public_html/Training_software/backend/hr_training.db`

## 🌐 Domain Configuration
1. Point your domain/subdomain to Hostinger IP
2. In Hostinger panel, add domain under **Node.js application**
3. Enable SSL certificate (Let's Encrypt) from Hostinger panel

## ✅ Verify Deployment
Visit: `https://yourdomain.com/health`
Should return: `{"status":"OK","message":"HR Training System API is running"}`

## 🔄 Updates
To update code:
```bash
cd /home/username/public_html/Training_software
git pull origin main
npm run install-all
cd frontend
npm run build
cd ..
pm2 restart training-system
```

## 📊 Default Login
- **Trainer**: Username: `1234`, Password: `1234`
- **Employee**: Any employee punch ID, Password: `321`

## 🆘 Troubleshooting
- Check logs: `pm2 logs training-system`
- Restart app: `pm2 restart training-system`
- Check status: `pm2 status`
- View Node.js logs in Hostinger panel

## 🎯 Features Working:
- ✅ Single port deployment (no separate frontend server)
- ✅ No Nginx required
- ✅ Built-in static file serving
- ✅ API routing
- ✅ SQLite database
- ✅ 8 trainers with department assignments
- ✅ Training durations: 30, 45, 60, 90 minutes
- ✅ Complete training management system
