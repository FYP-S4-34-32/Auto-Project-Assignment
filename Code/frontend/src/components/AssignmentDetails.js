//=============================================================//
// Assignment Details page for an individual Assignment Object //
//=============================================================//

import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuthenticationContext } from "../hooks/useAuthenticationContext";
import { useAssignmentContext } from "../hooks/useAssignmentContext";
import { useProjectsContext } from "../hooks/useProjectsContext";
import ProjectList from "./ProjectList";

const AssignmentDetails = () => {
    const { user } = useAuthenticationContext()
    const { assignment, dispatch: setAssignment } = useAssignmentContext()
    const { projects, dispatch: setProjects } = useProjectsContext()

    const { id } = useParams()
    
    // fires when the component is rendered
    useEffect(() => {
        const fetchAssignment = async () => {
            const response = await fetch('/api/assignment/' + id, { // fetch the assignment based on the assignment's id
                headers: {
                    'Authorization': `Bearer ${ user.token }` // sends authorisation header with the user's token -> backend will validate token -> if valid, grant access to API
                }
            }) // using fetch() api to fetch data and store in the variable

            const json = await response.json() // response object into json object

            // response OK
            if (response.ok) {
                setAssignment({ type: 'SET_ONE_ASSIGNMENT', payload: json})
            }
        }

        const fetchProjects = async () => {
            const response = await fetch('/api/project', {
                headers: {
                    'Authorization': `Bearer ${ user.token }` // sends authorisation header with the uer's token -> backend will validate token -> if valid, grant access to API
                }
            }) // using fetch() api to fetch data ad store in the variable
            const json = await response.json() // response object into json object, in this case an array of project objects

            // response OK
            if (response.ok) {
                setProjects({ type: 'SET_PROJECTS', payload: json})
            }
        }

        // if there is an authenticated user
        if (user) {
            fetchAssignment()
            fetchProjects()
        }
    }, [setAssignment, setProjects, user, id])

    return (
        <div className="assignment-details">
            { assignment && (
                <h2>{ assignment.title }</h2>
            )}
            {/* { projects && projects.map((project) => { // will only run when there is a project object
                if (user.organisation_id === project.organisation_id) // check if project belongs to user under same organisation

                return(<ProjectList key={ project._id } project={ project } />) // key must be unique
            })} */}
        </div>
    );
}
 
export default AssignmentDetails;