import isDocker from "is-docker";

const hostName = isDocker() ? 'express-api' : 'localhost';
const backendUrl = `http://${hostName}:3000`;

export async function buyCorn() {
    console.log(backendUrl);
    const response = await fetch(`${backendUrl}/buy`, {
        method: 'POST',
        }
    )
    return response;
}

