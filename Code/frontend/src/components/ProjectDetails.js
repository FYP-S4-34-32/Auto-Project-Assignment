

// imports
import { useProjectsContext } from "../hooks/useProjectsContext"
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useAuthenticationContext } from "../hooks/useAuthenticationContext"


const ProjectDetails = ({ project }) => {
    const { projects, dispatch } = useProjectsContext()
    const { user } = useAuthenticationContext()

    // CODE for extracting skill info and displaying them in the project details

    // if there is no user object - not logged in
    if (!user) {
        return
    }

    // delete projects
    const handleClick = async () => {
        const response = await fetch('/api/projects/' + project._id, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${ user.token }`
            }
        })

        const json = await response.json() // document of the project object that was deleted

        // response OK
        if (response.ok) {
            dispatch({ type: 'DELETE_PROJECT', payload: json})
        }

        // reponse NOT ok
        if (!response.ok) {
            console.log(json.error) // the error property from projectController.deleteProject --> return res.status(404).json({ error: "No such project" })
        }
    }

    // show delete button only if user is a Super Admin/admin
    const renderDeleteButton = (user) => {
        console.log(user)
        switch (user.role) {
            case 'Admin':
                return (
                    <span className="material-symbols-outlined" onClick = { handleClick }>delete</span>
                ) 
            case 'Superadmin':
                return (
                    <span className="material-symbols-outlined" onClick = { handleClick }>delete</span>
                ) 
        }
    }

    return (
        <div className="project-details">
        <h4>{ project.title }</h4>
        <p><strong>Project Title: </strong>{project.title}</p>
        <p><strong>Project Description: </strong>{project.description}</p>
        {/* <p><strong>Skills needed: </strong>{project.skills}</p> */}
        <p>{ formatDistanceToNow(new Date(project.createdAt), { addSuffix: true }) }</p>
        { renderDeleteButton(user) }
        </div>
    )
}

export default ProjectDetails