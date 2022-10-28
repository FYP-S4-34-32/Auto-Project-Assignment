import { createContext, useReducer, useEffect } from 'react'

export const AuthContext = createContext()

export const authReducer = (state, action) => {
    // login/logout case
    switch (action.type) {
        case 'LOGIN':
            return { user: action.payload }
        case 'LOGOUT':
            return { user: null } // remove user object
        default:
            return state // original state
    }
}

// wrapper
export const AuthContextProvider = ({ children }) => {
    // register state
    const [state, dispatch] = useReducer(authReducer, {
        user: null // user not logged in by default
    })

    // fires when the component first renders
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user')) // localStorage is in JSON string, to be converted to be used as a JS object

        // check whether there is a value for user
        if (user) {
            dispatch({ type: 'LOGIN', payload: user })
        }
    }, [])

    console.log('AuthContext state: ', state)

    return (
        <AuthContext.Provider value={{...state, dispatch}}>
            { children }
        </AuthContext.Provider>
    )
}