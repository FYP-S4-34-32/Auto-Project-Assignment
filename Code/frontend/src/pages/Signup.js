//=============//
// Signup Page //
//=============//

// imports
import { useState } from 'react'
import { useSignup } from '../hooks/useSignup'

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('')
    const { signup, isLoading, error } = useSignup() // from useSignup.js in the hooks folder

    const handleSubmit = async (e) => {
        // prevent refresh upon submit
        e.preventDefault()

        // invoke signup function from useSignup.js
        await signup(email, password, role) 
    }

    // return a template - signup form
    return (
        <form className="signup" onSubmit={handleSubmit}>
            <h3>Account Creation</h3>
            <label>Email:</label>
            <input
                type="email"
                onChange={(e) => {setEmail(e.target.value)}} // set email to the value of the target input field
                value={email} // reflect change in email state
            />
            <label>Password:</label>
            <input
                type="password" // hidden
                onChange={(e) => {setPassword(e.target.value)}} // set password to the value of the target input field
                value={password} // reflect change in password state
            />
            <label>Role:</label>
            <select value={role} onChange={(e) => {setRole(e.target.value)}}>
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
            </select>
            <br></br>
            <br></br>
                
            <button disabled={ isLoading }>Sign up</button> {/*prevent button from being clicked while page is loading*/}
            {error && <div className="error">{ error }</div>}
        </form>
    )
}

// EXPORT
export default Signup