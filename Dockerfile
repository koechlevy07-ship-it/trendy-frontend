name: Backend CI

on:
  pull_request:
    paths:
      - 'trendy-backend/**'
  push:
    branches: [main, master]
    paths:
      - 'trendy-backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: trendy-backend

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
          cache-dependency-path: trendy-backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Syntax check all source files
        run: |
          for f in $(find src -name "*.js"); do
            node --check "$f" || exit 1
          done

      - name: Run test suite
        run: npm test
        env:
          NODE_ENV: test
          JWT_SECRET: ci-test-secret
          JWT_REFRESH_SECRET: ci-test-refresh-secret

      - name: Audit dependencies for known vulnerabilities
        run: npm audit --audit-level=high || true
        continue-on-error: true
