# GodBrain CyberLab - Hybrid Architecture

## 🚀 Two Deployment Options

This project now supports **two independent deployment methods**:

1. **Electron Desktop App** - Fixed local GUI for Windows/Mac/Linux
2. **Vite/TypeScript Web App** - Optimized for Vercel cloud deployment

## 📁 Project Structure

```
ZionSecBot/
├── gui/                    # Electron Desktop App (FIXED)
│   ├── main.js            # Original Electron main process
│   ├── main-fixed.js      # Fixed version without electron-store issues
│   ├── renderer.js        # UI logic
│   └── index.html         # GUI interface
│
├── web-app/               # Vite/TypeScript Web App (NEW)
│   ├── src/              
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand state management
│   │   └── App.tsx       # Main app component
│   ├── vite.config.ts    # Vite configuration
│   ├── vercel.json       # Vercel deployment config
│   └── package.json      # Web app dependencies
│
├── modules/              # Shared training modules
├── server.js            # Backend server
└── setup-hybrid.bat/sh  # Setup scripts
```

## 🛠️ Quick Setup

### Windows
```bash
# Run the setup script
setup-hybrid.bat

# Choose option:
# 1 - Fix Electron GUI issues
# 2 - Setup Web App for Vercel
# 3 - Install both
```

### Linux/macOS
```bash
# Make script executable
chmod +x setup-hybrid.sh

# Run setup
./setup-hybrid.sh
```

## 🖥️ Option 1: Electron Desktop App (Fixed)

### What Was Fixed
- Removed `electron-store` dependency causing build issues
- Simplified IPC communication
- Fixed server process management
- Improved Windows compatibility

### Installation
```bash
cd gui

# Use the fixed main.js
copy main-fixed.js main.js  # Windows
cp main-fixed.js main.js    # Linux/Mac

# Install dependencies
npm install

# Start the app
npm start
```

### Features
- ✅ Local server management
- ✅ Integrated training modules  
- ✅ Real-time monitoring
- ✅ No cloud dependencies
- ✅ Full offline capability

## ☁️ Option 2: Web App for Vercel

### Why Separate Web App?
- **No Electron dependencies** - Vercel can't run Electron
- **TypeScript** - Better type safety and maintainability
- **Modern React** - Latest React 18 with hooks
- **Optimized for cloud** - Fast CDN delivery
- **Responsive design** - Works on all devices

### Local Development
```bash
cd web-app

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

### Deploy to Vercel

#### Method 1: Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy
cd web-app
vercel

# Follow the prompts
```

#### Method 2: GitHub Integration
1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set root directory to `web-app`
4. Deploy automatically on push

### Environment Variables for Vercel
Set in Vercel Dashboard:
```
VITE_API_URL=https://your-api-server.com
```

## 🔄 Running Both Versions

### Start Backend Server
```bash
# From root directory
node server.js
```

### Start Electron GUI
```bash
cd gui
npm start
```

### Start Web App
```bash
cd web-app
npm run dev
```

## 📊 Feature Comparison

| Feature | Electron GUI | Web App |
|---------|-------------|---------|
| Local Server Control | ✅ Full | ❌ API Only |
| Offline Mode | ✅ Yes | ⚠️ Limited |
| Multi-platform | ✅ Win/Mac/Linux | ✅ Any Browser |
| Auto Updates | ❌ Manual | ✅ Automatic |
| Cloud Deployment | ❌ No | ✅ Vercel |
| Resource Usage | 📦 Heavy | 🚀 Light |
| Installation | 💾 Required | 🌐 None |

## 🎯 Which Version to Use?

### Use Electron GUI if you need:
- Full control over local server
- Offline training environment
- Desktop integration
- File system access
- Network scanning tools

### Use Web App if you need:
- Cloud deployment
- Multi-user access
- Mobile compatibility  
- Automatic updates
- Lower resource usage

## 🐛 Troubleshooting

### Electron Issues
```bash
# Clear node_modules and reinstall
cd gui
rm -rf node_modules package-lock.json
npm install

# Use the fixed main.js
copy main-fixed.js main.js
```

### Web App Issues
```bash
# Clear cache and reinstall
cd web-app
rm -rf node_modules .vite dist
npm install
npm run dev
```

### Vercel Deployment Issues
- Ensure root directory is set to `web-app`
- Check build command: `npm run build`
- Output directory should be `dist`

## 🔒 Security Notes

### Electron App
- Runs with full system permissions
- Ensure firewall allows local server
- Keep electron updated for security patches

### Web App
- Runs in browser sandbox
- Configure CORS properly
- Use HTTPS in production
- Set proper CSP headers

## 📝 Development Tips

### Electron Development
```bash
# Run with DevTools open
cd gui
npm start -- --dev

# Build executable
npm run build  # Requires electron-builder setup
```

### Web App Development
```bash
# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Future Enhancements

### Planned Features
- [ ] WebSocket real-time sync
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] API authentication
- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard

## 📚 Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [Vercel Documentation](https://vercel.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Contributing

Both versions are maintained in the same repository. When contributing:

1. Electron fixes go in `/gui`
2. Web app updates go in `/web-app`
3. Shared server code in root
4. Test both versions if modifying server

## 📜 License

MIT License - Educational use only

---

**Need help?** Create an issue on GitHub or check the setup scripts for automated installation.