import { useContext } from "react"
import { SettingsContext } from "../../main"
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const UsernameDisplay = () => {

    const [settings, setSettings] = useContext(SettingsContext);
    const navigate = useNavigate();

    const logout = async ()=> {
        const result = await fetch("/api/auth_v1/logout", {
            method: "POST"
        });

        if(result.ok){
            setSettings({username: "", loggedIn: false, sessionToken: ""});
            navigate("/login");
        }
        else{
            alert("fail");
        }

    }

    return (
        <div className="namedisplay">{settings.loggedIn ? (<>{settings.username}<button onClick={logout}>Logout</button></>): (<><Link to="/login">Login</Link><Link to="/register">Register</Link></>)}</div>
    )
}

export default UsernameDisplay;