//=====================//
// Create Project page // --> Just a template for now - a lot of changes to be made - HAVE NOT SET UP BACKEND
//=====================//

// imports
import { useAuthenticationContext } from '../hooks/useAuthenticationContext'


const CreateProject = () => {

    
    const { user } = useAuthenticationContext()

    return (
        <h1>Create Project - only accessible by Project Admin</h1>
    )
}

export default CreateProject