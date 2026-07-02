# Contributing

Thank you for your interest in contributing to **ATS Resume Checker**! Contributions, issues, and feature requests are welcome.

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/Shrinivas-go/ats-resume-checker/issues) to avoid duplicates
2. Open a new issue with a clear title and description
3. Include steps to reproduce, expected behavior, and actual behavior
4. Add screenshots if applicable

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Describe the feature and its use case
3. Explain why it would benefit users

### Submitting Code

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and ensure:
   - Code follows existing patterns and style
   - All existing tests pass (`npm test` in both `backend/` and `frontend/`)
   - New features include appropriate tests
4. **Commit** with a clear message:
   ```bash
   git commit -m "feat: add resume DOCX upload support"
   ```
5. **Push** and open a Pull Request against `main`

## Development Setup

See the [Installation](README.md#installation) section in the README for local setup instructions.

## Code Style

- **Backend**: CommonJS modules, Express middleware patterns
- **Frontend**: ES Modules, React functional components with hooks
- **CSS**: CSS Modules with BEM-inspired naming
- **Testing**: Jest (backend), Vitest + Playwright (frontend)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
