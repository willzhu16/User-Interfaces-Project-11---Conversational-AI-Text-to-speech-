import { isLoggedIn, logout, ofRandom } from "../Util";
import AIEmoteType from "../../components/chat/messages/AIEmoteType";

//Signs user in.
const createLoginSubAgent = (end) => {
    let stage; //Keeps track of follow up stages.
    let username, password; //Stores user info.

    //Prompts for username if user is not already signed in.
    const handleInitialize = async (promptData) => {

        //Check if user is already signed in.
        if (await isLoggedIn()) {
            return end(ofRandom([
                "You are already logged in, try logging out first.",
                "You are already signed in, try signing out first."
            ]))
        } else {
            //Prompts username and sets stage.
            stage = "FOLLOWUP_USERNAME"
            return "Great! What is your username?";
        }
    }

    //Pathways for specific stages.
    const handleReceive = async (prompt) => {
        switch (stage) {
            case "FOLLOWUP_USERNAME": return await handleFollowupUsername(prompt);
            case "FOLLOWUP_PASSWORD": return await handleFollowupPassword(prompt);
        }
    }

    //Gathers username and prompts for password - making sure to hide the sensitive information.
    const handleFollowupUsername = async (prompt) => {
        stage = "FOLLOWUP_PASSWORD";
        username = prompt;
        return ofRandom([{ msg: "Great! What is your password?", nextIsSensitive: true }, { msg: "Alright, what is your password?", nextIsSensitive: true }])
    }

    //Confirms password and tries to login. Changes emote if success or fail. 
    const handleFollowupPassword = async (prompt) => {
        password = prompt;
        stage = undefined;

        //Try logging in.
        const resp = await fetch(`...`, {
            method: "POST",
            credentials: "include",
            headers: {
                "X-CS571-ID": "...",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        end();
        if (resp.status === 200) {

            //Success - change emote to success.
            return ofRandom([{
                msg: `Success! welcome ${username}`,
                emote: AIEmoteType.SUCCESS
            },
            {
                msg: `Success! You have been logged in, ${username}.`,
                emote: AIEmoteType.SUCCESS
            }
            ])
        } else {

            //Failure - change emote to error
            return { msg: "Sorry, your username and password combination was incorrect", emote: AIEmoteType.ERROR }
        }
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createLoginSubAgent;