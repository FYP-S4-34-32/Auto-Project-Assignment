//=====================================================//
// Organisation Details page for an individual project //
//=====================================================//

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthenticationContext } from "../hooks/useAuthenticationContext";
import { useOrganisationsContext } from "../hooks/useOrganisationsContext";
import { useGetAllUsers } from '../hooks/useGetAllUsers'
import { useDeleteUser } from '../hooks/useDeleteUser'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const OrganisationDetails = () => {
    var allUsersArray = []
    var projectAdminsArray = []
    var superAdminsArray = []
    var allEmployeesArray = [] 
    var organisationEmployeesArray = []

    const { user } = useAuthenticationContext()
    const { organisation, dispatch } = useOrganisationsContext() // note organisation instead of organisations -> because we are setting the state of ONE organisation using SET_ONE_ORGANISATION

    const { id } = useParams()
    const navigate = useNavigate()

    const { getAllUsers, getAllUsersIsLoading, getAllUsersError, allUsers } = useGetAllUsers() // get the getAllUsers function from the context
    const { updateUsers, deleteUserIsLoading, deleteUserError } = useDeleteUser() // get the deleteUser function from the context
    const [selectedUsers, setSelectedUsers] = useState("")
    const [searchUsers, setSearch] = useState("")  

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
    }, [dispatch, user, id])

    useEffect(() => {
        getAllUsers();
    }, [])

    //filter users need to filter match user's organisation id with current organisation's orgname
    const filterUsers = () => {
        allUsersArray = allUsers

        if (user.role == "Super Admin") {
            for (var i = 0; i < allUsersArray.length; i++) {
                if (allUsersArray[i].role === "Admin" && allUsersArray[i].organisation_id === "Microsoft") {
                    projectAdminsArray.push(allUsers[i])
                } else if (allUsersArray[i].role === "Employee" && allUsersArray[i].organisation_id === "Microsoft") {
                    allEmployeesArray.push(allUsers[i])
                }
            }
        }
    }

    filterUsers();
    // console.log("organisation name: ", organisation.orgName)

    
    // delete a user from the database
    const deleteUser = (email) => { 
        console.log("to be deleted user's email: ", email)
        updateUsers(email); 
        getAllUsers(); // get updated array of users
    } 
    
    // search for users
    const searchUser = () => {   

        // super admin
        if (user.role === "Super Admin") {
            if (selectedUsers === "allUsers" || selectedUsers === "manageUsers" || selectedUsers === " " || selectedUsers === "" || selectedUsers === null || selectedUsers === undefined || !selectedUsers) { 
                if (searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers) {
                    return allUsersArray;
                } 

                return allUsersArray.filter((user) => {  
                    return (user.name).toLowerCase().includes(searchUsers.toLowerCase()) || (user.email).toLowerCase().includes(searchUsers.toLowerCase()) || (user.role).toLowerCase().includes(searchUsers.toLowerCase());
                });
            }

            if (selectedUsers === "projectAdmins") {
                if (searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers) {
                    return projectAdminsArray;
                }

                return projectAdminsArray.filter((user) => {
                    return (user.name).toLowerCase().includes(searchUsers.toLowerCase()) || (user.email).toLowerCase().includes(searchUsers.toLowerCase()) || (user.role).toLowerCase().includes(searchUsers.toLowerCase());
                })
            }

            if (selectedUsers === "employees") {
                if (searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers) {
                    return allEmployeesArray;
                }
                
                return allEmployeesArray.filter((user) => {
                    return (user.name).toLowerCase().includes(searchUsers.toLowerCase()) || (user.email).toLowerCase().includes(searchUsers.toLowerCase()) || (user.role).toLowerCase().includes(searchUsers.toLowerCase());
                })
            }
        }

        // super admins
        if (user.role === "Super Admin") { 
            if (selectedUsers === "employees" || selectedUsers === "manageEmployees" ||  selectedUsers === " " || selectedUsers === "" || selectedUsers === null || selectedUsers === undefined || !selectedUsers) {
                if (searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers) {
                    return organisationEmployeesArray;
                }

                return organisationEmployeesArray.filter((employee) => {
                    if (employee.organisation_id === user.organisation_id) {
                        return employee.name.toLowerCase().includes(searchUsers.toLowerCase());
                    }
                })
            } 

        }
    }

    const searchResults = searchUser(); 

    // pass user details to user details component
    const passUserDetails = (userDetails) => {
        console.log("user details: ", userDetails)
        const id = userDetails._id;
        const pathname = `/UserDetails/${id}`
        const state = userDetails

        navigate(pathname, {state}) // pass the user's email as state
    }

    const renderSearchResults = searchResults.map((datum) => {
        switch (selectedUsers) {
            case "manageUsers": 
                var user = datum; 
                return (
                    <div className="user-div" key={user._id} style={{height:"250px"}}>
                        <h3>{user.name}</h3> 
                        <p>Organisation: {user.organisation_id}</p>
                        <p>Email: {user.email}</p>
                        <p>Role: {user.role}</p>
                        <p>Contact Info: {user.contact}</p>
                        <span className="material-symbols-outlined" id="deleteButton" onClick={() => deleteUser(datum.email)} style={{float:"right", marginRight:"30px", marginBottom:"30px"}}>delete</span>
                    </div>
                ) 
            case "manageEmployees":
                var user = datum; 
                return ( 
                    <div className="user-div" key={user._id} style={{height:"250px"}}>
                        <h3>{user.name}</h3> 
                        <p>Organisation: {user.organisation_id}</p>
                        <p>Email: {user.email}</p>
                        <p>Role: {user.role}</p>
                        <p>Contact Info: {user.contact}</p>
                        <span className="material-symbols-outlined" id="deleteButton" onClick={() => deleteUser(datum.email)} style={{float:"right", marginRight:"30px", marginBottom:"30px"}}>delete</span>
                    </div>
                )

            default:
                var userDetails = datum;
                return (
                     <div className="user-div" key={userDetails._id} style={{height:"210px"}} onClick={() => passUserDetails(userDetails)}>
                        <h3>{userDetails.name}</h3> 
                        <p>Organisation: {userDetails.organisation_id}</p>
                        <p>Email: {userDetails.email}</p>
                        <p>Role: {userDetails.role}</p>
                        <p>Contact Info: {userDetails.contact}</p>
                    </div> 
                ) 
        } 
    });

    // panel that shows the types of users
    const showUsersPanel = (user) => {
        switch (user.role) {
            case "Super Admin":
                return (
                    <div className="selection-panel">
                        <button onClick={() => setSelectedUsers("allUsers")}>All Users</button>
                        <button onClick={() => setSelectedUsers("projectAdmins")}>Project Admins</button>
                        <button onClick={() =>setSelectedUsers("employees")}>Employees</button>
                        <button onClick={() =>setSelectedUsers("manageUsers")}>Manage Users</button>
                    </div>
                )
            case "Admin":
                return (
                    <div className="selection-panel" style={{height:"100px"}}> 
                        <button onClick={() =>setSelectedUsers("employees")}>Employees</button>
                        <button onClick={() =>setSelectedUsers("manageEmployees")}>Manage Employees</button>
                    </div>
                )
        }
    }

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
        <div>
            <div className="project-details">
                { organisation && (
                    <article>
                        <h2>{ organisation.orgname }</h2>
                        <p>Created { formatDistanceToNow(new Date(organisation.createdAt), { addSuffix: true }) } by { organisation.created_by }</p>
                        <div>
                            <p><strong>Project Description: </strong></p>
                            <p>{ organisation.detail }</p>
                        </div>
                        { user.role === 'Super Admin' && <button onClick={ handleClick }>Delete</button> }
                    </article>
                )}
            </div>
            <div>
                {showUsersPanel(user)}
                <div className="all-users">
                    <div>  
                        <input className="search-input" type="search" placeholder="Search User" onChange={(e) => setSearch(e.target.value)} />  
    
                        {renderSearchResults}
                        {deleteUserError && <p>Error: {deleteUserError}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
 
export default OrganisationDetails;