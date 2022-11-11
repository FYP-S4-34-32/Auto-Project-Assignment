//==============//
// Profile page // --> Just a template for now - a lot of changes to be made
//==============//

// imports
import { useAuthenticationContext } from '../hooks/useAuthenticationContext'


const Profile = () => {

    
    const { user } = useAuthenticationContext()

    return (
        <div className="home">
            <div className="user-profile">
                <h2> User Information </h2>
                  { user && <p> Email: { user.email } </p>}  
            </div>
        </div>
    )
}

export default Profile