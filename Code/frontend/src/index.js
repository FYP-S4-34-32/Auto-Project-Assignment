//=============================================//
// Entry file for our frontend web application //
//=============================================//


// imports
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthenticationContextProvider } from './context/AuthenticationContext'
import { ProjectsContextProvider } from './context/ProjectContext';
import { OrganisationsContextProvider } from './context/OrganisationContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthenticationContextProvider>
      <ProjectsContextProvider>
        <OrganisationsContextProvider>
          <App />
        </OrganisationsContextProvider>
      </ProjectsContextProvider>
    </AuthenticationContextProvider>
  </React.StrictMode>
);
