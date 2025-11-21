import { useContext } from "react";
import { useEffect, useState } from "react";
import { SettingsContext } from "../../main";

const Game = ({ ws }) => {

    const [gamestate, setGameState] = useState(null);
    const [settings, setSettings] = useContext(SettingsContext);
    // const [winner, setWinner] = useState(null);

    const handleGameState = (message) => {

        const parsed = JSON.parse(message.data);
        if(parsed.type === "game-state") {
            setGameState(parsed.gamestate);
            // setWinner(null);
        }
        else if(parsed.type === "winner"){
            setGameState(parsed.gamestate);
            // setWinner(parsed.winner);
            // alert(parsed.winner === settings.user_id ? "You win!" : "You lose");
        }
    }

    const marker = (id) => {
        if(id == null) { return null; }
        else if(parseInt(id) === settings.user_id) { return 'X'; }
        else { return 'O'; }
    }

    const place = (clicked) => {
        // if(gamestate.nextPlayer === settings.user_id) {
        // }
        const coord = clicked.split('-');
        ws.send(JSON.stringify({type: "game-move", move: {type: "place", coord: coord}}));
        // else {
        //     alert("It's not your turn");
        // }
    }

    useEffect(()=> {
        ws?.addEventListener("message", handleGameState);
        return () => { ws?.removeEventListener("message", handleGameState); };
    });


    if(!gamestate) {
        return <h1>Game board</h1>
    }

    return (
        <>
            <div className="gamedisplay">
                {gamestate.board.map((row, index) => {
                    return <div key={index}>
                        <div key={`0-${index}`} onClick={()=> place(`0-${index}`)}>{marker(row[0])}</div>
                        <div key={`1-${index}`} onClick={()=>place(`1-${index}`)}>{marker(row[1])}</div>
                        <div key={`2-${index}`} onClick={()=>place(`2-${index}`)}>{marker(row[2])}</div>
                    </div>
                })}
            </div>
            {(gamestate.winner !== null) && <h1>{gamestate.winner === settings.user_id ? "You win!" : gamestate.winner === -1 ? "draw" :"you lose" }</h1>}
        </>
    )
}

export default Game;