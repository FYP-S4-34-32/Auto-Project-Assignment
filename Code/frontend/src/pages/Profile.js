//==============//
// Profile page // --> Just a template for now - a lot of changes to be made
//==============//

// imports 
import { useState} from 'react'  
import { useAuthenticationContext } from '../hooks/useAuthenticationContext'
import { useUpdateInfo } from '../hooks/useUpdateInfo' 
import { useChangePassword } from '../hooks/useChangePassword'
import { useUpdateSkills } from '../hooks/useUpdateSkills'

const Profile = () => { 
    // hooks
    var { user } = useAuthenticationContext()  
    const {updateInfo, isLoading, error} = useUpdateInfo()  
    const {changePassword, changePwIsLoading, changePwError} = useChangePassword()
    const {updateSkills, updateSkillsIsLoading, updateSkillsError} = useUpdateSkills()

    // user's array of skills and competency levels (from database)
    var userSkillsArr = user.skills
    var tempUserSkillsArr = userSkillsArr // temporary since userSkillsArr will be modified

    const [selectedInfo, setSelectedInfo] = useState(''); 
    const [contactForm, setShowContactForm] = useState(false);  
    const [contact, setContact] = useState(''); 
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [skillsForm, setShowSkillsForm] = useState(false);
    const [newArr, setCompetency] = useState(userSkillsArr);

    // default competency levels for all skills
    const competencyLevels = [
        {value : "Beginner", label : "Beginner"}, 
        {value : "Intermediate", label : "Intermediate"},
        {value : "Advanced", label : "Advanced"}
    ]

    // default available skills, will change based on user's current skills (check validateSkillsArray function)
    var availSkillsArray = [ 
        {skill: "0", label: "Select a skill"},
        {skill: "Java", label: "Java"},
        {skill: "MongoDB", label: "MongoDB"},
        {skill: "React", label: "React"},
        {skill: "Node.js", label: "Node.js"},
        {skill: "Python", label: "Python"},
        {skill: "C++", label: "C++"},
        {skill: "C#", label: "C#"},
        {skill: "C", label: "C"},
        {skill: "PHP", label: "PHP"},
        {skill: "Ruby", label: "Ruby"},
        {skill: "Swift", label: "Swift"}
    ]

    // validate availSkillsArray: should only have skills that are not already in userSkillsArr
    const validateSkillsArray = () => {
        var tempAvailSkillsArray = availSkillsArray
        var tempUserSkillsArr = userSkillsArr

        for (var i = 0; i < tempUserSkillsArr.length; i++) {
            for (var j = 0; j < tempAvailSkillsArray.length; j++) {
                if (tempUserSkillsArr[i].skill === tempAvailSkillsArray[j].skill) {
                    tempAvailSkillsArray.splice(j, 1)
                }
            }
        }

        availSkillsArray = tempAvailSkillsArray 
    }

    // update skill competency 
    const changeCompetency = index => (e) => { 
        let newArr = [...userSkillsArr]; // copying userSkillsArr 
        newArr[index].competency = e.target.value; // replace e.target.value with competency level selected

        console.log(newArr);
        setCompetency(newArr);
    }

    // adding new skill
    const addSkill = (e) => {
        tempUserSkillsArr.push({skill: e.target.value, competency: "Beginner"});
        setCompetency(tempUserSkillsArr);
        
        console.log("after adding skill: ", userSkillsArr);
        updateSkills(user.email, tempUserSkillsArr);
    }

    // delete skill
    const deleteSkill = (index) => {
        tempUserSkillsArr.splice(index, 1);
        setCompetency(tempUserSkillsArr); 

        console.log("after deleting skill: ", userSkillsArr); 
        updateSkills(user.email, tempUserSkillsArr);
    }
     
    // Submit edited contact info
    const handleSubmitContactInfo = async(e) => {
        e.preventDefault();

        setSelectedInfo('showUser')
        await updateInfo(user.email, contact);
    }

    // Submit edit skills info
    const handleSubmitSkills = async(e) => {
        e.preventDefault(); 

        setShowSkillsForm('showSkills');
        await updateSkills(user.email, newArr);
    }

    // Submit new password
    const handleSubmitPassword = async(e) => {
        e.preventDefault(); 
 
        await changePassword(user.email, currentPassword, newPassword, confirmPassword);
    }

    const showContactForm = () => {
        setShowContactForm(!contactForm)
    };

    const showSkills = () => {  
        validateSkillsArray();

        const showAvailSkills = availSkillsArray.map((availSkill) => {
            return (
                <option key={ availSkill.skill } value={ availSkill.skill }>{ availSkill.label }</option>
            )
        })

        const showSkillRows = user.skills.map((s) => {
            return (
                <p key={ s.skill }>{ s.skill }: { s.competency }</p>
            )
        })

        // select competency levels for current skills
        var editingSkills = userSkillsArr.map((datum, index) => {
            var skill = datum.skill
            var competency = datum.competency

            if (competency === "Beginner") {
                competency = competencyLevels[0].value
            }
            else if (competency === "Intermediate") {
                competency = competencyLevels[1].value
            }
            else if (competency === "Advanced") {
                competency = competencyLevels[2].value
            }
            else {
                competency = competencyLevels[0].value
            }

            return (
                <p key={ skill }>{ skill }  
                    <select className="skillSelection" defaultValue={competency} onChange={changeCompetency(index)}>
                        <option value={competencyLevels[0].value}>{competencyLevels[0].label}</option>
                        <option value={competencyLevels[1].value}>{competencyLevels[1].label}</option>
                        <option value={competencyLevels[2].value}>{competencyLevels[2].label}</option>
                    </select>

                    <span className="material-symbols-outlined" onClick={() => deleteSkill(index)} style={{marginLeft:"20px", marginTop:"20px"}}>delete</span> 
                 </p>
            )
        })

        switch (skillsForm) {
            case 'editSkills': // editing skill competency
                return (
                    <div>  
                        <form className='editSkillsForm'>
                            <h3>Add New Skills</h3>
                            <div> 
                                <select className="skillSelection" onChange={addSkill}>
                                    {showAvailSkills}
                                </select>
                            </div>
                            <hr></hr>
                            <h3>Edit Skill Competency</h3>

                            {editingSkills}

                            <br></br>
                            <button className="cancelBtn" onClick={() => setShowSkillsForm('showSkills')} style={{float:"left"}}>Cancel</button>
                            <button className="submitBtn" disabled={ updateSkillsIsLoading } onClick={handleSubmitSkills}>Submit</button>
                            {updateSkillsError && <p>{updateSkillsError}</p>}
                        </form>
                    </div> 
                )
            default: // display user skills
                return (
                    <div>
                        { showSkillRows }
                    </div>
                )
        }
    }

    // LEFT DIVIDER: INFO PANEL
    // where user can select what info to view
    const infoPanel = () => {
        switch(user.role) {
            case "Employee":
                return (
                    <div className="profile-panel"> 
                        <button onClick={() => setSelectedInfo('showUser')}> User Information </button>
                        <button onClick={() => setSelectedInfo('showOrganisation') }> Organisation </button>
                        <button onClick={() => setSelectedInfo('showSkills')}> Skills </button> 
                        <br></br>
                        <button> Projects </button> 
                        <button onClick={() => setSelectedInfo('changePassword')} > Change Password </button>
                    </div> 
            )
            case "Admin":
                return (
                    <div className="profile-panel" style={{height:'150px'}}>
                        <button onClick={() => setSelectedInfo('showUser')}> User Information </button>
                        <button onClick={() => setSelectedInfo('showOrganisation') }> Organisation </button>
                        <button onClick={() => setSelectedInfo('changePassword')} > Change Password </button>
                    </div>
            )
            case "Super Admin":
                return (
                    <div className="profile-panel" style={{height:'150px'}}>
                        <button onClick={() => setSelectedInfo('showUser')} > User Information </button>
                        <button onClick={() => setSelectedInfo('showOrganisation')} > Organisation </button>
                        <button onClick={() => setSelectedInfo('changePassword')} > Change Password </button>
                    </div>
            )
            default:
                return (<div className="profile-panel"> </div>) 
        }
    }

    // RIGHT DIVIDER: SHOWS INFORMATION
    const showSelectedInfo = () => {
        switch(selectedInfo) {
            case 'showOrganisation':
                return (
                    <div className="user-profile">
                        <h2> Organisation Information </h2>  
                        {/* to be added */}
                    </div>
                )
                
            case 'showSkills':    
                return (
                    <div className="user-profile">
                        <button className="editSkillsBtn" onClick={() => setShowSkillsForm('editSkills')}>Edit Skills</button>
                        <h2> Skills </h2>  
                        {showSkills()}
                    </div> 
                )    
            
            // case for projects to be added 

            case 'changePassword':
                return (
                    <div className="user-profile" style={{height:"450px"}}>
                        <h2> Change Password </h2>
                        <form className="changePwdForm" onSubmit={handleSubmitPassword}>

                            <label> Current Password </label>
                            <input type="currentPassword" onChange={(e) => {setCurrentPassword(e.target.value)}}/>
                            <label> New Password </label>
                            <input type="newPassword" onChange={(e) => {setNewPassword(e.target.value)}}/>
                            <label> Confirm New Password </label>
                            <input type="confirmPassword" onChange={(e) => {setConfirmPassword(e.target.value)}}/>
                            
                            <button className="cancelBtn" style={{float:"left"}} onClick={() => setSelectedInfo('showUser')}>Cancel</button> 

                            <button className="submitBtn" disabled={ changePwIsLoading }> Submit </button> 

                            {changePwError && <div className="error"> {changePwError} </div>}
                        </form>
                    </div>
                )
             
            // DEFAULT: DISPLAY USER INFORMATION
            case 'showUser':
            default:
                return (
                    <div className="user-profile"> 
                        <h2> User Information </h2>
            
                        <h4 > Full Name </h4>
                        { user && <p> { user.name } </p>}  
            
                        <hr/>
            
                        <h4 > Email </h4>
                        { user && <p> { user.email } </p>}  
            
                        <hr/>
            
                        <h4> Role </h4>
                        { user && <p> { user.role } </p>}  
            
                        <hr/>
            
                        <h4> Contact Info</h4>
                        { user && <p style={{display:'inline'}}> { user.contact }</p>} 
                        <button className="editContactBtn" onClick={showContactForm}>Edit</button>

                        { contactForm && (
                            <form className='newContactForm' onSubmit={handleSubmitContactInfo}> 
                                <input type="Number" className="newContact" placeholder={"New contact information"} onChange={(e) => {setContact(e.target.value)}}/>
                                <button className="submitBtn" disabled={ isLoading }>Submit</button>
                                <button className="cancelBtn" onClick={showContactForm}>Cancel</button>
                            </form>
                        )}

                        {error && <div className="error"> {error} </div>}
                    </div>
                )
        }
    }

    return (
        <div className="home">  
            {infoPanel()}

            { showSelectedInfo()}  
        </div>
    )
}

export default Profile