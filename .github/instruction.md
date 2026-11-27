# GitHub Copilot Instructions

## Development Guidelines

Follow these instructions strictly while working on this project.

 ### 1. Application Build Restrictions
- DO NOT build or compile the application.
- DO NOT execute `ng build`, `npm run build`, or any other build commands.
- DO NOT attempt production or development builds.
- DO NOT start the Angular development server.
- DO NOT execute commands that trigger application compilation.

### 2. Test Execution Restrictions
- DO NOT execute unit test cases.
- DO NOT execute integration tests.
- DO NOT execute end-to-end (E2E) tests.
- DO NOT run `ng test`, `npm test`, or `npm run test`.
- DO NOT execute test suites automatically after code modifications.
- Do not repeatedly attempt to run tests to verify changes.

### 3. Code Development
- Focus only on implementing the requested functionality.
- Make code changes directly in the relevant files.
- Follow the existing project architecture and coding standards.
- Avoid modifying unrelated files.
- Do not introduce unnecessary dependencies.
- Reuse existing components, services, interfaces and utilities wherever possible.
- Maintain clean, readable, reusable and maintainable code.

### 4. Code Validation
- Perform static code review instead of executing builds or tests.
- Check imports, types, syntax and references through code inspection.
- Identify potential compilation errors through static analysis.
- Review changes for logical errors