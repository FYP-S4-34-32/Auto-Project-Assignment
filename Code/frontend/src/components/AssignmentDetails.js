//=============================================================//
// Assignment Details page for an individual Assignment Object //
//=============================================================//

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuthenticationContext } from "../hooks/useAuthenticationContext";
import { useOrganisationsContext } from "../hooks/useOrganisationsContext";
import { useAssignmentContext } from "../hooks/useAssignmentContext";
import { useProjectsContext } from "../hooks/useProjectsContext";
import { useGetAllUsers } from '../hooks/useGetAllUsers'
import { useUpdateEmployees } from '../hooks/useUpdateAssnEmployees'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'


const AssignmentDetails = () => {
    const { user } = useAuthenticationContext()
    const { assignment, dispatch: setAssignment } = useAssignmentContext()
    const { projects, dispatch: setProjects } = useProjectsContext()
    const { getAllUsers, allUsers } = useGetAllUsers() // get the getAllUsers function from the context
    const [selectedInfo, setSelectedInfo] = useState(''); 
    const [EmployeesForm, setShowEmployeesForm] = useState(false);
    const { organisation } = useOrganisationsContext()
    const { updateEmployees, updateEmployeesError, updateEmployeesIsLoading } = useUpdateEmployees()

    const { id } = useParams()

    var allUsersArray = []
    var organisationUsersArray = []

    // Assignment array of employees and projects
    //const [assignmentObject, setAssignmentObject] = useState(assignment)     
    //const [tempAssignmentProjectsArr, setTempAssignmentProjects] = useState(assignmentObject.projects);
    const [tempAssignmentEmployeesArr, setTempAssignmentEmployees] = useState([]);
    const [finalAssignmentEmployeesArr, setFinalAssignmentEmployees] = useState([]);
    const [addEmployeeArr, setAddEmployeeArr ] = useState([]);
    const [ updateEmployeeArr, setUpdateEmployee ] = useState([]);

    const [addUser, setAddUser] = useState(null);

    var availEmployeesArray = []; // available list of employees for admin to select from
    
    
    // fires when the component is rendered
    useEffect(() => {

        const fetchProjects = async () => {
            const response = await fetch('/api/project', {
                headers: {
                    'Authorization': `Bearer ${ user.token }` // sends authorisation header with the uer's token -> backend will validate token -> if valid, grant access to API
                }
            }) // using fetch() api to fetch data ad store in the variable
            const json = await response.json() // response object into json object, in this case an array of project objects

            // response OK
            if (response.ok) {
                setProjects({ type: 'SET_PROJECTS', payload: json})
            }
        }

        // if there is an authenticated user
        if (user) {
            fetchAssignment()
            fetchProjects()
        }
    }, [setAssignment, setProjects, user, id])

    const fetchAssignment = async () => {
        const response = await fetch('/api/assignment/' + id, { // fetch the assignment based on the assignment's id
            headers: {
                'Authorization': `Bearer ${ user.token }` // sends authorisation header with the user's token -> backend will validate token -> if valid, grant access to API
            }
        }) // using fetch() api to fetch data and store in the variable

        const json = await response.json() // response object into json object

        // response OK
        if (response.ok) {
            setAssignment({ type: 'SET_ONE_ASSIGNMENT', payload: json})
        }
    }

    useEffect(() => {
        getAllUsers();
    }, []) 

    //filter users to match with current organisation id
    const filterOrganisationUsers = () => {
        if (user.organisation_id !== undefined) {
            allUsersArray = allUsers
            if (user.role !== "Employee") {
                for (var i = 0; i < allUsersArray.length; i++) {
                    if (allUsersArray[i].role === "Employee" && allUsersArray[i].organisation_id === assignment.organisation_id) {
                        organisationUsersArray.push(allUsers[i])
                    }
                }
                setTempAssignmentEmployees(organisationUsersArray);
            }
        }
    }

    // DEFAULT AVAILABLE LIST OF EMPLOYEES
    // will change based on current list of added employees
    const initialiseAvailEmployeesArray = () => {
        var temp = [];
        temp.push({name: "0", label: "Select an Employee"});

        for (var i = 0; i < tempAssignmentEmployeesArr.length; i++) {
            temp.push({name: tempAssignmentEmployeesArr[i].name, email: tempAssignmentEmployeesArr[i].email  });
        }

        console.log("initialised avail employees", temp);
        return temp;
    }

    availEmployeesArray = initialiseAvailEmployeesArray();
    
    // validate add employees list: should only have employees that are not already in array
    const validateAssignmentEmployeeArr = () => {
        var tempAssnEmployeesArr = availEmployeesArray;
        console.log("addEmployeeArr: ", addEmployeeArr);

        for (var i = 0; i < addEmployeeArr.length; i++) {
            for (var j = 0; j < tempAssnEmployeesArr.length; j++) {
                if (addEmployeeArr[i].email === tempAssnEmployeesArr[j].email) {
                    tempAssnEmployeesArr.splice(j, 1);
                }
            }
        }
        availEmployeesArray = JSON.parse(JSON.stringify(tempAssnEmployeesArr)); 
        console.log("(validateAssignmentEmployeeArr) avail employees: ", availEmployeesArray);
    }

    // const validateEmployeeArr = () => {
    //     var temparr = availEmployeesArray; 
    //     console.log("tempAssignmentEmployeesArr: ", availEmployeesArray);
    
    //     for (var i = 0; i < temparr.length; i++) {
    //         for (var j = 0; j < addEmployeeArr.length; j++) {
    //             if (addEmployeeArr[j].email === temparr[i].email) {
    //                 temparr.splice(i, 1);
    //             }
    //         }
    //     }
    //     temparr.sort((a, b) => {
    //         var nameA = a.name.split(',')[0];
    //         var nameB = b.name.split(',')[0];
    //         var numA = a.name.split(',')[1];
    //         var numB = b.name.split(',')[1];
    //         if(nameA === nameB) return numA - numB;
    //         if(nameA > nameB) return 1;
    //         if(nameA < nameB) return -1;
    //         return 0;
    //     });
    
    //     availEmployeesArray = JSON.parse(JSON.stringify(temparr)); 
    //     console.log("(validateEmployeeArr) avail employees: ", availEmployeesArray);
    // }
    

    // EDIT EMPLOYEES LIST
    const editEmployees = () => {
        filterOrganisationUsers(); 
        validateAssignmentEmployeeArr();
        setAddEmployeeArr([...assignment.employees]);
        
        setShowEmployeesForm('editEmployees');
    }

    // CANCEL EDIT EMPLOYEES LIST
    const cancelEditEmployees = () => {
        setTempAssignmentEmployees([...assignment.employees]);  

        setShowEmployeesForm('showEmployees');
    }

    // ADD A NEW EMPLOYEE
    const addEmployees = (e) => { 
        let temp = ([...addEmployeeArr]); 
        let selectedOption = JSON.parse(e.target.value);
        let newEmployee = {name: selectedOption.name, email: selectedOption.email};
        temp.push(newEmployee); 
        setAddUser(newEmployee);
        // console.log(temp)
        setAddEmployeeArr([...temp]);
    } 

     // DELETE AN EMPLOYEE
     const deleteEmployees = (index) => { 
        let temp = [...addEmployeeArr]; 
        let deletedEmployee = temp.splice(index, 1);  
        setAddEmployeeArr([...temp]);
        //setTempAssignmentEmployees([...addEmployeeArr])    

        // Move the deleted employee back to the availEmployeesArray
        availEmployeesArray.push(deletedEmployee[0])
        setTempAssignmentEmployees([...availEmployeesArray]);
    }


    // HANDLE SUBMITTING OF EMPLOYEES 
    const handleSubmitEmployees = async(e) => {
        e.preventDefault();   
        // console.log(addEmployeeArr)
        
        await updateEmployees(user, id, addEmployeeArr);  // to update employees
        fetchAssignment() // to fetch user's profile since it was updated

        setShowEmployeesForm('showEmployees');
        }

    // ========================================================================================================
    // PAGE CONTENT
    // ========================================================================================================

    // to render employees section
    const showEmployees = () => {  

        validateAssignmentEmployeeArr();
        console.log(availEmployeesArray);
        //console.log(tempAssignmentEmployeesArr);
        //console.log(addEmployeeArr);

        // select Employees
        var showAvaiEmployees = [...availEmployeesArray].map((datum, index) => {
            var avaiEmployee = datum;
            if (avaiEmployee.name === "0") {
                return (
                    <option key={ index } value={avaiEmployee.label}>{avaiEmployee.label} </option>
                )
            }
            else {
                return (
                    <option key={ index } value={JSON.stringify({name: avaiEmployee.name, email: avaiEmployee.email})}>{ avaiEmployee.name }, {avaiEmployee.email} </option>
                )
            }
           
        })

        // show Employees (current -> from assignment.employees)
        var showEmployeeRows = assignment.employees.map((employee, index) => {
            return (
                <p key={ index }>{ employee.name } - { employee.email }</p>
            )
        }) 

        // select competency levels for current skills
        var editingEmployeeList = addEmployeeArr.map((employee, index) => {

            return (
                <p key={ index }>{ employee.name } - {employee.email}   
                    <span className="material-symbols-outlined" onClick={() => deleteEmployees(index)} style={{marginLeft:"20px"}}>delete</span> 
                 </p>
            )
        })

        switch (EmployeesForm) {
            case 'showEmployees': // show employees
                return (
                    <div>
                        { showEmployeeRows }
                        <button className="editEmployeesBtn" onClick={() => editEmployees()}>Edit Employees</button>
                    </div>
                ) 

            case 'editEmployees': // editing employees
                
                return (
                    <div>  
                        <form className='editEmployeesForm'>
                            <h3>Add New Employees</h3>
                            <div> 
                                <select className="employeeSelection" onChange={addEmployees} value="Select a user to be added"> 
                                    {showAvaiEmployees}
                                </select>
                            </div>
                            <hr></hr>
                            <h3>Edit Employees List</h3>
                            { editingEmployeeList }
                            <br></br>

                            <button className="cancelBtn" style={{float:"left"}} onClick={() => cancelEditEmployees()}>Cancel</button>
                            <button className="submitBtn" onClick={handleSubmitEmployees}>Submit</button>
                            {/*updateEmployeesError && <p>{updateEmployeesError}</p>*/}
                        </form>
                    </div> 
                )
            default: // display assignment employees
                return (
                    <div>
                        { showEmployeeRows }
                        <button className="editEmployeesBtn" onClick={() => editEmployees()}>Edit Employees</button>
                    </div>
                )
        }
    }

    // LEFT DIVIDER: INFO PANEL
    // where user can select what info to view
    const infoPanel = () => {
                return (
                    <div className="profile-panel" style={{height:'150px'}}>
                        <button onClick={() => setSelectedInfo('showAssignmentDetails')}> Assignment Details </button>
                        <button onClick={() => setSelectedInfo('addProjects') }> Add Projects </button>
                        <button onClick={() => setSelectedInfo('addEmployees')} > Add Employees </button>
                    </div>
            )
        }

    // RIGHT DIVIDER: SHOWS USER INFORMATION
    // where user can view and edit their information
    const showSelectedInfo = () => {
        switch(selectedInfo) {
            case 'addProjects':
                return (
                    {/*loop through list of all projects under the same organisation, allow admin to choose multiple projects without pushing first */}
                )
            case 'addEmployees':
                return (
                    <div className="user-profile">
                        
                        <h2> Current List of Employees </h2>  
                        {showEmployees()}
                    </div> 
                ) 
            // DEFAULT: DISPLAY USER INFORMATION
            case 'showAssignmentDetails':
            default: 
                return (
                    <div className="user-profile">
                        { assignment && (
                            <article>
                                <h2>{ assignment.title }</h2>
                                <p>Created { formatDistanceToNow(new Date(assignment.createdAt), { addSuffix: true }) } by { assignment.created_by }</p>
                                    <div>
                                        <p><strong>Projects in this assignment: </strong></p>
                                        <p>{assignment && assignment.projects.map((projects, index) => { 
                                            // will only run when there is a project object
                                            if (user.organisation_id === assignment.organisation_id)
                                            return(<li key={index}>{projects}</li>)})}
                                        </p>
                                        <p><strong>Employees in this assignment by email: </strong></p>
                                        <p>{ assignment && assignment.employees.map((employee, index) => { 
                                            // will only run when there is a employee object
                                            if (user.organisation_id === assignment.organisation_id)
                                            return(<li key={index}>{employee.name} - {employee.email}</li>)})}
                                        </p>
                                    </div>
                            </article>
                         )}
                </div>
                )}}

    return (
    <div>
        {infoPanel()}
        {showSelectedInfo()}  
    </div>    
        
    );
}
 
export default AssignmentDetails;