# Admin Authentication - Quick Reference 🚀

## ⚡ Quick Access

### 🔗 URLs
- **Login**: `http://your-domain.com/admin-login`
- **Admin Panel**: `http://your-domain.com/admin`

### 🔑 Default Credentials
- **Username**: `admin`
- **Password**: `secure_admin_password_123`

### 📁 Key Files
- `admin-login.html` - Login page
- `admin.html` - Admin dashboard
- `server.js` - Authentication logic
- `.env` - Configuration

---

## 🛠️ Environment Setup

```env
# Add to your .env file
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=your-session-secret-key
```

---

## 🔒 Security Features

- ✅ **Password Hashing** (bcrypt)
- ✅ **Session Management** (24hr timeout)
- ✅ **Rate Limiting** (5 attempts/15min)
- ✅ **Secure Cookies** (HttpOnly, SameSite)
- ✅ **HTTPS Ready**

---

## 🐛 Troubleshooting

### Login Issues:
1. Check credentials in `.env`
2. Verify session cookies enabled
3. Check browser developer tools for errors

### Rate Limiting:
- Wait 15 minutes after 5 failed attempts
- Check server logs for blocked IPs

### Session Problems:
- Clear browser cookies
- Restart server to reset sessions
- Check `trust proxy` configuration

---

## 📚 Full Documentation

- **Complete Guide**: `ADMIN_AUTH_README.md`
- **Implementation Details**: `ADMIN_IMPLEMENTATION_SUMMARY.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Change History**: `CHANGELOG.md`

---

## 🚀 Status: **PRODUCTION READY** ✅

*Last Updated: July 28, 2025*
