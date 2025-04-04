describe('Career Tools Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should generate a cover letter from uploaded resume and job description', () => {
    // Navigate to cover letter generator
    cy.visit('/cover-letter-generator');
    
    // Upload resume
    cy.fixture('test-resume.pdf', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then(fileContent => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'test-resume.pdf',
          mimeType: 'application/pdf'
        });
      });
    
    // Fill job description
    cy.get('textarea[name="jobDescription"]').type('This is a test job description for a software developer position. Required skills: JavaScript, React, TypeScript, Node.js, and API development.');
    
    // Fill company name
    cy.get('input[name="companyName"]').type('Test Company');
    
    // Fill hiring manager
    cy.get('input[name="hiringManager"]').type('John Doe');
    
    // Fill additional notes
    cy.get('textarea[name="additionalNotes"]').type('Please emphasize my React experience.');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Verify redirect to result page
    cy.url().should('include', '/cover-letter-result/');
    
    // Verify cover letter content is displayed
    cy.contains('Your AI-Generated Cover Letter');
    cy.get('button').contains('Export as PDF').should('be.visible');
    cy.get('button').contains('Export as DOCX').should('be.visible');
    
    // Check tabs functionality
    cy.contains('Sections').click();
    cy.contains('Introduction').should('be.visible');
    cy.contains('Body').should('be.visible');
    cy.contains('Closing').should('be.visible');
  });

  it('should analyze skills gap and allow adding user skills', () => {
    // First upload a resume and job description to get their IDs
    cy.visit('/resume-upload');
    cy.fixture('test-resume.pdf', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then(fileContent => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'test-resume.pdf',
          mimeType: 'application/pdf'
        });
      });
    cy.get('button[type="submit"]').click();
    
    // Get resume ID from URL
    cy.url().then(url => {
      const resumeId = url.split('/').pop();
      
      // Upload job description
      cy.visit('/job-description-upload');
      cy.get('textarea[name="jobDescription"]').type('This is a test job description for a software developer position. Required skills: JavaScript, React, TypeScript, Node.js, and API development.');
      cy.get('button[type="submit"]').click();
      
      // Get job description ID from URL
      cy.url().then(jdUrl => {
        const jobDescriptionId = jdUrl.split('/').pop();
        
        // Navigate to skills gap analysis
        cy.visit(`/skills-gap-analysis/${resumeId}/${jobDescriptionId}`);
        
        // Start analysis
        cy.contains('Start Analysis').click();
        
        // Wait for analysis to complete
        cy.contains('Skills Gap Analysis', { timeout: 10000 });
        
        // Verify analysis sections
        cy.contains('Missing Skills').should('be.visible');
        cy.contains('Enhancement Opportunities').click();
        cy.contains('Implicit Skills').click();
        
        // Add a user skill
        cy.contains('Missing Skills').click();
        cy.get('textarea').first().type('I have 3 years of experience with this skill, including working on several large-scale projects.');
        
        // Submit skills
        cy.contains('Update Resume with Added Skills').click();
        
        // Verify redirect to optimization result
        cy.url().should('include', '/optimization-result/');
      });
    });
  });
});
