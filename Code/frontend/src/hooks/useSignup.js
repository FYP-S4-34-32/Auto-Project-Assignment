//========================//
// Handle Signup requests //
//========================//

// imports
import { useState } from 'react'

export const useSignup = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)

    const signup = async (email, password, role) => {
        console.log(email, password, role)

        setIsLoading(true) // set loading state
        setError(null) // reset error to null in case there was one previously

        // fetch function calls the endpoint in the backend server
        const response = await fetch('/api/user/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}, // type of the data
            body: JSON.stringify({email, password, role}) // sends {email, password, role} as the request body
        })

        const json = await response.json() // the return value we get back from the userController.js signup function {email, token, role}

        // if there is a problem
        if (!response.ok) {
            setIsLoading(false)
            setError(json.error)
        }

        // if response is ok
        if(response.ok) {

            // set loading state back to false
            setIsLoading(false)
        }
    }

    return { signup, isLoading, error }
}