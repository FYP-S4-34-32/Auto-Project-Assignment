// ============================ //
// Employee's current projects
// ============================ //

import { useAuthenticationContext } from '../hooks/useAuthenticationContext' 
import { useAssignmentContext } from '../hooks/useAssignmentContext'
import { useEffect } from 'react'
import AssignmentList from '../components/AssignmentList'

const ProjectAssignment = () => {

    const { user } = useAuthenticationContext() // get the user object from the context
    const { assignment, dispatch } = useAssignmentContext()
    
    useEffect(() => {
        const fetchAssignment = async () => {
            const response = await fetch('/api/assignment', {
                headers: {
                    'Authorization': `Bearer ${ user.token }` // sends authorisation header with the uer's token -> backend will validate token -> if valid, grant access to API
                }
            }) // using fetch() api to fetch data ad store in the variable
            const json = await response.json() // response object into json object, in this case an array of assignment objects

            // response OK
            if (response.ok) {
                dispatch({ type: 'SET_ASSIGNMENTS', payload: json})
            }
        }

        // if there is an authenticated user
        if (user) {
            fetchAssignment()
        }
    }, [dispatch, user])

    return (
        <div> 
            <div className="projects">
                <h2>Project Assignment</h2>
                { assignment && assignment.map((a) => { // will only run when there is a assignment object
                if (user.organisation_id === a.organisation_id) // check if assignment belongs to user under same organisation

                return(<AssignmentList key={ a._id } assignment={ a } />) // key must be unique
            })}
            </div>  
        </div>
    )
}

export default ProjectAssignment

