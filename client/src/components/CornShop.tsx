import { useState} from "react";
import { buyCorn } from "../helper/api";
import PurchaseHistory from "./PurchaseHistory";
import { Button } from "./ui/button";

function CornShop() {
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

    const getMessageColor = () => {
        if (message.includes("Thanks")) return "text-green-600";
        if (message.includes("wait")) return "text-yellow-600";
        if (message.includes("wrong")) return "text-red-600";
        return "text-foreground";
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12">
                <div className="text-center space-y-6">
                    <h1 className="text-4xl font-bold text-foreground">Bob's Corn 🌽</h1>
                    <Button 
                        onClick={handleBuy}
                        size="lg"
                        className="text-lg px-8"
                    >
                        Buy Corn
                    </Button>
                    {message && (
                        <p className={`text-lg font-medium ${getMessageColor()}`}>
                            {message}
                        </p>
                    )}
                    <PurchaseHistory />
                </div>
            </div>
        </div>
    );
}

export default CornShop;

