//==============//
// Profile page // --> Just a template for now - a lot of changes to be made
//==============//

// imports 
import { useState} from 'react'
import { useAuthenticationContext } from '../hooks/useAuthenticationContext'
import { useUpdateInfo } from '../hooks/useUpdateInfo' 
import { useChangePassword } from '../hooks/useChangePassword'

const Profile = () => { 
    // hooks
    var { user } = useAuthenticationContext()  
    const {updateInfo, isLoading, error} = useUpdateInfo()  
    const {changePassword, changePwIsLoading, changePwError} = useChangePassword()

    const [selectedInfo, setSelectedInfo] = useState(''); 
    const [contactForm, setShowContactForm] = useState(false);  
    const [contact, setContact] = useState(''); 
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [skillsForm, setShowSkillsForm] = useState(false);
     
    const handelSubmitContactInfo = async(e) => {
        e.preventDefault();

        await updateInfo(user.email, contact);
    }

    const handleSubmitPassword = async(e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            throw Error('Please fill out all fields')
        }
        else if (newPassword !== confirmPassword) {
            throw Error('Passwords do not match')
        }
        else {
            await changePassword(user.email, currentPassword, newPassword);
        }
    }

    const showContactForm = () => {
        setShowContactForm(!contactForm)
    };

    const showSkills = () => {
        const showSkillRows = user.skills.map((s) => {
            return (
                <p key={ s.skill }>{ s.skill }: { s.competency }</p>
            )
        })

        var editingSkills = user.skills.map((s) => {
            return (
                <p key={ s.skill }> {s.skill} : <input type="text" defaultValue={ s.competency } /> </p>
            )
        })

        switch (skillsForm) {
            case 'editSkills':
                return (
                    <div>
                        <form className='editSkillsForm'>
                        {editingSkills}
                        <button className="cancelBtn" onClick={() => setShowSkillsForm('showSkills')} style={{float:"left"}}>Cancel</button>
                        <button className="submitBtn" disabled={ isLoading }>Submit</button>
                        </form>
                    </div>
                )
            default:
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
                            
                            <button className="cancelBtn" style={{float:"left"}}>Cancel</button> 

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
                            <form className='newContactForm' onSubmit={handelSubmitContactInfo}> 
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