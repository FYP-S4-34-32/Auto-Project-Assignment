//========================================//
// Handles Automatic Assignment Function  //
//========================================//

// imports
import { useState } from 'react'

export const useAutomaticAssignment = () => {
    const [automaticAssignmentError, setError] = useState(null)
    const [automaticAssignmentIsLoading, setIsLoading] = useState(null)  

    const automaticAssignment = async (user, id) => {  

        setIsLoading(true)  
        setError(null) 

        const response = await fetch('/api/assignment/autoAssign/' + id, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',
            'Authorization': `Bearer ${ user.token}`},
            
        })

        const json = await response.json()  

        if (!response.ok) {
            setIsLoading(false)
            setError(json.error)
        }

        if(response.ok) { 
            setIsLoading(false) 
        }
    }

    return { automaticAssignment, automaticAssignmentIsLoading, automaticAssignmentError}
}