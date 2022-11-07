//==============//
// Profile page // --> Just a template for now - a lot of changes to be made
//==============//

// imports
import { useAuthenticationContext } from '../hooks/useAuthenticationContext'


const Profile = () => {

    
    const { user } = useAuthenticationContext()

    return (
        <div className="home">
            <div className="">
                { user && <p>{ user.email }</p>}
            </div>
        </div>
    )
}

export default Profile