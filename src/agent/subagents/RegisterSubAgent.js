import { isLoggedIn, logout, ofRandom } from "../Util";
import AIEmoteType from "../../components/chat/messages/AIEmoteType";

//Registers the user in.
const createRegisterSubAgent = (end) => {
    let stage; //Used to keep track of stage.
    let username, password, passwordVer; //Stores user information.

    //Checks if user is already logged in - if not, prompts for an username.
    const handleInitialize = async (promptData) => {

        //Check if already logged in.
        if (await isLoggedIn()) {
            return end(ofRandom([
                "You are already logged in, try logging out first.",
                "You are already signed in, try signing out first."
            ]))
        } else {
            stage = "FOLLOWUP_USERNAME"
            return ofRandom(["Great! What username would you like to use?", "Perfect, what username would you like to use?"]);
        }
    }

    //Pathways for specific stages.
    const handleReceive = async (prompt) => {
        switch (stage) {
            case "FOLLOWUP_USERNAME": return await handleFollowupUsername(prompt);
            case "FOLLOWUP_PASSWORD": return await handleFollowupPassword(prompt);
            case "FOLLOWUP_PASSWORDVER": return await handleFollowupPasswordVer(prompt);
        }
    }

    //Stores username and prompts for password.
    const handleFollowupUsername = async (prompt) => {
        stage = "FOLLOWUP_PASSWORD";
        username = prompt;
        return ofRandom([{ msg: "Great! What would you like your password to be?", nextIsSensitive: true }, { msg: "Alright, what is your password?", nextIsSensitive: true }])
    }

    //Stores password and prompts for confirmation password.
    const handleFollowupPassword = async (prompt) => {
        password = prompt;
        stage = "FOLLOWUP_PASSWORDVER";
        return ofRandom([{ msg: "Lastly, please confirm your password", nextIsSensitive: true }, { msg: "Please confirm your password", nextIsSensitive: true }])
    }

    //Tries to register user.
    const handleFollowupPasswordVer = async (prompt) => {
        passwordVer = prompt;

        //Incorrect passwords.
        if (password !== passwordVer) {
            return ofRandom(["Sorry, your passwords don't match", "Your passwords do not match. Please try again"]);
        }

        //Try registering.
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

            //Success - change emote to success
            return ofRandom([{
                msg: `Success! welcome ${username}`,
                emote: AIEmoteType.SUCCESS
            },
            {
                msg: `Success! You have been logged in, ${username}.`,
                emote: AIEmoteType.SUCCESS
            }
            ])
        } else if (resp.status === 409) {
            //Failure - change the emote to error.
            return { msg: `Username already taken. Please retry with a different one.`, emote: AIEmoteType.ERROR };
        } else {
            return { msg: "Looks like something went wrong. Please try again.", emote: AIEmoteType.ERROR };
        }
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createRegisterSubAgent;