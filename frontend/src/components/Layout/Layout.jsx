import { useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import { SettingsContext } from "../../main";
import UsernameDisplay from "./UsernameDisplay";

const Layout = () => {

    const [settings, setSettings] = useContext(SettingsContext);



    const testSessionToken = async () => {
        console.log(settings);
    }

    const testRefreshToken = async () => {

    }

    return (<>
        <div className="sidepanel">
            <UsernameDisplay />
            <button onClick={testSessionToken}>Test sessionToken</button>
            <button onClick={testRefreshToken}>Test refreshToken</button>
        </div>

        <div className="mainpanel">

            <nav>
                <ul>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/register">Register</Link></li>
                </ul>
            </nav>
            <Outlet />
        </div>
    </>
    )
}

export default Layout;
