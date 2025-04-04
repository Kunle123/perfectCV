/// <reference types="cypress" />
/// <reference types="cypress-file-upload" />
import 'cypress-file-upload';

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(email: string, password: string): Chainable<void>;
      uploadResume(fileName: string): Chainable<void>;
      waitForOptimization(): Chainable<void>;
    }
  }
}

/**
 * Custom command to log in a user
 * @param email User email
 * @param password User password
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  // Wait for the page to load
  cy.get('form', { timeout: 10000 }).should('be.visible');
  cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible').type(email);
  cy.get('input[type="password"]', { timeout: 10000 }).should('be.visible').type(password);
  cy.get('button[type="submit"]', { timeout: 10000 }).should('be.visible').click();
  // Wait for navigation to dashboard
  cy.url().should('include', '/dashboard');
});

/**
 * Custom command to upload a resume file
 * @param fileName Name of the file to upload
 */
Cypress.Commands.add('uploadResume', (fileName: string) => {
  cy.get('input[type="file"]', { timeout: 10000 }).should('be.visible').attachFile(fileName);
  cy.get('button').contains('Upload', { timeout: 10000 }).should('be.visible').click();

  // Wait for upload to complete
  cy.contains('Upload complete', { timeout: 10000 }).should('be.visible');
});

/**
 * Custom command to wait for resume optimization to complete
 */
Cypress.Commands.add('waitForOptimization', () => {
  // Wait for the button to be in loading state
  cy.get('button[type="submit"]', { timeout: 10000 })
    .should('have.attr', 'aria-busy', 'true')
    .and('be.disabled');

  // Wait for navigation to the results page
  cy.url().should('include', '/optimization-result', { timeout: 30000 });

  // Wait for the optimization results to be visible
  cy.get('.optimization-results', { timeout: 10000 }).should('be.visible');
  cy.contains('Download Optimized Resume', { timeout: 10000 }).should('be.visible');
});

export {};
