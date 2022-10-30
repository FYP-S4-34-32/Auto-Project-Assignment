import { useState } from 'react'
import { useLogin } from '../hooks/useLogin'

const AdminLogin = () => {
    const [adminEmail, setEmail] = useState('')
    const [adminPassword, setPassword] = useState('')
    const { login, error, isLoading } = useLogin()
    const [passwordShown, setPasswordShown] = useState(false);

    const handleSubmit = async (e) => { 
        e.preventDefault()

        await login(adminEmail, adminPassword)
    }

    // Show password toggle handler
    const showPassword = () => { 
        setPasswordShown(!passwordShown);
    };

    return (
        <form className="adminLoginForm" onSubmit={handleSubmit}>
            <h3>Admin Login</h3>
            <label>Email:</label>
            <input
                type="adminEmail"
                onChange={(e) => {setEmail(e.target.value)}}
                value={adminEmail} // reflect change in email state
            />
            <label>Password:</label>
            
            <input
                type={passwordShown ? "text" : "password"} 
                onChange={(e) => {setPassword(e.target.value)}}
                value={adminPassword} // reflect change in email state 
            />
            
            <button className='showPwBtn' onClick={showPassword}>Show Password</button>
            <br></br>
            <button disabled={ isLoading }>Login</button> {/*prevent button from being clicked while page is loading*/}
            {error && <div className="error">{ error }</div>}
        </form>
    )
}

export default AdminLogin
