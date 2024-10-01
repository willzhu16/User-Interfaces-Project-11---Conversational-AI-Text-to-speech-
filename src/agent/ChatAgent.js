import createChatDelegator from "./ChatDelegator";
import { isLoggedIn, logout, ofRandom } from "./Util";

//Chat agent.
const createChatAgent = () => {
    const CS571_WITAI_ACCESS_TOKEN = "...";

    const delegator = createChatDelegator();

    let chatrooms = []; //All available chatrooms.

    //Gets all chatrooms and greets user.
    const handleInitialize = async () => {
        const resp = await fetch("...", {
            headers: {
                "X-CS571-ID": "..."
            }
        });
        const data = await resp.json();
        chatrooms = data;

        return ofRandom(["Welcome to BadgerChat! My name is Bucki, how can I help you?", "Hello and welcome to BadgerChat! I'm Bucki."]);
    }

    //Pathways.
    const handleReceive = async (prompt) => {
        if (delegator.hasDelegate()) { return delegator.handleDelegation(prompt); }
        const resp = await fetch(`...${encodeURIComponent(prompt)}`, {
            headers: {
                "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
            }
        })
        const data = await resp.json();
        if (data.intents.length > 0) {
            switch (data.intents[0].name) {
                case "get_help": return handleGetHelp();
                case "get_chatrooms": return handleGetChatrooms();
                case "get_messages": return handleGetMessages(data);
                case "login": return handleLogin();
                case "register": return handleRegister();
                case "create_message": return handleCreateMessage(data);
                case "logout": return handleLogout();
                case "whoami": return handleWhoAmI();
            }
        }
        return "Sorry, I didn't get that. Type 'help' to see what you can do!";
    }

    const handleTranscription = async (rawSound, contentType) => {
        const resp = await fetch(`...`, {
            method: "POST",
            headers: {
                "Content-Type": contentType,
                "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
            },
            body: rawSound
        })
        const data = await resp.text();
        const transcription = data
            .split(/\r?\n{/g)
            .map((t, i) => i === 0 ? t : `{${t}`)  // Turn the response text into nice JS objects
            .map(s => JSON.parse(s))
            .filter(chunk => chunk.is_final)       // Only keep the final transcriptions
            .map(chunk => chunk.text)
            .join(" ");                            // And conjoin them!
        return transcription;
    }

    const handleSynthesis = async (txt) => {
        if (txt.length > 280) {
            return undefined;
        } else {
            const resp = await fetch(`...`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "audio/wav",
                    "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
                },
                body: JSON.stringify({
                    q: txt,
                    voice: "Rebecca",
                    style: "soft"
                })
            })
            const audioBlob = await resp.blob()
            return URL.createObjectURL(audioBlob);
        }
    }

    //Help function
    const handleGetHelp = async () => {
        return ofRandom([
            "Try asking 'give me a last of chatrooms,' or ask for more help!",
            "Try asking 'register for an account,' or ask for more help!"
        ]);
    }

    //Lists out all chatrooms
    const handleGetChatrooms = async () => {
        let num = chatrooms.length;
        return ofRandom([
            `Of course, there are ${num} chatrooms: ${chatrooms.join(", ")}`,
            `Here are the ${num} chatrooms: ${chatrooms.join(", ")}`,
            `There are ${num} available chatrooms: ${chatrooms.join(", ")}`
        ]);
    }

    //Get 1 or more messages from a chatroom or from all chatrooms.
    const handleGetMessages = async (data) => {
        let chatroom = '';
        let num = '';
        if (data.entities['chatroom:chatroom']) {
            chatroom = data.entities['chatroom:chatroom'][0].value;
        }
        if (data.entities['wit$number:number']) {
            num = data.entities['wit$number:number'][0].value;
        }

        //Fetch messages.
        const resp = await fetch(`...=${chatroom}&num=${num}`, {
            headers: {
                "X-CS571-ID": "..."
            }
        });
        const messages = await resp.json();

        //Print all messages out one by one.
        return messages.messages.map(m => `In ${m.chatroom}, ${m.poster} created a post titled '${m.title}' saying '${m.content}'`)
    }

    //Login user.
    const handleLogin = async () => {
        return await delegator.beginDelegation("LOGIN");
    }

    //Register User
    const handleRegister = async () => {
        return await delegator.beginDelegation("REGISTER");
    }

    //Create message
    const handleCreateMessage = async (data) => {
        return await delegator.beginDelegation("CREATE", data);
    }

    //Logs user out if user was signed in.
    const handleLogout = async () => {
        //If logged in, log out.
        if (await isLoggedIn()) {
            const resp = await fetch("...", {
                method: "POST",
                credentials: "include",
                headers: {
                    "X-CS571-ID": "..."
                }
            });
            if (resp.status === 200) {
                //Success
                return ofRandom(["You have been logged out", "Success! You have been logged out", "See ya!"])
            } else {
                //Fail
                return `Error. Please try again.`;
            }
        } else {
            //User not logged in.
            return "Already signed out";
        }
    }

    //Prints out user information.
    const handleWhoAmI = async () => {
        const resp = await fetch("...", {
            credentials: "include",
            headers: {
                "X-CS571-ID": "..."
            }
        });
        const data = await resp.json();

        if (!data.isLoggedIn) {
            return ofRandom(["You are not logged in.", "Please log in first."])
        } else {
            return `You are currently logged in as ${data.user.username}`;
        }
    }

    return {
        handleInitialize,
        handleReceive,
        handleTranscription,
        handleSynthesis
    }
}

export default createChatAgent;