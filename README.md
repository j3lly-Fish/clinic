# ClinicalGoTo 🏥

**Your Gateway to Clinical Research**

ClinicalGoTo is a comprehensive web application that connects people with clinical trial opportunities from ClinicalTrials.gov. The platform provides an intuitive search interface, real-time clinical trial search, and a streamlined multi-step registration process to help patients find and participate in medical research studies.

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://docker.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## ✨ Features

- **🔍 Clinical Trial Search**: Real-time search integration with ClinicalTrials.gov API
- **📋 Multi-step Registration**: User-friendly form that collects visitor information progressively
- **📧 Welcome Email System**: Automated welcome emails with personalized content
- **📱 Responsive Design**: Optimized for all devices and screen sizes
- **🔒 Data Security**: Built-in validation and security measures
- **⚡ Performance Optimized**: Fast loading and smooth user experience
- **♿ Accessibility**: WCAG compliant with keyboard navigation support
- **🔍 SEO Optimized**: Structured data and meta tags for search visibility

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Email service credentials (Gmail, SendGrid, etc.)

### Installation

#### Option 1: Docker (Recommended) 🐳

1. **Prerequisites**
   - Docker and Docker Compose installed
   - Git (optional)

2. **Quick Start with Docker**
   ```bash
   # Navigate to the project directory
   cd ClinicalGoTo
   
   # Copy environment template
   copy .env.example .env
   # Edit .env with your email configuration
   
   # Start in development mode
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
   
   # OR start in production mode
   docker-compose up -d
   ```

3. **Access the Application**
   - Main app: `http://localhost:3000`
   - Mail catcher (dev): `http://localhost:1080`

#### Option 2: Local Node.js Setup

1. **Prerequisites**
   - Node.js (v14 or higher)
   - npm or yarn package manager

2. **Install Dependencies**
   ```bash
   cd ClinicalGoTo
   npm install
   ```

3. **Environment Setup**
   ```bash
   copy .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Open in Browser**
   Visit `http://localhost:3000`

## 📁 Project Structure

```
ClinicalGoTo/
├── index.html              # Main landing page
├── css/
│   └── styles.css          # Stylesheet with responsive design
├── js/
│   └── app.js              # Frontend JavaScript functionality
├── templates/
│   └── welcome-email.html  # Email template with dynamic variables
├── server.js               # Backend server (Node.js/Express)
├── package.json            # Project dependencies and scripts
├── README.md               # This file
└── .env                    # Environment variables (create this)
```

## 🔧 Configuration

### Email Service Setup

#### Gmail Setup
1. Enable 2-factor authentication on your Google account
2. Generate an app password for your application
3. Use the app password in your `.env` file

#### SendGrid Setup
1. Create a SendGrid account
2. Generate an API key
3. Update the email transporter configuration in `server.js`

### API Integration

The application integrates with:
- **ClinicalTrials.gov API**: For searching clinical trials
- **Email Service**: For sending welcome emails
- **Your Backend**: For storing user data (customize as needed)

## 🎨 Customization

### Styling
- Modify `css/styles.css` to change colors, fonts, and layouts
- Update the color scheme by changing CSS custom properties
- Adjust responsive breakpoints for different screen sizes

### Content
- Update text content in `index.html`
- Modify email template in `templates/welcome-email.html`
- Customize form fields and validation rules

### Branding
- Replace "ClinicalGoTo" with your brand name
- Update meta tags and SEO information
- Add your logo and favicon

## 🔒 Security Features

- **Input Validation**: Server-side validation for all user inputs
- **Rate Limiting**: Prevents abuse and spam
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet.js**: Security headers for protection
- **Data Sanitization**: Prevents XSS and injection attacks

## 📧 Email Template Variables

The welcome email template supports these dynamic variables:

- `{{USER_NAME}}` - Visitor's full name
- `{{USER_EMAIL}}` - Visitor's email address
- `{{PORTAL_URL}}` - Link to user portal
- `{{WEBSITE_URL}}` - Main website URL
- `{{UNSUBSCRIBE_URL}}` - Unsubscribe link
- `{{PREFERENCES_URL}}` - User preferences page
- `{{PRIVACY_URL}}` - Privacy policy page
- `{{FACEBOOK_URL}}` - Facebook page
- `{{TWITTER_URL}}` - Twitter profile
- `{{LINKEDIN_URL}}` - LinkedIn page

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment

#### Option 1: Node.js Hosting (Heroku, DigitalOcean, etc.)
1. Set environment variables on your hosting platform
2. Deploy the code
3. Run `npm start`

#### Option 2: Static + Serverless
1. Host the frontend files (HTML, CSS, JS) on a CDN
2. Deploy the backend as serverless functions
3. Update API endpoints in the frontend

#### Option 3: Docker Deployment

**Basic Docker Build:**
```bash
# Build the image
docker build -t clinicalgoto .

# Run the container
docker run -p 3000:3000 --env-file .env clinicalgoto
```

**Production with Docker Compose:**
```bash
# Production deployment
docker-compose up -d

# With Nginx reverse proxy
docker-compose --profile production up -d

# With PostgreSQL database
docker-compose --profile database up -d
```

## 🐳 Docker Management

The project includes helpful Docker management scripts:

### Quick Commands
```bash
# Make the script executable (Linux/Mac)
chmod +x docker-scripts.sh

# Start development environment
./docker-scripts.sh dev

# Start production environment
./docker-scripts.sh prod

# Start with Nginx reverse proxy
./docker-scripts.sh prod-nginx

# Start with database
./docker-scripts.sh with-db

# View logs
./docker-scripts.sh logs

# Check status
./docker-scripts.sh status

# Stop all services
./docker-scripts.sh stop

# Clean up
./docker-scripts.sh clean
```

### Development Features
- **Hot Reloading**: Code changes are automatically reflected
- **Mail Catcher**: Test emails at `http://localhost:1080`
- **Debugger**: Node.js debugger available on port 9229
- **Database**: PostgreSQL available for development

### Production Features
- **Nginx Reverse Proxy**: Load balancing and SSL termination
- **Health Checks**: Automatic container health monitoring
- **Redis Caching**: Session storage and caching
- **Security**: Non-root user, minimal Alpine images
- **Backups**: Automatic backup and restore capabilities

## 🔧 API Endpoints

### Frontend API Calls
- `POST /api/register` - User registration
- `GET /api/clinical-trials` - Search clinical trials
- `POST /api/unsubscribe` - Unsubscribe from emails

### Admin Endpoints
- `GET /api/admin/subscribers` - View all subscribers
- `PUT /api/subscriber/:id/preferences` - Update user preferences

## 🧪 Testing

### Manual Testing
1. Search for clinical trials with different locations
2. Complete the registration form
3. Check email delivery
4. Test responsive design on various devices

### Automated Testing
```bash
npm test
```

## 📊 Analytics & Tracking

The application includes placeholders for:
- Google Analytics
- Custom event tracking
- Form completion tracking
- Email open tracking

## 🔧 Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check email credentials in `.env`
   - Verify email service settings
   - Check spam folder

2. **Clinical Trials Not Loading**
   - Verify internet connection
   - Check ClinicalTrials.gov API status
   - Review browser console for errors

3. **Form Submission Errors**
   - Ensure all required fields are filled
   - Check network connectivity
   - Verify server is running

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@clinicalgoto.com
- Issues: GitHub Issues page

## 🎯 Future Enhancements

- [ ] User dashboard for managing preferences
- [ ] Advanced search filters
- [ ] Clinical trial matching algorithms
- [ ] Mobile app development
- [ ] Integration with more clinical trial databases
- [ ] Multilingual support
- [ ] Advanced analytics dashboard

## 🙏 Acknowledgments

- ClinicalTrials.gov for providing the clinical trials data
- The open-source community for the libraries and tools used
- Healthcare professionals for their feedback and guidance

---

**Built with ❤️ for advancing healthcare research**
