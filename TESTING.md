# Testing Documentation

This document outlines the testing strategy, tools, and procedures.

## 🧪 Testing Strategy

Our testing approach is divided into three main layers to ensure reliability, performance, and a great user experience:

1.  **Unit & Component Testing (Vitest)**: Fast tests for individual logic and Svelte components.
2.  **End-to-End (E2E) Testing (Playwright)**: Full browser automation to verify core user journeys.
3.  **API Testing (Postman)**: Validation of API endpoints and route health.

---

## 🛠️ Tools & Setup

### Unit & Component Tests
- **Framework**: [Vitest](https://vitest.dev/)
- **Library**: [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/intro/)
- **Configuration**: `vite.config.ts` (configured via workspaces)

### E2E Tests
- **Framework**: [Playwright](https://playwright.dev/)
- **Configuration**: `playwright.config.ts`
- **Browsers**: Chromium (Default)

### API Tests
- **Tool**: [Postman](https://www.postman.com/)
- **Collection**: `tests/api/climbers.postman_collection.json`

---

## 🚀 How to Run Tests

### 1. Unit & Component Tests
Run unit tests in watch mode:
```bash
npm run test:unit
```
To run all tests once (CI mode):
```bash
npm run test:unit -- --run
```

### 2. E2E Tests
Ensure the development server is running (or Playwright will start it automatically):
```bash
npm run test:e2e
```
To run in UI mode for debugging:
```bash
npx playwright test --ui
```

### 3. API Tests
Import the `tests/api/climbers.postman_collection.json` file into your Postman application.
Set the `base_url` variable (default is `http://localhost:5173`) and run the collection.

### 4. Run Everything
```bash
npm test
```

---

## 📂 Test Structure

- `tests/e2e/`: Browser automation tests (Playwright).
- `tests/api/`: Postman collection and API-related tests.
- `src/**/*.svelte.test.ts`: Client-side Svelte component tests (Vitest `client` workspace).
- `src/**/*.test.ts`: Server/Node-side unit tests (Vitest `server` workspace).

---

## 📝 Best Practices

- **Component Isolation**: Test components in isolation using mocks for stores and external services.
- **User-Centric Assertions**: Use `screen.getByRole` or `screen.getByText` to test from the user's perspective.
- **Stable Selectors**: For E2E tests, prefer ARIA roles and labels over CSS classes.
- **Atomic Tests**: Keep tests focused on a single behavior to make debugging easier.
