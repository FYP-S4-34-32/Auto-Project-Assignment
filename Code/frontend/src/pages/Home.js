

// imports
import { useEffect } from "react"
import { useAuthContext } from "../hooks/useAuthContext"

const Home = () => {
    const { user, dispatch } = useAuthContext()

    return (
        <div className="user-details">
            <h4>User Info - testing</h4>
            <p><strong>Email: </strong>{user.email}</p>
            <p><strong>Token: </strong>{user.token}</p>
        </div>
    )
}

export default Home