import { useContext, useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { SettingsContext } from "../../main";
import UsernameDisplay from "./UsernameDisplay";
import CreateLobby from "./CreateLobby";
import LobbyList from "../../components/LobbyList";

const MainPage = () => {

    const [settings, setSettings] = useContext(SettingsContext);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        async function checkToken() {

            const result = await fetch("/api/auth_v1/refreshtoken", { method: "POST" });
            const data = await result.json();

            if (!result.ok) {
                navigate("/login");
            }
            else {
                setSettings({
                    username: data.user.username,
                    loggedIn: true,
                    sessionToken: data.sessionToken
                });
                setLoading(false);
            }
        }
        checkToken();
    }, []);

    return (<>
        <div className="sidepanel">
            <UsernameDisplay /><hr />
            <CreateLobby/><hr />
            {!loading && (<><LobbyList /><hr /></>)}
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

export default MainPage;
