import { useState } from 'react'
import { useAuthContext} from './useAuthContext'

export const useSignup = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const { dispatch } = useAuthContext()

    const signup = async (email, password) => {
        setIsLoading(true)
        setError(null) // reset error to null in case there was one previously

        const response = await fetch('/api/user/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        })

        const json = await response.json() // {email, token}

        // if there is a problem
        if (!response.ok) {
            setIsLoading(false)
            setError(json.error)
        }

        // if response is ok
        if(response.ok) {
            // save user to local storage - jwt
            localStorage.setItem('user', JSON.stringify(json)) // {email, token}

            // update auth context
            dispatch({type: 'LOGIN', payload: json})

            setIsLoading(false)
        }
    }

    return { signup, isLoading, error }
}