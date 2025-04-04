import { runPreflightChecks, resumeOptimizationChecklist } from '../support/test-checklist';

describe('Complete User Flow', () => {
  let testUser: { email: string; password: string };
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8000';

  before(() => {
    // Load test user data
    cy.fixture('users.json').then((users) => {
      testUser = users.testUser;
    });

    // Run preflight checks and repair any issues
    runPreflightChecks(resumeOptimizationChecklist);
  });

  beforeEach(() => {
    // Visit the login page and clear local storage for each test
    cy.visit('/login');
    cy.clearLocalStorage();

    // Intercept API calls and provide test data
    cy.intercept('POST', `${apiUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        token: 'test-token',
        user: {
          id: '1',
          email: testUser.email,
        },
      },
    });

    cy.intercept('POST', `${apiUrl}/api/resume/upload`, {
      statusCode: 200,
      body: {
        message: 'Upload complete',
        resumeId: '123',
      },
    });

    cy.intercept('POST', `${apiUrl}/api/resume/optimize`, {
      statusCode: 200,
      body: {
        message: 'Optimization complete',
        optimizedResumeId: '456',
      },
    });
  });

  it('should complete the full resume optimization flow', () => {
    // Login with test user
    cy.login(testUser.email, testUser.password);

    // Navigate to resume builder and wait for page load
    cy.visit('/resume-builder');

    // Wait for the page to be fully loaded
    cy.get('body').should('be.visible');

    // Wait for and open the Personal Information accordion panel
    cy.contains('Personal Information', { timeout: 10000 }).should('be.visible').click();

    // Wait for form elements to be visible and interactable
    cy.get('input[name="fullName"]', { timeout: 10000 }).should('be.visible').type('John Doe');
    cy.get('input[name="email"]', { timeout: 10000 })
      .should('be.visible')
      .type('john.doe@example.com');
    cy.get('input[name="phone"]', { timeout: 10000 })
      .should('be.visible')
      .type('+1 (555) 123-4567');
    cy.get('textarea[name="summary"]', { timeout: 10000 })
      .should('be.visible')
      .type('Experienced software developer with a strong background in web development.');

    // Upload resume with test file
    cy.uploadResume('sample-resume.pdf');

    // Navigate to job parser and wait for page load
    cy.visit('/job-parser');
    cy.get('form', { timeout: 10000 }).should('be.visible');

    // Enter job description
    cy.get('textarea[name="jobDescription"]', { timeout: 10000 })
      .should('be.visible')
      .type(
        'We are looking for a senior software developer with experience in React and TypeScript.'
      );

    // Submit for optimization
    cy.get('button[type="submit"]', { timeout: 10000 })
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Wait for optimization to complete
    cy.waitForOptimization();

    // Verify optimization results
    cy.url().should('include', '/optimization-result');
    cy.get('.optimization-results', { timeout: 10000 }).should('be.visible');
    cy.get('button:contains("Download Optimized Resume")', { timeout: 10000 }).should('be.visible');
  });

  it('should handle login errors gracefully', () => {
    // Intercept login API with error response
    cy.intercept('POST', `${apiUrl}/api/auth/login`, {
      statusCode: 401,
      body: {
        message: 'Invalid credentials',
      },
    });

    // Attempt to login with invalid credentials
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Verify error message
    cy.contains('Invalid credentials', { timeout: 10000 }).should('be.visible');
  });

  it('should handle resume upload errors', () => {
    // Login first
    cy.login(testUser.email, testUser.password);

    // Navigate to resume upload page
    cy.visit('/resume-upload');

    // Intercept upload API with error response
    cy.intercept('POST', `${apiUrl}/api/resume/upload`, {
      statusCode: 400,
      body: {
        message: 'Invalid file format',
      },
    });

    // Upload invalid file
    cy.get('input[type="file"]', { timeout: 10000 }).attachFile('invalid.txt');

    // Verify error message
    cy.contains('Invalid file format', { timeout: 10000 }).should('be.visible');
  });

  it('should handle optimization errors', () => {
    // Login first
    cy.login(testUser.email, testUser.password);

    // Navigate to job parser
    cy.visit('/job-parser');

    // Intercept optimization API with error response
    cy.intercept('POST', `${apiUrl}/api/resume/optimize`, {
      statusCode: 500,
      body: {
        message: 'Optimization failed',
      },
    });

    // Enter job description
    cy.get('textarea[name="jobDescription"]', { timeout: 10000 })
      .should('be.visible')
      .type('Test job description');

    // Submit for optimization
    cy.get('button[type="submit"]', { timeout: 10000 }).click();

    // Verify error message
    cy.contains('Optimization failed', { timeout: 10000 }).should('be.visible');
  });

  it('should handle network errors gracefully', () => {
    // Login first
    cy.login(testUser.email, testUser.password);

    // Navigate to resume builder
    cy.visit('/resume-builder');

    // Simulate network error
    cy.intercept('POST', `${apiUrl}/api/resume/save`, {
      forceNetworkError: true,
    });

    // Try to save resume
    cy.get('button:contains("Save")', { timeout: 10000 }).click();

    // Verify error message
    cy.contains('Network error', { timeout: 10000 }).should('be.visible');
  });
});
