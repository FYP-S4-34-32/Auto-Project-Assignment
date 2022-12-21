//===============================//
// Handles GET all Organisations //
//===============================//

//=============================//
// Handles GET all users info //
//=============================//

// imports
import { useState } from 'react'

export const useGetAllOrganisations = () => {
    const [getAllOrganisationsError, setError] = useState(null)
    const [getAllOrganisationsIsLoading, setIsLoading] = useState(null) 
    const [allOrganisations, setAllOrganisations] = useState([])

    const getAllOrganisations = async () => { 
        setIsLoading(true)  
        setError(null) 

        const response = await fetch('/api/organisation/', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })

        const json = await response.json()

        if (!response.ok) {
            setIsLoading(false)
            setError(json.error)
        }

        if(response.ok) { 
            setIsLoading(false)
            setAllOrganisations(json)
        }
    }

    return { getAllOrganisations, getAllOrganisationsIsLoading, getAllOrganisationsError, allOrganisations}
}