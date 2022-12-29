//======================//
// Assignment Lisiting //
//======================//

// imports
import { useAuthenticationContext } from "../hooks/useAuthenticationContext"
import { Link } from "react-router-dom"


const AssignmentList = ({ assignment }) => {
    const { user } = useAuthenticationContext()

    // if there is no user object - not logged in
    if (!user) {
        return
    }

    const sDate = new Date(assignment.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const eDate = new Date(assignment.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })

    return (
        <div className="project-list" key={ assignment._id }>
            <Link to={ `/assignment/${ assignment._id }` }>
                <h4>{ assignment.title }</h4>
                <p><strong>Projects: </strong>{ assignment.projects.length }</p>
                <p><strong>Employees: </strong>{ assignment.employees.length }</p>
                <p><strong>Threshold: </strong>{ assignment.threshold }</p>
                <p><strong>Start Date: </strong>{ sDate }</p>
                <p><strong>End Date: </strong>{ eDate }</p>
                <p><strong>Created by: </strong>{ assignment.created_by }</p>
            </Link>
        </div>
    )
}

export default AssignmentList