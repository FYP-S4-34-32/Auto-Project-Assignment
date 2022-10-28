import { AuthContext } from '../context/AuthContext'
import { useContext } from 'react'

export const useAuthContext = () => {
    const context = useContext(AuthContext) // the state and the dispatch function

    // if no context
    if (!context) {
        throw Error('useAuthContext must be used inside a AuthContextProvider')
    }

    return context
}