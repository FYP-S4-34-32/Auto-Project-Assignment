//=========================================//
// User Details page for an employee/user //
//=======================================//

// Path: Code/frontend/src/components/UserDetails.js

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthenticationContext } from '../hooks/useAuthenticationContext' 
import { useLocation, Link } from "react-router-dom";
import { useUpdateInfo } from '../hooks/useUpdateInfo' 
import { useUpdateRole } from '../hooks/useUpdateRole'
import { setHours } from 'date-fns';


const UserDetails = () => {
    const { user } = useAuthenticationContext(); // current user (admin or superadmin)
    const {updateInfo, isLoading, error} = useUpdateInfo();  
    const {updateRole, updateRoleIsLoading, updateRoleError} = useUpdateRole();
    const navigate = useNavigate();
    const location = useLocation(); 

    const userDetails = location.state
    const [editContactForm, setEditContactForm] = useState(false) 
    const [editRoleForm, setEditRoleForm] = useState(false)
    const [userContact, setUserContact] = useState(userDetails.contact)
    const [userRole, setUserRole] = useState(userDetails.role) 
    // console.log("current user: ", user) 

    const displaySkills = userDetails.skills.map((skill) => {
        return (
            <div key={skill._id}>
                <p> {skill.skill} : {skill.competency} </p>

            </div>
        )
    })

    // const displayProjects = userDetails.project_assigned.map((project) => {
    //     return (
    //         <div key={project._id}>
    //             <p> {project.name} </p>
    //         </div>
    //     )
    // })

    /*
        Super Admin
        -> can edit Project Admin's and Employee's User Role and Contact information

        Project Admin
        -> can edit the Contact information of Employees belonging to the same organisation
    */ 

    const handleSubmitContactInfo = async(e) => {
        e.preventDefault();
        console.log("userContact: ", userContact)

        setEditContactForm(!editContactForm)
        setUserContact(await updateInfo(userDetails.email, userContact));
    }
     
    const handleSubmitUserRole = async(e) => {
        e.preventDefault();
        console.log("to submit userRole: ", userRole)

        setUserRole(await updateRole(userDetails.email, userRole));
        setEditRoleForm(!editRoleForm);
    } 

    const displayUserDetails = () => {
        // superadmin does not have skills/projects 
        if (userDetails.role === 'Super Admin') {
            return (
                <div className="user-Details-detailsDiv" style={{width:"100%"}}>  
                    <h4>Name</h4>
                    {userDetails && <p> {userDetails.name} </p>}  

                    <hr/>

                    <h4>Name</h4>
                    {userDetails && <p> {userDetails.email} </p>}
                    <hr/>

                    <h4>Role</h4>
                    {userDetails && <p> {userDetails.role} </p>} 
                    <hr/>

                    <h4>Contact Info</h4> 
                    {userDetails && <p> {userDetails.contact} </p>}  
                </div>
            )
        }

        // project admins do not have skills/projects, but have organisation
        else if (userDetails.role === 'Admin') {
            return (
                <div>
                    <div className="user-Details-detailsDiv" style={{width:"60%", marginTop:"0px"}}>
                        <h4>Name</h4>
                        {userDetails && <p> {userDetails.name} </p>}   
                        <hr/>

                        <h4>Name</h4>
                        {userDetails && <p> {userDetails.email} </p>}
                        <hr/>

                        <h4 >Role</h4>
                        <form onSubmit={handleSubmitUserRole}>
                            <select defaultValue={userDetails.role} disabled={!editRoleForm} onChange={(e) => setUserRole(e.target.value)}>
                                <option value="Admin">Admin</option>
                                <option value="Employee">Employee</option> 
                            </select>
                            <button className="editRoleBtn" type="button" onClick={() => setEditRoleForm(!editRoleForm)} disabled={ isLoading }>Edit</button>
                            {editRoleForm && <button className="submitBtn">Submit</button>}
                        </form>
                        
                        <hr/>


                        <h4>Contact Info</h4>  
                        <form onSubmit={handleSubmitContactInfo}>
                            <input 
                                type="contact"
                                name="contact"
                                defaultValue={userDetails.contact}
                                disabled={!editContactForm}
                                onChange={(e) => setUserContact(e.target.value)}
                            />
                            <button className="editContactBtn" type="button" onClick={() => setEditContactForm(!editContactForm)} disabled={ isLoading }>Edit</button>
                            {editContactForm && <button className="submitBtn">Submit</button>}
                        </form>
                         

                        {user.role !== 'Super Admin' && <p> {userDetails.contact} </p>}
                         
                    </div>
                     <div className='userDetails-orgDiv' style={{width:"40%"}}>
                        <h4>Organisation</h4>
                        {userDetails && <p> {userDetails.organisation_id} </p>}
                    </div> 
                </div>
            ) 
        }

        // employees have skills, projects and organisation
        else if (userDetails.role === 'Employee') {
            return (
                <div>  
                     <div className="user-Details-detailsDiv"> 
                        <h4>Name</h4>
                        {userDetails && <p> {userDetails.name} </p>}   
                        <hr/>
        
                        <h4>Name</h4>
                        {userDetails && <p> {userDetails.email} </p>}
                        <hr/>
        
                        <h4>Role</h4>
                        {/* ONLY SUPER ADMIN CAN EDIT USER ROLES*/}
                        {user.role === 'Super Admin' && 
                            <form onSubmit={handleSubmitUserRole}>
                                <select defaultValue={userDetails.role} disabled={!editRoleForm} onChange={(e) => setUserRole(e.target.value)}>
                                    <option value="Admin">Admin</option>
                                    <option value="Employee">Employee</option> 
                                </select>
                                <button className="editRoleBtn" type="button" onClick={() => setEditRoleForm(!editRoleForm)} disabled={ isLoading }>Edit</button>
                                {editRoleForm && <button className="submitBtn">Submit</button>}
                            </form>
                        }   

                        {user.role !== 'Super Admin' && <p> {userDetails.role} </p>} {/*PROJECT ADMINS CAN ONLY VIEW USER ROLES*/}
                        <hr/>
        
                        <h4>Contact Info</h4>
                        <form onSubmit={handleSubmitContactInfo}>
                            <input 
                                type="contact"
                                name="contact"
                                defaultValue={userDetails.contact}
                                disabled={!editContactForm}
                                onChange={(e) => setUserContact(e.target.value)}
                            />
                            <button className="editContactBtn" type="button" onClick={() => setEditContactForm(!editContactForm)} disabled={ isLoading }>Edit</button>
                            {editContactForm && <button className="submitBtn">Save</button>}
                        </form>        
                    </div>
                    <div style={{width:"50%"}}>
                        <div className="userDetails-tableDiv">
                            <div className='userDetails-orgDiv'>
                                <h4>Organisation</h4>
                                {userDetails && <p> {userDetails.organisation_id} </p>}
                            </div>
                
                            <div className="userDetails-skillsDiv">
                                <h4>Skills</h4>
                                {userDetails && displaySkills}
                            </div>
                        </div> 

                        <div className='userDetails-projectsDiv'>
                            <h4>Projects</h4>
                        </div> 
                    </div> 
                   
                </div>
            )
        }
    }

    return (
        <div className="user-Details">
            <h2>User Details</h2>  
            {/* <Link to="/AllUsers">Back to Users</Link> */}
            {displayUserDetails()}     
        </div>
    )
}

export default UserDetails;