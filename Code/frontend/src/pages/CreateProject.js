//=====================//
// Create Project page // --> Just a template for now - a lot of changes to be made - HAVE NOT SET UP BACKEND
//=====================//

// components
import { useEffect } from "react"
import { useAuthenticationContext } from "../hooks/useAuthenticationContext"
import ProjectForm from "../components/ProjectForm"
import ProjectDetails from "../components/ProjectDetails"
import { useProjectsContext } from "../hooks/useProjectsContext"

const CreateProject = () => {

    const { projects, dispatch } = useProjectsContext()

    // check for authenticated user object
    const { user } = useAuthenticationContext()

    // fires when component is rendered
    useEffect(() => {
        const fetchProjects = async () => {
            const response = await fetch('/api/project', {
                header: {
                    'Authorization': `Bearer ${ user.token }` // sends authorisation header with the uer's token -> backend will validate token -> if valid, grant access to API
                }
            }) // using fetch() api to fetch data ad store in the variable
            const json = await response.json() // response object into json object, in this case an array of project objects

            // response OK
            if (response.ok) {
                dispatch({ type: 'SET_PROJECTS', payload: json})
            }
        }

        // if there is an authenticated user
        if (user) {
            fetchProjects()
        }
    }, [dispatch, user])

    // return a template
    return (
        <div className="createproject">
            <div className="projects">
                { projects && projects.map((project) => ( // will only run when there is a project object
                    <ProjectDetails key={ project._id } project={ project } /> // key must be unique
                ))}
            </div>
            <ProjectForm />
        </div>
    )
}

export default CreateProject
