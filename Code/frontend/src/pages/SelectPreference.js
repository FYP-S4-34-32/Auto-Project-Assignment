//===========================//
// Preference Selection Page //
//===========================//

// imports 
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthenticationContext } from '../hooks/useAuthenticationContext' 
import { useProjectsContext } from "../hooks/useProjectsContext"

const SelectPreference = () => {
    // hooks
    const { user } = useAuthenticationContext()

    const [firstChoice, setFirstChoice] = useState('') // default value = empty
    const [secondChoice, setSecondChoice] = useState('') // default value = empty
    const [thirdChoice, setThirdChoice] = useState('') // default value = empty
    const [error, setError] = useState(null) // default value = no error

    const navigate = useNavigate()

    // state for empty fields validation
    const [errorFields, setErrorFields] = useState([]) // empty array by default

    // get the list of available project
    const { projects } = useProjectsContext()


    // authorisation check
    if (!user && user.role !== 'Employee') {
        setError("You are not authorised to view this resource")
        return
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const email = user.email
        const projectPreference = { email, firstChoice, secondChoice, thirdChoice }

        // fetch request to post new data
        const response = await fetch('/api/user/selectpreference', {
            method: 'PATCH',
            body: JSON.stringify(projectPreference),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ user.token }`
            }
        }) // this is where we send the PATCH request
        
        const json = await response.json()

        // response NOT ok
        if (!response.ok) {
            setError(json.error) // the error property

            setErrorFields(json.errorFields)
        }

        // response OK
        if (response.ok) {
            setError(null) // in case there was an error previously
            
            // reset the form
            setFirstChoice('') // reset first choice
            setSecondChoice('') // reset second choice
            setThirdChoice('') // reset third choice

            setErrorFields([]) // reset the emptyfields array

            navigate('/projects') // navigate back to project listing page
        }
    }
    

    // return a template
    return ( 
        <div className="create"> 
            <h2>Input/Update Project Preference</h2>
            <form onSubmit={ handleSubmit }>
                <label>First Choice:</label>
                <select value={ firstChoice } onChange={(e) => { setFirstChoice(e.target.value) }} className={ errorFields.includes('firstChoice') ? 'error': '' }>
                    <option value="">Please choose one</option> {/* included this so that user will be forced to make a selection otherwise function returns role=null */}
                    { projects?.map(p => (
                        <option key={ p.title } value={ p.title }>{ p.title }</option>
                    )) }
                </select>
                
                <br></br><br></br><br></br>
                
                <label>Second Choice:</label>
                <select value={ secondChoice } onChange={(e) => { setSecondChoice(e.target.value) }} className={ errorFields.includes('secondChoice') ? 'error': '' }>
                    <option value="">Please choose one</option> {/* included this so that user will be forced to make a selection otherwise function returns role=null */}
                    { projects?.map(p => (
                        <option key={ p.title } value={ p.title }>{ p.title }</option>
                    )) }
                </select>
                
                <br></br><br></br><br></br>
                
                <label>Third Choice:</label>
                <select value={ thirdChoice } onChange={(e) => { setThirdChoice(e.target.value) }} className={ errorFields.includes('thirdChoice') ? 'error': '' }>
                    <option value="">Please choose one</option> {/* included this so that user will be forced to make a selection otherwise function returns role=null */}
                    { projects?.map(p => (
                        <option key={ p.title } value={ p.title }>{ p.title }</option>
                    )) }
                </select>

                <br></br><br></br><br></br>

                <button>Submit Selection</button>
                { error && <div className="error">{ error }</div> }
            </form>
        </div>
    )
}

export default SelectPreference