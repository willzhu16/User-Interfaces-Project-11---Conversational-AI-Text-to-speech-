const ofRandom = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

const isLoggedIn = async () => {
    const resp = await fetch("...", {
        credentials: "include",
        headers: {
            "X-CS571-ID": "..."
        }
    })
    const body = await resp.json();
    return body.isLoggedIn;
}

const getLoggedInUsername = async () => {
    const resp = await fetch("...", {
        credentials: "include",
        headers: {
            "X-CS571-ID": "..."
        }
    })
    const body = await resp.json();
    if (body.isLoggedIn) {
        return body.user.username;
    } else {
        return undefined;
    }
}

const logout = async () => {
    await fetch("...", {
        method: "POST",
        credentials: "include",
        headers: {
            "X-CS571-ID": "..."
        }
    })
}

export {
    ofRandom,
    isLoggedIn,
    getLoggedInUsername,
    logout
}