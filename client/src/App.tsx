import { useState} from "react";
import { buyCorn } from "./helper/api";
import PurchaseHistory from "./components/PurchaseHistory";

function App() {
    const [message, setMessage] =  useState("");

    const handleBuy = async() => {
        const res = await buyCorn();

        switch (res.status) {
            case 200:
                setMessage("Thanks for supporting your local farmers");
                break;
            case 429:
                setMessage("Please wait a minute");
                break;
            default:
                setMessage("Something went wrong and definitely we will fire IT department");
                break;
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <h1>Bob's Corn 🌽</h1>
            <button onClick={handleBuy}>Buy Corn</button>
            <p>{message}</p>
            <PurchaseHistory />
        </div>
    );
}

export default App
