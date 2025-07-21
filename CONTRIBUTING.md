# Contributing to ClinicalGoTo 🤝

We welcome contributions to ClinicalGoTo! This document provides guidelines for contributing to the project.

## 🎯 How to Contribute

### 🐛 Reporting Bugs

1. **Check existing issues** first to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, Node.js version)

### 💡 Suggesting Enhancements

1. **Check existing feature requests** first
2. **Use the feature request template**
3. **Explain the use case** and benefits
4. **Provide mockups or examples** if applicable

### 🔧 Code Contributions

#### Development Setup

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/ClinicalGoTo.git
   cd ClinicalGoTo
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
5. **Start development server**:
   ```bash
   npm run dev
   ```

#### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes**
3. **Follow coding standards** (see below)
4. **Test your changes** thoroughly
5. **Commit your changes** with descriptive messages

#### Coding Standards

- **JavaScript**: Use ES6+ features where appropriate
- **CSS**: Follow BEM methodology for class naming
- **HTML**: Use semantic HTML5 elements
- **Indentation**: 4 spaces for JavaScript, 2 spaces for HTML/CSS
- **Comments**: Document complex logic and functions

#### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update the README.md** if necessary
5. **Create a pull request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots (if UI changes)

## 📝 Commit Message Guidelines

Use conventional commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples:
```
feat(registration): add phone number validation
fix(search): resolve clinical trials API timeout
docs(readme): update installation instructions
style(forms): improve responsive design for mobile
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Types
- **Unit tests**: Test individual functions and components
- **Integration tests**: Test API endpoints and workflows
- **End-to-end tests**: Test complete user journeys

### Writing Tests
- Write tests for all new features
- Maintain or improve test coverage
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

## 🎨 Design Guidelines

### UI/UX Principles
- **Accessibility first**: Follow WCAG guidelines
- **Mobile responsive**: Design mobile-first
- **Progressive enhancement**: Ensure basic functionality works everywhere
- **Performance**: Optimize for speed and efficiency

### Color Scheme
- Primary: `#667eea` (Blue gradient)
- Secondary: `#764ba2` (Purple gradient)
- Success: `#48bb78` (Green)
- Error: `#e53e3e` (Red)
- Text: `#2d3748` (Dark gray)

### Typography
- Font family: 'Inter', sans-serif
- Headings: Font weights 600-700
- Body text: Font weight 400
- Small text: Font weight 300

## 📚 Documentation

### Code Documentation
- Document all functions with JSDoc comments
- Include parameter types and return values
- Provide usage examples for complex functions

### README Updates
- Keep installation instructions current
- Update feature lists when adding new functionality
- Include screenshots for visual changes

## 🔐 Security

### Reporting Security Issues
- **Do not** report security issues publicly
- Email security concerns to: security@clinicalgoto.com
- Include detailed information about the vulnerability

### Security Best Practices
- Validate all user inputs
- Sanitize data before storage
- Use HTTPS in production
- Keep dependencies updated
- Follow OWASP guidelines

## 📦 Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
1. Update version in `package.json`
2. Update CHANGELOG.md
3. Test thoroughly in staging environment
4. Create release notes
5. Tag the release
6. Deploy to production

## 💬 Communication

### Getting Help
- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Email**: support@clinicalgoto.com

### Community Guidelines
- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the code of conduct

## 🏷️ Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to docs
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority: high`: High priority issue
- `priority: low`: Low priority issue
- `status: in progress`: Currently being worked on
- `status: needs review`: Waiting for review

## 🎉 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Special thanks in major releases

## 📄 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). By participating, you agree to uphold this code.

## ❓ Questions?

Don't hesitate to ask questions! You can:
- Open a GitHub Discussion
- Comment on existing issues
- Reach out via email

Thank you for contributing to ClinicalGoTo! 🙏
