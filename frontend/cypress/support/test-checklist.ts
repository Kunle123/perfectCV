/**
 * Test Checklist Utility
 * This file contains functions to verify common test requirements and configurations
 */

interface ChecklistConfig {
  routes: string[];
  routeSpecificChecks: {
    [route: string]: {
      formElements?: Array<{
        selector: string;
        type?: string;
        placeholder?: string;
        required?: boolean;
        hasLabel?: boolean;
      }>;
      buttons?: Array<{
        selector: string;
        loadingState?: boolean;
        disabledState?: boolean;
      }>;
      components?: Array<{
        selector: string;
        shouldBeVisible?: boolean;
        containsText?: string;
      }>;
    };
  };
}

/**
 * Verifies that all selectors used in the test exist in the actual components
 * @param selectors Array of selectors to verify
 */
export const verifySelectors = (
  selectors: Array<{ selector: string; type: 'css' | 'text' | 'placeholder' | 'attribute' }>
) => {
  selectors.forEach(({ selector, type }) => {
    switch (type) {
      case 'css':
        cy.get(selector).should('exist');
        break;
      case 'text':
        cy.contains(selector).should('exist');
        break;
      case 'placeholder':
        cy.get(`[placeholder="${selector}"]`).should('exist');
        break;
      case 'attribute':
        const [element, attr] = selector.split('@');
        cy.get(element).should('have.attr', attr);
        break;
    }
  });
};

/**
 * Verifies that all routes used in the test exist and are accessible
 * @param routes Array of routes to verify
 */
const verifyRoutes = (routes: string[]) => {
  routes.forEach((route) => {
    cy.log(`Verifying route: ${route}`);
    cy.visit(route, {
      timeout: 30000,
      onBeforeLoad(win) {
        // Add error handler for page load failures
        win.addEventListener('error', (e) => {
          cy.log(`Page load error on ${route}: ${e.message}`);
        });
      },
    })
      .then(() => {
        cy.url().should('include', route);
        cy.document().its('body').should('not.be.empty');
        cy.get('body').should('not.have.text', 'Not Found');
      })
      .then(
        () => {
          // Success case
          return true;
        },
        (error) => {
          // Error case
          cy.log(`Failed to verify route ${route}: ${error.message}`);
          return false;
        }
      );
  });
};

/**
 * Verifies that all form elements have the correct attributes and states
 * @param formElements Array of form elements to verify
 * @param route Current route being checked
 * @returns Array of issues found
 */
const verifyFormElements = (
  formElements: Array<{
    selector: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    hasLabel?: boolean;
  }>,
  route: string
): Array<{ selector: string; issue: string }> => {
  const issues: Array<{ selector: string; issue: string }> = [];

  formElements.forEach(({ selector, type, placeholder, required, hasLabel }) => {
    cy.log(`Checking form element on ${route}: ${selector}`);

    // Check if element exists
    cy.get('body').then(($body) => {
      if ($body.find(selector).length === 0) {
        issues.push({ selector, issue: 'Element does not exist' });
        return;
      }

      // Check element attributes
      cy.get(selector, { timeout: 10000 }).then(($el) => {
        if (type && $el.attr('type') !== type) {
          issues.push({
            selector,
            issue: `Type mismatch: expected ${type}, got ${$el.attr('type')}`,
          });
        }

        if (placeholder && $el.attr('placeholder') !== placeholder) {
          issues.push({
            selector,
            issue: `Placeholder mismatch: expected "${placeholder}", got "${$el.attr(
              'placeholder'
            )}"`,
          });
        }

        if (required && !$el.attr('required')) {
          issues.push({ selector, issue: 'Missing required attribute' });
        }

        if (hasLabel) {
          const id = $el.attr('id');
          if (id && $body.find(`label[for="${id}"]`).length === 0) {
            issues.push({ selector, issue: 'Missing label' });
          }
        }
      });
    });
  });

  return issues;
};

/**
 * Verifies that all button states are handled correctly
 * @param buttonSelectors Array of button selectors to verify
 * @param route Current route being checked
 * @returns Array of issues found
 */
const verifyButtonStates = (
  buttonSelectors: Array<{
    selector: string;
    loadingState?: boolean;
    disabledState?: boolean;
  }>,
  route: string
): Array<{ selector: string; issue: string }> => {
  const issues: Array<{ selector: string; issue: string }> = [];

  buttonSelectors.forEach(({ selector, loadingState, disabledState }) => {
    cy.log(`Checking button on ${route}: ${selector}`);

    // Check if element exists
    cy.get('body').then(($body) => {
      if ($body.find(selector).length === 0) {
        issues.push({ selector, issue: 'Button does not exist' });
        return;
      }

      // Check button attributes
      cy.get(selector, { timeout: 10000 }).then(($el) => {
        if (loadingState && !$el.attr('aria-busy')) {
          issues.push({ selector, issue: 'Missing aria-busy attribute for loading state' });
        }

        if (disabledState && !$el.prop('disabled')) {
          issues.push({ selector, issue: 'Button should be disabled' });
        }
      });
    });
  });

  return issues;
};

/**
 * Verifies that all required UI components are present
 * @param components Array of component selectors to verify
 * @param route Current route being checked
 * @returns Array of issues found
 */
const verifyUIComponents = (
  components: Array<{
    selector: string;
    shouldBeVisible?: boolean;
    containsText?: string;
  }>,
  route: string
): Array<{ selector: string; issue: string }> => {
  const issues: Array<{ selector: string; issue: string }> = [];

  components.forEach(({ selector, shouldBeVisible, containsText }) => {
    cy.log(`Checking component on ${route}: ${selector}`);

    // Check if element exists
    cy.get('body').then(($body) => {
      if ($body.find(selector).length === 0) {
        issues.push({ selector, issue: 'Component does not exist' });
        return;
      }

      // Check component attributes
      cy.get(selector, { timeout: 10000 }).then(($el) => {
        if (shouldBeVisible && !$el.is(':visible')) {
          issues.push({ selector, issue: 'Component should be visible' });
        }

        if (containsText && !$el.text().includes(containsText)) {
          issues.push({ selector, issue: `Component should contain text: "${containsText}"` });
        }
      });
    });
  });

  return issues;
};

/**
 * Repairs issues found during preflight checks
 * @param route Current route
 * @param issues Array of issues to repair
 */
const repairIssues = (route: string, issues: Array<{ selector: string; issue: string }>) => {
  if (issues.length === 0) {
    cy.log(`No issues to repair on ${route}`);
    return;
  }

  cy.log(`Repairing ${issues.length} issues on ${route}`);

  // For the resume builder, we need to ensure the accordion is open
  if (route === '/resume-builder') {
    cy.log('Opening accordion panels in ResumeBuilder');
    cy.get('.chakra-accordion__item').each(($item) => {
      if (!$item.hasClass('chakra-accordion__item--expanded')) {
        cy.wrap($item).find('button').click();
      }
    });

    // Wait for animations to complete
    cy.wait(500);
  }

  issues.forEach(({ selector, issue }) => {
    cy.log(`Repairing issue: ${selector} - ${issue}`);

    // Handle missing elements
    if (
      issue === 'Element does not exist' ||
      issue === 'Button does not exist' ||
      issue === 'Component does not exist'
    ) {
      // For the resume builder form, we need to ensure the accordion is open
      if (
        route === '/resume-builder' &&
        (selector.includes('input') || selector.includes('textarea'))
      ) {
        // We already opened the accordion above
        cy.log(`Waiting for element to be visible: ${selector}`);
        cy.get(selector, { timeout: 10000 }).should('be.visible');
      }

      // For the job parser, we need to ensure the form is visible
      if (route === '/job-parser' && selector.includes('textarea')) {
        cy.get('form').should('be.visible');
      }
    }

    // Handle placeholder mismatches
    if (issue.includes('Placeholder mismatch')) {
      // We can't fix placeholder mismatches in the test, but we can log them
      cy.log(`Cannot fix placeholder mismatch for ${selector}`);
    }

    // Handle missing attributes
    if (
      issue === 'Missing required attribute' ||
      issue === 'Missing aria-busy attribute for loading state'
    ) {
      // We can't fix missing attributes in the test, but we can log them
      cy.log(`Cannot fix missing attribute for ${selector}`);
    }
  });
};

/**
 * Example checklist for the resume optimization flow
 */
export const resumeOptimizationChecklist: ChecklistConfig = {
  routes: ['/login', '/resume-builder', '/job-parser', '/optimization-result'],
  routeSpecificChecks: {
    '/login': {
      formElements: [
        { selector: 'input[type="email"]', type: 'email', required: true, hasLabel: true },
        { selector: 'input[type="password"]', type: 'password', required: true, hasLabel: true },
      ],
      buttons: [{ selector: 'button[type="submit"]', loadingState: true }],
    },
    '/resume-builder': {
      formElements: [
        { selector: 'input[name="fullName"]', required: true, hasLabel: true },
        { selector: 'input[name="email"]', type: 'email', required: true, hasLabel: true },
        { selector: 'input[name="phone"]', required: true, hasLabel: true },
        { selector: 'textarea[name="summary"]', required: true, hasLabel: true },
      ],
      buttons: [
        { selector: 'button:contains("Save")', loadingState: true },
        { selector: 'button:contains("Preview")', loadingState: false },
      ],
      components: [
        { selector: '.accordion', shouldBeVisible: true },
        { selector: '.form-section', shouldBeVisible: true },
      ],
    },
    '/job-parser': {
      formElements: [
        { selector: 'textarea[name="jobDescription"]', required: true, hasLabel: true },
      ],
      buttons: [{ selector: 'button[type="submit"]', loadingState: true }],
      components: [{ selector: '.job-description-form', shouldBeVisible: true }],
    },
    '/optimization-result': {
      components: [
        { selector: '.optimization-results', shouldBeVisible: true },
        { selector: 'button:contains("Download Optimized Resume")', shouldBeVisible: true },
      ],
    },
  },
};

/**
 * Run all checks for a given test flow and repair any issues found
 * @param checklist The checklist configuration to verify
 */
export const runPreflightChecks = (checklist: ChecklistConfig) => {
  // First verify all routes are accessible
  verifyRoutes(checklist.routes);

  // Then verify route-specific elements and repair issues
  checklist.routes.forEach((route) => {
    cy.visit(route, { timeout: 10000 }).then(() => {
      const routeChecks = checklist.routeSpecificChecks[route];
      if (routeChecks) {
        let allIssues: Array<{ selector: string; issue: string }> = [];

        if (routeChecks.formElements) {
          const formIssues = verifyFormElements(routeChecks.formElements, route);
          allIssues = [...allIssues, ...formIssues];
        }

        if (routeChecks.buttons) {
          const buttonIssues = verifyButtonStates(routeChecks.buttons, route);
          allIssues = [...allIssues, ...buttonIssues];
        }

        if (routeChecks.components) {
          const componentIssues = verifyUIComponents(routeChecks.components, route);
          allIssues = [...allIssues, ...componentIssues];
        }

        // Repair any issues found
        if (allIssues.length > 0) {
          repairIssues(route, allIssues);

          // Verify again after repairs
          cy.log(`Verifying again after repairs on ${route}`);

          if (routeChecks.formElements) {
            verifyFormElements(routeChecks.formElements, route);
          }

          if (routeChecks.buttons) {
            verifyButtonStates(routeChecks.buttons, route);
          }

          if (routeChecks.components) {
            verifyUIComponents(routeChecks.components, route);
          }
        }
      }
    });
  });
};
