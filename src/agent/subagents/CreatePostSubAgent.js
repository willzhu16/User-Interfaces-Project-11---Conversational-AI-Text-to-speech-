import { isLoggedIn, logout, ofRandom } from "../Util";
import AIEmoteType from "../../components/chat/messages/AIEmoteType";

//Creates a post.
const createPostSubAgent = (end) => {
    let stage; //Keeps track of current stage.
    let title, content; //Title and content of message to be posted.
    let chatroom; //Chatroom to be posted in.

    //Checks if conditions are right and then prompts for title.
    const handleInitialize = async (promptData) => {

        //Check if user is logged in.
        if (await isLoggedIn() == false) {
            end();
            return ofRandom(["You must be logged in to post!", "Please log in before posting!"])
        }

        //Checks that chatroom was specified.
        if (!promptData.entities["chatroom:chatroom"]) {
            end();
            return ofRandom(["Please specify which chatroom you wish to post in.", "Which chatroom do you want to post in?"])
        }

        chatroom = promptData.entities['chatroom:chatroom'][0].value; //Chatroom to be posted in.
        stage = "FOLLOWUP_TITLE"
        return ofRandom(["Sounds good! What would you like the title of your post to be?", "Perfect, what's the title?"]);
    }

    //Pathways for the specific stages.
    const handleReceive = async (prompt) => {
        switch (stage) {
            case "FOLLOWUP_TITLE": return await handleFollowupTitle(prompt);
            case "FOLLOWUP_CONTENT": return await handleFollowupContent(prompt);
            case "FOLLOWUP_CONFIRMATION": return await handleFollowupConfirmation(prompt);
        }
    }

    //Stores title.
    const handleFollowupTitle = async (prompt) => {
        stage = "FOLLOWUP_CONTENT";
        title = prompt;
        return ofRandom(["Alright, what would the content of the post be?", "What do you want to say?"])
    }

    //Stores content.
    const handleFollowupContent = async (prompt) => {
        content = prompt;
        stage = "FOLLOWUP_CONFIRMATION";
        return ofRandom([`All ready! to confirm, you want to create a post titled '${title}' in ${chatroom}? (yes/no)`, `Please confirm. You want to create a post titled '${title}' in ${chatroom}? (yes/no)`])
    }

    //Posts.
    const handleFollowupConfirmation = async (prompt) => {
        let confirmation = prompt;

        //User does not confirm - cancel send.
        if (confirmation == "no") {
            end();
            return ofRandom(["Understood. Cancelling post.", "Sounds good, I'll scrap this message."]);
        } else if (confirmation == "yes") {

            //User confirmed - try posting.
            const resp = await fetch(`...${chatroom}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "X-CS571-ID": "...",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    content: content
                })
            })
            end();
            if (resp.status === 200) {

                //Success! - change emote.
                return ofRandom([{
                    msg: `All Set! Your post has been made in ${chatroom}`,
                    emote: AIEmoteType.SUCCESS
                },
                {
                    msg: `Success! Your message has been posted to ${chatroom}.`,
                    emote: AIEmoteType.SUCCESS
                }
                ])
            } else {
                //Fail - change emote.
                return { msg: "Sorry, something went wrong. Please try again.", emote: AIEmoteType.ERROR };
            }
        } else {
            //Ask for confirmation again in case user misspells.
            return ofRandom(["Oops, I didn't catch that. Please confirm again (yes/no)", "Please confirm by typing yes, or by typing no."]);
        }
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createPostSubAgent;