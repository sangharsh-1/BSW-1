import React from 'react';

const styles = `
  .error-alert-wrapper {
    /* Styles for the wrapper to position it */
    position: fixed;
    bottom: 1rem; /* 16px */
    left: 50%;
    transform: translateX(-50%);
    width: 91.666667%; /* w-11/12 in tailwind */
    max-width: 56rem; /* max-w-4xl in tailwind, increased from 42rem */
    z-index: 50;
    animation: error-alert-fade-in 0.5s ease-out forwards;
  }
  @keyframes error-alert-fade-in {
    from { opacity: 0; transform: translate(-50%, 10px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }

  .error-alert-container {
    --error-bg: #FEF2F2;
    --error-border: #DC2626;
    --error-title: #991B1B;
    --error-text: #7F1D1D;
    --error-btn-bg: #DC2626;
    --error-btn-bg-hover: #B91C1C;
    --error-btn-text: #fff;
    --error-icon-grad-start: #FCA5A5;
    --error-icon-grad-end: #EF4444;

    padding: 12px 56px 12px 24px; /* Reduced vertical padding from 16px */
    background: var(--error-bg);
    border-left: 6px solid var(--error-border);
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(0,0,0,.06);
    position: relative;
    font-family: system-ui, Segoe UI, Roboto, sans-serif;
    overflow: hidden; /* To clip the ::before pseudo-element's corners */
  }
  
  .error-alert-container::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(var(--error-icon-grad-start), var(--error-icon-grad-end));
  }

  .error-alert-title {
    font-size: 18px; /* Reduced from 20px */
    font-weight: 700;
    color: var(--error-title);
    margin: 0 0 6px;
  }

  .error-alert-message {
    color: var(--error-text);
    line-height: 1.45;
  }

  .error-alert-button {
    position: absolute;
    top: 10px; /* Adjusted position */
    right: 10px; /* Adjusted position */
    background: var(--error-btn-bg);
    color: var(--error-btn-text);
    border: none;
    border-radius: 6px; /* Reduced */
    padding: 6px 12px; /* Reduced */
    font-size: 14px; /* Added */
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(220,38,38,.35);
    transition: transform .06s ease, box-shadow .2s;
  }

  .error-alert-button:hover {
    background: var(--error-btn-bg-hover);
  }
  
  .error-alert-button:active {
    transform: translateY(1px);
  }
`;

const ErrorAlert: React.FC<{ onFixClick: () => void }> = ({ onFixClick }) => {
    return (
        <div className="error-alert-wrapper">
          <style>{styles}</style>
          <div className="error-alert-container" role="alert" aria-live="polite">
            <h3 className="error-alert-title">Error</h3>
            <p className="error-alert-message">A critical error occurred while rendering the page. The application state is unstable. Please initiate the recovery process to continue.</p>
            <button onClick={onFixClick} className="error-alert-button">Fix bug</button>
          </div>
        </div>
    );
};

export default ErrorAlert;