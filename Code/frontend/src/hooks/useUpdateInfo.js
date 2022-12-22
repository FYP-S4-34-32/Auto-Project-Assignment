//===============================//
// Handles updating contact info //
//===============================//

// imports
import { useState } from 'react'

export const useUpdateInfo = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)

    const updateInfo = async (email, contact) => { 

        setIsLoading(true)  
        setError(null) 

        const response = await fetch('/api/user/updateInfo', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, contact})
        })

        const json = await response.json() 
        console.log(json)

        if (!response.ok) {
            setIsLoading(false)
            setError(json.error)
        }

        if(response.ok) {
            setIsLoading(false)
        }

        return json.user.contact
    }

    return { updateInfo, isLoading, error }
}

