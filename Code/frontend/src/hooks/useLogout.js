import { useAuthContext } from "./useAuthContext"


export const useLogout = () => {
    const { dispatch } = useAuthContext()

    const logout = () => {
        // remove user from storage
        localStorage.removeItem('user')

        // dispatch logout action
        dispatch({type: 'LOGOUT'}) // no payload - just reset the user = null in useAuthContext.js
        
        // clear global state - prevent the previous state from flashing
        // insert code here
    }

    return { logout }
}