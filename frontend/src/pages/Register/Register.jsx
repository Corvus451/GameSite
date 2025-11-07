import { useContext, useState } from "react";
import { SettingsContext } from "../../main";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Register = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [settings, setSettings] = useContext(SettingsContext)

    const navigate = useNavigate();

    const register = async () => {
        console.log(username);
        console.log(password);
        const result = await fetch("/api/auth_v1/register", {
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await result.json();

        if(result.ok){
            navigate("/");
        }else{
            alert(data.message);
        }
        console.log(result);
    }


    return (
        <div className="registerContainer">
            <div id="registerForm" className="registerForm">
                <h3>Register</h3>
                <label htmlFor="username">Username</label><br />
                <input type="text" name="username" id="username" onChange={(e)=> setUsername(e.target.value)}/><br />
                <label htmlFor="password">Password</label><br />
                <input type="password" name="password" id="password" onChange={(e)=> setPassword(e.target.value)} className={password !== confirm ? "invalid" : ""}/><br />
                <label htmlFor="confirm">Confirm password</label><br />
                <input type="password" name="confirm" id="confirm" onChange={(e)=> setConfirm(e.target.value)} className={password !== confirm ? "invalid" : ""}/><br />
                <button onClick={register}>Register</button>
                <Link to="/login">Login</Link>
            </div>
        </div>
    )
}

export default Register;