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

const AllUsers = () => {
    var allUsersArray = []
    var projectAdminsArray = []
    var superAdminsArray = []
    var employeesArray = [] 
    
    const { user } = useAuthenticationContext() // get the user object from the context 
    const { getAllUsers, getAllUsersIsLoading, getAllUsersError, allUsers } = useGetAllUsers() // get the getAllUsers function from the context
    const { updateUsers, deleteUserIsLoading, deleteUserError } = useDeleteUser() // get the deleteUser function from the context
    const [selectedUsers, setSelectedUsers] = useState("")
    const [searchUsers, setSearch] = useState("") 
    
    // const handleGetAllUsers = async () => {
        
    //     await getAllUsers()
    // }

    const filterUsers = () => {
        allUsersArray = allUsers

        for (var i = 0; i < allUsersArray.length; i++) {
            if (allUsersArray[i].role === "Admin") {
                projectAdminsArray.push(allUsers[i])
            } else if (allUsersArray[i].role === "Super Admin") {
                superAdminsArray.push(allUsers[i])
            } else if (allUsersArray[i].role === "Employee") {
                employeesArray.push(allUsers[i])
            }
        }
    }

    filterUsers()
    // console.log("projectAdminsArray: ", projectAdminsArray)
    // console.log("superAdminsArray: ", superAdminsArray)
    // console.log("employeesArray: ", employeesArray)

    useEffect(() => {
        getAllUsers();
    }, [])

    // delete a user from the database
    const deleteUser = (index) => { 
        console.log("deleteUser: ", allUsersArray[index].email)
        updateUsers(allUsersArray[index].email)
    } 
    
    // search for users
    const searchUser = () => {  

        console.log("selectedUsers: ", selectedUsers)
        console.log("searchUsers: ", searchUsers)

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

            if (selectedUsers === "superAdmins") {
                if (searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers) {
                    return superAdminsArray;
                }
                
                return superAdminsArray.filter((user) => {
                    return (user.name).toLowerCase().includes(searchUsers.toLowerCase()) || (user.email).toLowerCase().includes(searchUsers.toLowerCase()) || (user.role).toLowerCase().includes(searchUsers.toLowerCase());
                })
            }

            if (selectedUsers === "employees") {
                if (searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers) {
                    return employeesArray;
                }
                
                return employeesArray.filter((user) => {
                    return (user.name).toLowerCase().includes(searchUsers.toLowerCase()) || (user.email).toLowerCase().includes(searchUsers.toLowerCase()) || (user.role).toLowerCase().includes(searchUsers.toLowerCase());
                })
            }
        }

        // project admins
        if (user.role === "Admin") { 
            if (selectedUsers === "employees" || selectedUsers === "manageEmployees" ||  selectedUsers === " " || selectedUsers === "" || selectedUsers === null || selectedUsers === undefined || !selectedUsers) {
                if (searchUsers === "" || searchUsers === null || searchUsers === undefined || searchUsers === " " || !searchUsers) {
                    return employeesArray;
                }

                return employeesArray.filter((employee) => {
                    if (employee.organisation_id === user.organisation_id) {
                        return employee.name.toLowerCase().includes(searchUsers.toLowerCase());
                    }
                })
            } 

        }
    }

    const searchResults = searchUser();
    console.log("searchResults: ", searchResults);  

    const renderSearchResults = searchResults.map((datum, index) => {
        switch (selectedUsers) {
            case "manageUsers": 
                var user = datum

                return (
                    <div className="user-div" key={user._id} style={{height:"250px"}}>
                        <h3>{user.name}</h3>
                        <p>Organisation: {user.organisation_id}</p>
                        <p>Email: {user.email}</p>
                        <p>Role: {user.role}</p>
                        <p>Contact Info: {user.contact}</p>
                        <span className="material-symbols-outlined" onClick={() => deleteUser(index)} style={{float:"right", marginRight:"30px", marginBottom:"30px"}}>delete</span>
                    </div>
                ) 
            case "manageEmployees":
                var user = datum

                return ( 
                    <div className="user-div" key={user._id} style={{height:"250px"}}>
                        <h3>{user.name}</h3>
                        <p>Organisation: {user.organisation_id}</p>
                        <p>Email: {user.email}</p>
                        <p>Role: {user.role}</p>
                        <p>Contact Info: {user.contact}</p>
                        <span className="material-symbols-outlined" onClick={() => deleteUser(index)} style={{float:"right", marginRight:"30px", marginBottom:"30px"}}>delete</span>
                    </div>
                )

            default:
                var user = datum
                return (
                     <div className="user-div" key={user._id} style={{height:"200px"}}>
                        <h3>{user.name}</h3>
                        <p>Organisation: {user.organisation_id}</p>
                        <p>Email: {user.email}</p>
                        <p>Role: {user.role}</p>
                        <p>Contact Info: {user.contact}</p>
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
                        <button onClick={() =>setSelectedUsers("superAdmins")}>Super Admins</button>
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


    return (
        <div>
            {showUsersPanel(user)}
            <div className="allUsers-div"> 
                <form className="search" onSubmit={() => searchUser}>
                    <input type="text" placeholder="Search User" onChange={(e) => setSearch(e.target.value)} />
                    {/* <button type="submit">Search</button> */}
                </form> 

                {renderSearchResults}

                {deleteUserError && <p>Error: {deleteUserError}</p>}
            </div>
        </div>
    )

}

export default AllUsers