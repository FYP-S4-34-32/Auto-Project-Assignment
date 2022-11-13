//=======================================//
// Navigation Bar at the top of the page //
//=======================================//

// imports
import { Link } from 'react-router-dom'
import { useLogout } from '../hooks/useLogout'
import { useAuthenticationContext } from '../hooks/useAuthenticationContext'

const Navbar = () => {
    const { logout } = useLogout()
    const { user } = useAuthenticationContext()

    const handleLogoutClick = () => {
        logout()
    }

    return (
        <header>
            <div className="container">
                <Link to="/">
                    <h1>Automatic Project Assignment</h1>
                </Link>
                <nav>
                    {(user && user.role === "Admin") && ( // return this template only when the logged in user is a project admin
                        <div>
                            <Link to="/createproject">Create Project</Link>
                        </div>
                    )}
                    {user && ( // return a template only when there is a user logged in
                        <div>
                            <Link to="/profile">Profile</Link>
                            <button onClick={handleLogoutClick}>Log out</button>
                        </div>
                    )}
                    {!user && ( // return this template only when there is no user logged in
                        <div>
                            <Link to="/login">Login</Link>
                            {/* remove signup page */}
                            {/* <Link to="/signup">Signup</Link> */}
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}

// EXPORT
export default Navbar