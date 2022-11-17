const ProjectDetails = ({ project }) => {
    return (
        <div className="user-details">
        <h4>Project Listings - testing</h4>
        <p><strong>Project Title: </strong>{project.title}</p>
        <p><strong>Project Description: </strong>{project.description}</p>
        <p><strong>Skills needed: </strong>{project.skills}</p>
        </div>
    )
}

export default ProjectDetails