

// imports
import { useProjectsContext } from "../hooks/useProjectsContext"
import { useAuthenticationContext } from "../hooks/useAuthenticationContext"

const { useState } = require("react")

const ProjectForm = () => {
    const { dispatch } = useProjectsContext()
    const { user } = useAuthenticationContext()

    const [title, setTitle] = useState('') // default value = empty
    const [description, setDescription] = useState('') // default value = empty
    const [error, setError] = useState(null) // default value = no error

    // state for empty fields validation
    const [emptyFields, setEmptyFields] = useState([]) // empty array by default


    const handleSubmit = async (e) => { // will be reaching out to the api
        e.preventDefault() // prevent the page from refreshing upon submit

        // if there is no user object <- not logged in
        if (!user) {
            setError('You must be logged in')
            return
        }

        const project = {title, description}

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
            setTitle('') 
            setDescription('')
            setEmptyFields([]) // reset the emptyfields array
            
            console.log('New Project Added')

            dispatch({ type: 'CREATE_PROJECT', payload: json})
        }
    }

    return(
        <form className="create" onSubmit={ handleSubmit }>
            <h3>Add a New Project Listing</h3>

            <label>New Project Title:</label>
            <input 
                type="text"
                onChange={(e) => setTitle(e.target.value)} // value of the target(input field) of the event e
                value={title} // reflect changes made outside the form e.g. resetting the form into empty string
                className={ emptyFields.includes('title') ? 'error': ''} // if empty, give it a className
            />

            <label>Project Description:</label>
            <input 
                type="text"
                onChange={(e) => setDescription(e.target.value)} 
                value={description}
                className={ emptyFields.includes('description') ? 'error': ''}
            />

            <button>Add New Project Listing</button>
            { error && <div className="error">{ error }</div> }
        </form>
    )
}

export default ProjectForm