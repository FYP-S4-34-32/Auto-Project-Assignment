//=====================================================//
// Organisation Details page for an individual project //
//=====================================================//

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthenticationContext } from "../hooks/useAuthenticationContext";
import { useOrganisationsContext } from "../hooks/useOrganisationsContext";
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const OrganisationDetails = () => {
    const { user } = useAuthenticationContext()
    const { organisation, dispatch } = useOrganisationsContext() // note organisation instead of organisations -> because we are setting the state of ONE organisation using SET_ONE_ORGANISATION

    const { id } = useParams()

    const navigate = useNavigate()
    
    // fires when the component is rendered
    useEffect(() => {
        const fetchOrganisation = async () => {
            const response = await fetch('/api/organisation/' + id, { // fetch the project based on the project's id
                headers: {
                    'Authorization': `Bearer ${ user.token }` // sends authorisation header with the user's token -> backend will validate token -> if valid, grant access to API
                }
            }) // using fetch() api to fetch data and store in the variable

            const json = await response.json() // response object into json object

            // response OK
            if (response.ok) {
                dispatch({ type: 'SET_ONE_ORGANISATION', payload: json})
            }
        }

        // if there is an authenticated user
        if (user && user.role === "Super Admin") {
            fetchOrganisation()
        }
    }, [dispatch, user, organisation, id])

    // delete project
    const handleClick = async () => {
        const response = await fetch('/api/organisation/' + id, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${ user.token }`
            }
        })

        const json = await response.json() // document of the organisation object that was deleted

        // response OK
        if (response.ok) {
            navigate('/') // navigate back to home page aka organisation listing page
        }

        // reponse NOT ok
        if (!response.ok) {
            console.log(json.error) // the error property from organisationController.deleteOrganisation --> return res.status(404).json({ error: "No such organisation" })
        }
    }

    return (
        <div className="project-details">
            { organisation && (
                <article>
                    <h2>{ organisation.name }</h2>
                    <p>Created { formatDistanceToNow(new Date(organisation.createdAt), { addSuffix: true }) } by { organisation.created_by }</p>
                    <div>
                        <p><strong>Project Description: </strong></p>
                        <p>{ organisation.detail }</p>
                    </div>
                    { user.role === 'Super Admin' && <button onClick={ handleClick }>Delete</button> }
                </article>
            )}
        </div>
    );
}
 
export default OrganisationDetails;