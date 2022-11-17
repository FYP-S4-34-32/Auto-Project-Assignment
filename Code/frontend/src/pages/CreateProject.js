//=====================//
// Create Project page // --> Just a template for now - a lot of changes to be made - HAVE NOT SET UP BACKEND
//=====================//

// components
import { useEffect, useState } from "react"
import { useAuthenticationContext } from "../hooks/useAuthenticationContext"
import ProjectForm from "../components/ProjectForm"
import ProjectDetails from "../components/ProjectDetails"
// import ProjectDetails from "../components/ProjectDetails"

const CreateProject = () => {

    const [projects, setProjects] = useState(null)

    useEffect(() => {
        const fetchProjects = async() => {
            const response = await fetch('/api/projects')
            const json = await response.json()

            if (response.ok) {
                setProjects(json)
            }
        }

        fetchProjects()
    }, [])

    return (
        <div className="home">
            <div className="user-profile">
                {projects && projects.map((project) => (
                    <ProjectDetails key={project._id} project={project} />
                ))}
            </div>
            <ProjectForm/> 
        </div>
    )
}

export default CreateProject
