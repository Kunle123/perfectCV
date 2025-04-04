import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../index';

describe('Dashboard Component', () => {
  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <ChakraProvider>
          <Dashboard />
        </ChakraProvider>
      </BrowserRouter>
    );
  };

  it('renders quick actions section', () => {
    renderDashboard();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('renders resume builder link', () => {
    renderDashboard();
    const resumeBuilderLink = screen.getByRole('link', { name: /create resume/i });
    expect(resumeBuilderLink).toBeInTheDocument();
    expect(resumeBuilderLink.getAttribute('href')).toBe('/resume-builder');
  });

  it('renders job description upload link', () => {
    renderDashboard();
    const jobDescriptionLink = screen.getByRole('link', { name: /upload job description/i });
    expect(jobDescriptionLink).toBeInTheDocument();
    expect(jobDescriptionLink.getAttribute('href')).toBe('/job-description-upload');
  });
});
