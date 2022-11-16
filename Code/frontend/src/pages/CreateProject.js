//=====================//
// Create Project page // --> Just a template for now - a lot of changes to be made - HAVE NOT SET UP BACKEND
//=====================//

// components
import { useEffect, useState } from "react"
import { useAuthenticationContext } from "../hooks/useAuthenticationContext"
import ProjectForm from "../components/ProjectForm"
// import ProjectDetails from "../components/ProjectDetails"

const CreateProject = () => {

    const [projects, setProjects] = useState(null)

    useEffect(() => {
        const fetchProjects = async() => {
            const response = await fetch('/api/project')
            const json = await response.json()

            if (response.ok) {
                setProjects(json)
            }
        }

        fetchProjects()
    }, [])
    
    const { project } = useAuthenticationContext()

    return (
        <div className="home">
            {/* <div className="workouts">
                {projects && projects.map((project) => (
                   <ProjectDetails key={Project._id} project={project}/>
                ))}
            </div>
            <div className="user-details">
            <h4>Project Listings - testing</h4>
            <p><strong>Project Title: </strong>{project.title}</p>
            <p><strong>Project Description: </strong>{project.description}</p>
            <p><strong>Skills needed: </strong>{project.skills}</p>
            </div> */}
            <ProjectForm/> 
        </div>
    )
}

export default CreateProject
