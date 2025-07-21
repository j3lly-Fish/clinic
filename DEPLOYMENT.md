# Deployment Guide 🚀

This guide covers deploying ClinicalGoTo to various environments.

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code coverage meets requirements
- [ ] Security audit passes (`npm audit`)
- [ ] All dependencies are up to date

### ✅ Configuration
- [ ] Environment variables configured
- [ ] Email service credentials tested
- [ ] Database connection tested (if applicable)
- [ ] SSL certificates ready (for production)
- [ ] Domain name configured

### ✅ Documentation
- [ ] README.md updated
- [ ] CHANGELOG.md updated
- [ ] API documentation current
- [ ] Environment setup documented

## Environment-Specific Deployments

### Development Environment

```bash
# Using Docker Compose
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Access points:
# - Main app: http://localhost:3000
# - Mail catcher: http://localhost:1080
# - Debugger: Port 9229
```

**Development Features:**
- Hot reloading enabled
- Mail catcher for email testing
- Verbose logging
- Source maps enabled

### Staging Environment

```bash
# Build and deploy
docker-compose build
docker-compose up -d

# Health check
curl -f http://staging.clinicalgoto.com/health

# Monitor logs
docker-compose logs -f clinicalgoto
```

**Staging Checklist:**
- [ ] Environment mirrors production
- [ ] Real email service configured
- [ ] SSL certificates installed
- [ ] Database migrations run
- [ ] Performance monitoring enabled

### Production Environment

#### Option 1: Docker Deployment

```bash
# Production build
docker-compose --profile production up -d

# With Nginx reverse proxy
docker-compose --profile production up -d nginx

# With database
docker-compose --profile database up -d
```

#### Option 2: Cloud Platform (Heroku, DigitalOcean, etc.)

1. **Set Environment Variables:**
```bash
# Email configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@clinicalgoto.com

# Website URL
WEBSITE_URL=https://clinicalgoto.com

# Node environment
NODE_ENV=production
PORT=5555

# Security (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

2. **Deploy Code:**
```bash
git push production main
```

3. **Run Health Checks:**
```bash
curl -f https://clinicalgoto.com/health
```

#### Option 3: VPS/Server Deployment

1. **Server Setup:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Deploy Application:**
```bash
# Clone repository
git clone https://github.com/yourusername/ClinicalGoTo.git
cd ClinicalGoTo

# Configure environment
cp .env.example .env
# Edit .env with production values

# Start services
docker-compose up -d
```

3. **Setup Nginx (optional):**
```nginx
server {
    listen 80;
    server_name clinicalgoto.com www.clinicalgoto.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name clinicalgoto.com www.clinicalgoto.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:5555;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment Verification

### ✅ Functional Tests
- [ ] Homepage loads correctly
- [ ] Clinical trial search works
- [ ] User registration form works
- [ ] Email system sends welcome emails
- [ ] All API endpoints respond correctly

### ✅ Performance Tests
- [ ] Page load times under 3 seconds
- [ ] API response times under 1 second
- [ ] No memory leaks detected
- [ ] CPU usage within normal range

### ✅ Security Tests
- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] No sensitive information exposed
- [ ] Rate limiting functional

### ✅ Monitoring Setup
- [ ] Application logs configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured

## Rollback Procedures

### Docker Rollback
```bash
# Stop current containers
docker-compose down

# Revert to previous image
docker pull clinicalgoto:previous-tag
docker tag clinicalgoto:previous-tag clinicalgoto:latest

# Restart with previous version
docker-compose up -d
```

### Git Rollback
```bash
# Identify commit to rollback to
git log --oneline

# Create rollback branch
git checkout -b rollback-hotfix
git revert <commit-hash>
git push origin rollback-hotfix

# Deploy rollback
# (Follow your deployment process)
```

## Monitoring and Maintenance

### Health Checks
```bash
# Application health
curl -f https://clinicalgoto.com/health

# Database connection (if applicable)
curl -f https://clinicalgoto.com/api/admin/health

# Email service
# Check logs for email sending status
```

### Log Monitoring
```bash
# Docker logs
docker-compose logs -f clinicalgoto

# System logs (if deployed on VPS)
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Regular Maintenance
- **Daily**: Check application logs for errors
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Full security audit and penetration testing

## Troubleshooting

### Common Issues

**Email not sending:**
```bash
# Check email configuration
docker exec clinicalgoto-app node -e "console.log(process.env.EMAIL_USER)"

# Test email service
docker exec clinicalgoto-app node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
transporter.verify().then(console.log).catch(console.error);
"
```

**Database connection issues:**
```bash
# Check database container
docker-compose ps postgres

# Test connection
docker exec clinicalgoto-db psql -U clinicalgoto -d clinicalgoto -c "SELECT 1;"
```

**Performance issues:**
```bash
# Check resource usage
docker stats clinicalgoto-app

# Check application logs
docker logs clinicalgoto-app --tail 100
```

## Security Considerations

### Production Security Checklist
- [ ] Use HTTPS everywhere
- [ ] Set secure environment variables
- [ ] Enable rate limiting
- [ ] Configure proper CORS settings
- [ ] Use non-root user in Docker
- [ ] Keep dependencies updated
- [ ] Regular security audits
- [ ] Monitor for vulnerabilities

### Environment Variables Security
- Never commit `.env` files
- Use secrets management in cloud platforms
- Rotate credentials regularly
- Use least-privilege principle

## Backup and Recovery

### Database Backup
```bash
# PostgreSQL backup
docker exec clinicalgoto-db pg_dump -U clinicalgoto clinicalgoto > backup.sql

# Restore
docker exec -i clinicalgoto-db psql -U clinicalgoto clinicalgoto < backup.sql
```

### Application Backup
```bash
# Backup user uploads and logs
docker cp clinicalgoto-app:/app/logs ./backup/logs
docker cp clinicalgoto-app:/app/uploads ./backup/uploads
```

## Support and Maintenance

For ongoing support:
- Monitor application logs daily
- Set up automated health checks
- Configure alerting for critical issues
- Plan regular maintenance windows
- Keep documentation updated

---

**Need help?** Contact: support@clinicalgoto.com
