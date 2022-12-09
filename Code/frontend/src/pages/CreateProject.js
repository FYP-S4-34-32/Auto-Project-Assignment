//=====================//
// Create Project Page //
//=====================//

// imports
import { useAuthenticationContext } from "../hooks/useAuthenticationContext"
import { useNavigate } from "react-router-dom"

// import TextareaAutoSize from 'react-textarea-autosize'

const { useState } = require("react")

const CreateProject = () => {
    const { user } = useAuthenticationContext()

    const [title, setTitle] = useState('') // default value = empty
    const [description, setDescription] = useState('') // default value = empty
    // const [skills, setSkills] = useState('') // default value = empty
    const [threshold, setThreshold] = useState('') // default value = empty
    const [error, setError] = useState(null) // default value = no error

    const navigate = useNavigate()

    // state for empty fields validation
    const [emptyFields, setEmptyFields] = useState([]) // empty array by default

    const handleSubmit = async (e) => { // will be reaching out to the api
        e.preventDefault() // prevent the page from refreshing upon submit

        // if there is no user object <- not logged in
        if (!user) {
            setError('You must be logged in')
            return
        }

        // const project = { title, description, skills, threshold }
        const project = { title, description, threshold }

        // fetch request to post new data
        const response = await fetch('/api/project/createproject', {
            method: 'POST',
            body: JSON.stringify(project),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ user.token }`
            }
        }) // this is where we send the POST request
        const json = await response.json() // response will be retrieved from projectController.createProject

        // response NOT ok
        if (!response.ok) {
            setError(json.error) // the error property from projectController.createProject

            setEmptyFields(json.emptyFields)
        }

        // response OK
        if (response.ok) {
            setError(null) // in case there was an error previously
            
            // reset the form
            setTitle('') // reset title
            setDescription('') // reset description
            // setSkills(null) // reset skills
            setThreshold(null) // reset threshold

            setEmptyFields([]) // reset the emptyfields array
            
            console.log('New Project Added')

            navigate('/') // navigate back to home page aka project listing page
        }
    }

    return(
        <div className="create">
            <h2>Add a new Project Lising</h2>

            <form onSubmit={ handleSubmit }>
            <label>New Project Title:</label>
            <input 
                type="text"
                onChange={ (e) => setTitle(e.target.value) } // value of the target(input field) of the event e
                value={ title } // reflect changes made outside the form e.g. resetting the form into empty string
                className={ emptyFields.includes('title') ? 'error': '' } // if empty, give it a className
            />

            <label>Project Description:</label>
            {/* {<TextareaAutoSize
                type="text"
                onChange={(e) => setDescription(e.target.value)} 
                value={description}
                className={ emptyFields.includes('description') ? 'error': ''}
            />} */}
            <textarea
                type="text"
                onChange={(e) => setDescription(e.target.value)} 
                value={description}
                className={ emptyFields.includes('description') ? 'error': ''}
            />

            <label>Skills Required:</label>


            <label>Threshold:</label>
            <input 
                type="number"
                onChange={ (e) => setThreshold(e.target.value) }
                value={ threshold }
                className={ emptyFields.includes('threshold') ? 'error' : '' }
            />

            <button>Add New Project Listing</button>
            { error && <div className="error">{ error }</div> }
            </form>
        </div>
    )
}

export default CreateProject