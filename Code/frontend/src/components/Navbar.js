// imports
import { Link } from 'react-router-dom'
import { useLogout } from '../hooks/useLogout'
import { useAuthContext } from '../hooks/useAuthContext'

const Navbar = () => {
    const { logout } = useLogout()
    const { user } = useAuthContext()

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
                    {user && (
                        <div> {/* if there is a user logged in, then display */}
                            <span>{ user.email }</span>
                            <button onClick={handleLogoutClick}>Log out</button>
                        </div>
                    )}
                    {!user && (
                        <div> {/* if NO user logged in, do not display */}
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Signup</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default Navbar