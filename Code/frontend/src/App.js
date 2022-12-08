//====================================//
// Main component for our Application //
//====================================//

// react-dom
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// pages and components
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import CreateProject from './pages/CreateProject';
import Projects from './pages/Projects';
import PageNotFound from './pages/PageNotFound';
import { useAuthenticationContext } from './hooks/useAuthenticationContext';
import SingleProjectDetails from './components/SingleProjectDetails';
import AllUsers from './pages/AllUsers';

function App() {
  const { user } = useAuthenticationContext()

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
            <Route 
              path = "/" // home page
              element = { user ? <Navigate to="/projects" /> : <Navigate to="/login" /> } // Projects page if there is a user, Login page if there is no user
            />  
            <Route 
              path = "/login" // login page
              element = { !user ? <Login /> : <Navigate to="/projects" /> } // Projects page if there is a user, Login page if there is no user
            />
            <Route 
              path = "/signup" // signup page
              element = { (user && user.role === "Admin") || (user && user.role === "Super Admin") ? <Signup /> : <Navigate to="/projects" /> } // Sign up page if user is an Admin or Super Admin else Projects page
            />
            <Route 
              path = "/profile" // signup page
              element = { user ? <Profile /> : <Navigate to="/login" /> } // Profile page if there is a user, Login page if there is no user
            />
            <Route 
              path = "/createproject" // create project page
              element = { (user && user.role === "Admin") ? <CreateProject /> : <Navigate to="/login" /> } // Profile page if there is a user and is of role Admin, Login page if there is no user
            />
            <Route
              path = "/projects" // projects page
              element = { user ? <Projects /> : <Navigate to="/login" /> } // Projects page if there is a user, Login page if there is no user
            />
            <Route 
                path = "/projects/:id" // single project page
                element = { user ? <SingleProjectDetails /> : <Navigate to="/login" /> } // SingleProjectDetails page if there is a user, Login page if there is no user
            />
            <Route
              path = "/allusers" // all users page
              element = { (user && user.role === "Super Admin") ? <AllUsers /> : <Navigate to="/login" /> } // Home page if there is a user and is of role Super Admin, Login page if there is no user
            />
            <Route
              path = "*" // 404 page
              element = { <PageNotFound /> }
            /> 
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
