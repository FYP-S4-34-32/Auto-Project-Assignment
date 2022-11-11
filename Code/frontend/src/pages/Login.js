//============//
// Login Page //
//============//

// imports
import { useState } from 'react'
import { useLogin } from '../hooks/useLogin'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login, error, isLoading } = useLogin() // from useLogin.js in the hooks folder
    const [passwordShown, setShowPassword] = useState(false); // show password

    const handleSubmit = async (e) => {
        // prevent refresh upon submit
        e.preventDefault()

        // invoke the login function from useLogin.js
        await login(email, password)
    }

    // show Password toggle 
    const showPassword = () => {
        // When the handler is invoked
        // inverse the boolean state of passwordShown
        setShowPassword(!passwordShown);
    };
    // return a template - login form
    return (
        <form className="login" onSubmit={handleSubmit}>
            <h3>Login</h3>
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
            <button className="showPwBtn" onClick={showPassword}>Show Password</button>

            <button disabled={ isLoading }>Login</button> {/*prevent button from being clicked while page is loading*/}
            {error && <div className="error">{ error }</div>}
        </form>
    )
}

// EXPORT
export default Login