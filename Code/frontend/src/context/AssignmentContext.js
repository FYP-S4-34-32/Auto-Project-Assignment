//================================//
// Context Provider to set states //
//================================//

// imports
import { createContext, useReducer } from "react";

// creates a context
export const AssignmentContext = createContext()

// invoked by the dispatch function
export const assignmentReducer = (state, action) => {

    switch(action.type) {
        case 'SET_ASSIGNMENTS': // set all assignments
            return {
                assignment: action.payload // payload in this case is an array of assignment objects
            }
        case 'SET_ONE_ASSIGNMENT': // set one assignment object
            return {
                assignment: action.payload // payload in this is an assignment object
            }
        case 'CREATE_ASSIGNMENT': 
            return {
                assignment: [action.payload, ...state.assignment] // payload in this case is a SINGLE new assignment object / ...state.assignment spreads out the current state of the assignment
                                                                // action.payload is at the front, so newly created assignment will appear at the top instead of the bottom
            }
        case 'DELETE_ASSIGNMENT':
            return {
                assignment: state.projects.filter((a) =>
                    a._id !== action.payload._id // filter out the assignment object to be deleted to update the global state
                )
            }
        default:
                return state // state unchanged
    }
}

// provide context to application component tree for components to access
export const AssignmentContextProvider = ({ children }) => { // whatever the context provider is wrapping
    // reducer hook
    const [state, dispatch] = useReducer(assignmentReducer, {
        assignment: null
    })

    // this is the part that will wrap whatever parts of our application that need access to this context
    // ...state will provide the properties of the object - assignment objects in this case
    return (
        <AssignmentContext.Provider value={{ ...state, dispatch }}> {/* ...state here will be referring the assignment above this line */}
            { children }
        </AssignmentContext.Provider>
    )
}