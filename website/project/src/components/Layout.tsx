import { ReactNode } from 'react';
import { Logo } from '../assets/logo';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout">
      <nav>
        <div className="nav-content">
          <a href="/" className="logo-container">
            <Logo />
            <span className="logo-text">Harmonix</span>
          </a>
          <div className="nav-links">
            <a href="/" className="nav-link">HOME</a>
            <a href="/problem" className="nav-link">PROBLEM</a>
            <a href="/features" className="nav-link">FEATURES</a>
            <a href="/process" className="nav-link">PROCESS</a>
            <a href="/tools" className="nav-link">TOOLS</a>
          </div>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
}; 