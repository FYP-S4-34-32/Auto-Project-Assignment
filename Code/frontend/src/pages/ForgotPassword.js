// ========================= //
// Reset Password Page
// ========================= //

// imports
import { useState } from 'react' 
import { useValidateEmail } from '../hooks/useValidateEmail'
import emailjs from 'emailjs-com';

const ForgotPassword = () => {
    const { validateEmail, invalidEmailError, isValidationLoading, message } = useValidateEmail()
    const [email, setEmail] = useState('')   
    
    const handleSubmit = async(e) => {  
        e.preventDefault();
        console.log(" tesing: ", email); 

        // invoke validateEmail from useValidateEmail.js 
        await validateEmail(email); 

        // if email is valid, send email with password reset link
        if (message === "Please check email for password reset link.") {

            console.log("email is valid, sending email with password reset link");

            emailjs.sendForm('reset_password_mail', 'template_5c8r2wm', e.target, 'lbG6Vv-BkaG5nzMQz')
            .then(
                result => console.log(result.text),
                error => console.log(error.text)
            );
        }

    }


    return (
        <div className="resetPassword">
            <form className="resetPasswordForm" onSubmit={(e) => handleSubmit(e)}>
                <h2>Forgot Password</h2>
                <span>Enter your email address and we'll send you a link to reset your password.</span>
                <br/>
                <br/>
                <label>Email Address:</label>
                <input
                    type="email"
                    name="email"
                    onChange={(e) => {setEmail(e.target.value)}} // set email to the value of the target input field
                    value={email} // reflect change in email state
                />
                <button disabled={ isValidationLoading }>Submit</button> 
                
                {invalidEmailError && <div className="error">{ invalidEmailError }</div>} 
                {message && <div className="success">{ message }</div>}
            </form>
        </div>
    )
}

export default ForgotPassword