import { useContext } from "react"
import { SettingsContext } from "../../main"
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const UsernameDisplay = ({handlelogout}) => {

    const [settings, setSettings] = useContext(SettingsContext);
    const navigate = useNavigate();

    return (
        <div className="namedisplay">
            {settings.loggedIn ? (<><p>{settings.username}</p><button onClick={handlelogout}>Logout</button></>): (<><Link to="/login">Login</Link><Link to="/register">Register</Link></>)}
        </div>
    )
}

export default UsernameDisplay;