// ========================================================
// This page is used to display all users in the database
// ========================================================
// superadmin: can edit USER ROLES, can delete user accounts
// both superadmin and project admin: can edit USER CONTACT INFO, can delete EMPLOYEE accounts
// ========================================================

import { useState, useEffect} from 'react'   
import { useAuthenticationContext } from '../hooks/useAuthenticationContext'
import { useGetAllUsers } from '../hooks/useGetAllUsers'
import { useDeleteUser } from '../hooks/useDeleteUser' 
import { useGetAllOrganisations } from '../hooks/useGetAllOrganisations'
import { useNavigate} from 'react-router-dom'

const AllUsers = () => {
    var allUsersArray = []
    var projectAdminsArray = []
    var superAdminsArray = []
    var allEmployeesArray = [] 
    var organisationEmployeesArray = []
    var organisationsArray = []
    
    const { user } = useAuthenticationContext() // get the user object from the context 
    const navigate = useNavigate();

    const { getAllUsers, getAllUsersIsLoading, getAllUsersError, allUsers } = useGetAllUsers() // get the getAllUsers function from the context
    const { updateUsers, deleteUserIsLoading, deleteUserError } = useDeleteUser() // get the deleteUser function from the context
    const { getAllOrganisations, getAllOrganisationsIsLoading, getAllOrganisationsError, allOrganisations } = useGetAllOrganisations() // get the getAllOrganisations function from the context
    const [selectedUsers, setSelectedUsers] = useState("All Users") // for Super Admins
    const [selectedEmployees, setSelectedEmployees] = useState("Employees") // for Project Admins
    const [searchUsers, setSearch] = useState("")  
    const [filterOrgID, setFilterOrgID] = useState("All Organisations")  


    useEffect(() => {
        getAllUsers();

        if (user && user.role === "Super Admin")
            getAllOrganisations(user); 
    }, [])

    const filterUsers = () => {
        allUsersArray = allUsers
        organisationsArray = allOrganisations 

        if (user.role === "Super Admin") {
            for (var i = 0; i < allUsersArray.length; i++) {
                if (allUsersArray[i].role === "Admin") {
                    projectAdminsArray.push(allUsers[i])
                } else if (allUsersArray[i].role === "Super Admin") {
                    superAdminsArray.push(allUsers[i])
                } else if (allUsersArray[i].role === "Employee") {
                    allEmployeesArray.push(allUsers[i])
                }
            }
        }

        // organisation admin can only see employees in their OWN organisation
        if (user.role === "Admin") {
            for (var j = 0; j < allUsersArray.length; j++) {
                if (allUsersArray[j].role === "Employee" && allUsersArray[j].organisation_id === user.organisation_id) {
                    organisationEmployeesArray.push(allUsers[j])
                }
            }
        } 
        console.log("employees in organisation: ", organisationEmployeesArray)
    }

    filterUsers();

    // DELETE a user from the database
    const deleteUser = (email) => { 
        // console.log("to be deleted user's email: ", email)
        updateUsers(email); 
        getAllUsers(); // get updated array of users
    } 
    
    // search for users
    const searchUser = () => {   
        // super admin
        if (user.role === "Super Admin") {
            if (selectedUsers === "All Users" || selectedUsers === "Manage Users" || selectedUsers === " " || selectedUsers === "" || selectedUsers === null || selectedUsers === undefined || !selectedUsers) { 
                
                if ((searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers) && (filterOrgID === "All Organisations" || filterOrgID === "" || filterOrgID === null || filterOrgID === undefined || !filterOrgID)) {
                    return allUsersArray;
                } 

                if ((searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers) && (filterOrgID !== "All Organisations" || filterOrgID !== "" || filterOrgID !== null || filterOrgID !== undefined || filterOrgID)) {
                    return allUsersArray.filter((user) => {
                        return (user.organisation_id) === filterOrgID;
                    });
                } 

                return allUsersArray.filter((user) => {   
                    return ( (user.name).toLowerCase().includes(searchUsers.toLowerCase()) || (user.email).toLowerCase().includes(searchUsers.toLowerCase()) ) && (user.organisation_id) === filterOrgID;
                });
            }

            if (selectedUsers === "Project Admins") { 

                if ( (searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers) && (filterOrgID === "All Organisations" || filterOrgID === "" || filterOrgID === null || filterOrgID === undefined || !filterOrgID) ) {
                    return projectAdminsArray;
                }

                if ( (searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers) && (filterOrgID !== "All Organisations" || filterOrgID !== "" || filterOrgID !== null || filterOrgID !== undefined || filterOrgID) ) {
                    return projectAdminsArray.filter((user) => {
                        return (user.organisation_id) === filterOrgID;
                    });
                } 

                return projectAdminsArray.filter((user) => {
                    return ( (user.name).toLowerCase().includes(searchUsers.toLowerCase()) || (user.email).toLowerCase().includes(searchUsers.toLowerCase()) ) && (user.organisation_id) === filterOrgID ;
                })
            }

            if (selectedUsers === "Super Admins") {  

                if ( (searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers ) && (filterOrgID === "All Organisations" || filterOrgID === "" || filterOrgID === null || filterOrgID === undefined || !filterOrgID) ) {
                    return superAdminsArray;
                } 
                
                return superAdminsArray.filter((user) => {
                    return ( (user.name).toLowerCase().includes(searchUsers.toLowerCase()) || (user.email).toLowerCase().includes(searchUsers.toLowerCase()) ) ;
                })
            }

            if (selectedUsers === "Employees") { 

                if ( (searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers) && (filterOrgID === "All Organisations" || filterOrgID === "" || filterOrgID === null || filterOrgID === undefined || !filterOrgID)) {
                    return allEmployeesArray;
                }

                if ( (searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers) && (filterOrgID !== "All Organisations" || filterOrgID !== "" || filterOrgID !== null || filterOrgID !== undefined || filterOrgID) ) {
                    return allEmployeesArray.filter((user) => {
                        return (user.organisation_id) === filterOrgID;
                    });
                } 
                
                return allEmployeesArray.filter((user) => {
                    return ( (user.name).toLowerCase().includes(searchUsers.toLowerCase()) || (user.email).toLowerCase().includes(searchUsers.toLowerCase()) ) && (user.organisation_id) === filterOrgID ;
                })
            }
        }

        // project admins can only see employees in their OWN organisation
        console.log("selectedEmployees: ", selectedEmployees)
        if (user.role === "Admin") {  

            if (selectedEmployees === "Employees" || selectedEmployees === "Manage Employees" ||  selectedEmployees === " " || selectedEmployees === "" || selectedEmployees === null || selectedEmployees === undefined || !selectedUsers) {
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
    console.log("searchResults: ", searchResults);  
    // console.log("organisations: ", allOrganisations);

    // filter users by organisations, only for super admins
    const OrganisationFilter = () => {
        // selectable options for organisation filter
        const OrganisationFilterSelection = allOrganisations.map((organisation) => { 
            return (
                <option key={organisation._id} value={organisation.organisation_id}>{organisation.organisation_id}</option>
            )
        })

        if (user.role === "Super Admin") {
            // super admins do not belong to any organisation. No need to filter by organisation
            if (selectedUsers !== "Super Admins") { 
                return (
                    <div className="filter">
                        <select className="filter-select" onChange={(e) => setFilterOrgID(e.target.value)}>
                            <option value="All Organisations">All Organisations</option>
                            { OrganisationFilterSelection }
                        </select>
                    </div>
                )
            } 
        }
    }

    // pass user details to user details component
    const passUserDetails = (userDetails) => {
        console.log("user details: ", userDetails)
        const id = userDetails._id;
        const pathname = `/UserDetails/${id}`
        const state = userDetails

        navigate(pathname, {state})  
    }

    // RENDER results
    const renderSearchResults = searchResults.map((datum) => {
        // for super admin
        if (user.role === "Super Admin") {
            switch (selectedUsers) {
                case "Manage Users":  // super admin
                    var userDetail = datum; 
                    return (
                        <div className="user-div" key={userDetail._id} style={{height:"250px"}}>
                            <h3>{userDetail.name}</h3> 
                            <p>Organisation: {userDetail.organisation_id}</p>
                            <p>Email: {userDetail.email}</p>
                            <p>Role: {userDetail.role}</p>
                            <p>Contact Info: {userDetail.contact}</p>
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
        }

        else { 
            // for project admins
            switch (selectedEmployees) {
                case "Manage Employees": 
                    var userDetail = datum; 
                    return ( 
                        <div className="user-div" key={userDetail._id} style={{height:"250px"}}>
                            <h3>{userDetail.name}</h3> 
                            <p>Organisation: {userDetail.organisation_id}</p>
                            <p>Email: {userDetail.email}</p>
                            <p>Role: {userDetail.role}</p>
                            <p>Contact Info: {userDetail.contact}</p>
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
        }
    }); 

    // panel that shows the types of users
    const showUsersPanel = (user) => {
        switch (user.role) {
            case "Super Admin":
                return (
                    <div className="selection-panel">
                        <button onClick={() => setSelectedUsers("All Users")}>All Users</button>
                        <button onClick={() => setSelectedUsers("Project Admins")}>Project Admins</button>
                        <button onClick={() =>setSelectedUsers("Super Admins")}>Super Admins</button>
                        <button onClick={() =>setSelectedUsers("Employees")}>Employees</button>
                        <button onClick={() =>setSelectedUsers("Manage Users")}>Manage Users</button>
                    </div>
                )
            case "Admin":
                return (
                    <div className="selection-panel" style={{height:"100px"}}> 
                        <button onClick={() =>setSelectedEmployees("Employees")}>Employees</button>
                        <button onClick={() =>setSelectedEmployees("Manage Employees")}>Manage Employees</button>
                    </div>
                )
        }
    }
 
    return (
        <div>
            {showUsersPanel(user)}
            <div className="all-users">
                <div>  
                    <input className="search-input" type="search" placeholder="Search User" onChange={(e) => setSearch(e.target.value)} />  
                    
                    {OrganisationFilter()}
                    
                    { user.role === "Super Admin" && <h4>Showing {selectedUsers} from {filterOrgID}</h4>}
                    { user.role === "Admin" && <h4>Showing employees from {user.organisation_id}</h4>}
                    
                    {renderSearchResults}

                    {deleteUserError && <p>Error: {deleteUserError}</p>}
                </div>
            </div>
        </div>
    )

}

export default AllUsers