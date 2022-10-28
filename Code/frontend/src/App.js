// react-dom
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// pages and components
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { useAuthContext } from './hooks/useAuthContext';

function App() {
  const { user } = useAuthContext()

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
            <Route 
              path = "/" // home page
              element = {user ? <Home /> : <Navigate to="/login" />} // render component if there is a user
            />
            <Route 
              path = "/login" // login page
              element = {!user ? <Login /> : <Navigate to="/" />} // render component if there is no user
            />
            <Route 
              path = "/signup" // signup page
              element = {!user ? <Signup /> : <Navigate to="/" />} // render component if there is no user
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
