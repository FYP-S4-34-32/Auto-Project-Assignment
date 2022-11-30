//==============//
// Profile page // --> Just a template for now - a lot of changes to be made
//==============//

// imports 
import { useState} from 'react'
import { useAuthenticationContext } from '../hooks/useAuthenticationContext'

const Profile = () => { 
    const { user } = useAuthenticationContext()    
    const [selectedInfo, setSelectedInfo] = useState('');

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
                    <button> Change Password </button>
                </div> 
            )
            case "Admin":
                return (
                    <div className="profile-panel" style={{height:'150px'}}>
                        <button onClick={() => setSelectedInfo('showUser')}> User Information </button>
                        <button onClick={() => setSelectedInfo('showOrganisation') }> Organisation </button>
                        <button> Change Password  </button>
                    </div>
            )
            case "Super Admin":
                return (
                    <div className="profile-panel" style={{height:'150px'}}>
                        <button onClick={() => setSelectedInfo('showUser')}> User Information </button>
                        <button onClick={() => setSelectedInfo('showOrganisation') }> Organisation </button>
                        <button> Change Password  </button>
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
                const skillRows = user.skills.map((s) => {
                    return (
                        <p key={ s.skill }>{ s.skill }: { s.competency }</p>
                    )
                })

                return (
                    <div className="user-profile">
                        <h2> Skills </h2>  
                        <div>
                            { skillRows }
                        </div>
                        
                        <button className="editSkillsBtn">Edit Skills</button>
                    </div> 
                )    
            
            // cases for projects and settings to be added 
             
            // DEFAULT: DISPLAY USER INFORMATION
            case 'showUser':
            default:
                return (
                    <div className="user-profile"> 
                        <h2> User Information </h2>
            
                        <h4 > Full Name: </h4>
                        { user && <p> { user.name } </p>}  
            
                        <hr/>
            
                        <h4 > Email: </h4>
                        { user && <p> { user.email } </p>}  
            
                        <hr/>
            
                        <h4> Role: </h4>
                        { user && <p> { user.role } </p>}  
            
                        <hr/>
            
                        <h4> Contact Info</h4>
                        { user && <p> { user.contact }</p>} 
                        <button className="editContactBtn">Edit Contact Information</button>
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