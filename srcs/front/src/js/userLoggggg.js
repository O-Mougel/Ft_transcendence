import startingFile from "../views/startingFile.js";
import loginFile from "../views/login.js";
import { adjustNavbar } from "../js/index.js";
const backToDefaultPage = async () => {
    const view = new startingFile();
    const app = document.querySelector("#app");
    if (!app)
        return;
    app.innerHTML = await view.getHTML();
    adjustNavbar("/");
    if (typeof view.init === "function") {
        await view.init();
    }
    history.pushState(null, "", "/");
};
const backToLoginPage = async () => {
    const view = new loginFile();
    const app = document.querySelector("#app");
    if (!app)
        return;
    app.innerHTML = await view.getHTML();
    adjustNavbar("/logUser");
    if (typeof view.init === "function") {
        await view.init();
    }
    history.pushState(null, "", "/logUser");
};
const fieldValidity = (username, pwd, pwdconf, requestR, email) => {
    requestR.innerText = "";
    if (!username.value) {
        requestR.innerText = "❌ Login cannot be empty !";
        username.focus();
        return false;
    }
    else if (!email.value) {
        requestR.innerText = "❌ Email cannot be empty !";
        email.focus();
        return false;
    }
    else if (!pwd.value) {
        requestR.innerText = "❌ Enter a password !";
        pwd.focus();
        return false;
    }
    if (pwd.value !== pwdconf.value) {
        requestR.innerText = "❌ Both passwords must match !";
        pwd.value = "";
        pwdconf.value = "";
        pwd.focus();
        return false;
    }
    return true;
};

window.grabProfileInfo = async function () {
    const profilePanel = document.getElementById("profilePanel");
    const profileUsername = document.getElementById("playerGrabbedUsername");
    const profilePicture = document.getElementById("sidePannelPfp");
    if (!profilePanel || !profileUsername || !profilePicture)
        return;
    try {
        const dataRequestResponse = await fetch("/profile/grab", {
            credentials: "include",
        });
        if (!dataRequestResponse.ok) {
            const text = await dataRequestResponse.text().catch(() => dataRequestResponse.statusText);
            throw new Error(`Request failed: ${dataRequestResponse.status} ${text}`);
        }
        const result = (await dataRequestResponse.json());
        if (result) {
            profileUsername.innerHTML = result.name ?? "";
            profileUsername.style.color = "white";
            profilePicture.style.backgroundImage = `url(${result.avatar ?? ""})`;
            profilePicture.style.opacity = "1";
        }
    }
    catch (err) {
        console.error("Profile info grab failed !\n => ", err);
    }
};

window.logoutUser = async function () {
    const btntext = document.getElementById("logoutButton");
    try {
        const logoutResponse = await fetch("/logout", {
            method: "DELETE",
            credentials: "include",
        });
        if (!logoutResponse.ok) {
            const text = await logoutResponse.text().catch(() => logoutResponse.statusText);
            throw new Error(`Request failed: ${logoutResponse.status} ${text}`);
        }
        const result = (await logoutResponse.json());
        if (result && result.message) {
            console.log("⏳ Logging out ...");
            window.sessionStorage.setItem("logStatus", "loggedOut");
            backToDefaultPage();
        }
    }
    catch (err) {
        console.error("Login error! \n => ", err);
    }
};
window.handleNewUserCreate = async function (event) {
    event.preventDefault();
    const username = document.getElementById("newUsernameNewUser");
    const email = document.getElementById("newUserEmail");
    const password = document.getElementById("firstPasswordNewUser");
    const passwordConfirm = document.getElementById("confirmPasswordNewUser");
    const requestResult = document.getElementById("saveNewUserInfo");
    if (!username || !email || !password || !passwordConfirm || !requestResult)
        return;
    if (!fieldValidity(username, password, passwordConfirm, requestResult, email))
        return;
    const data = {
        email: email.value,
        name: username.value,
        password: password.value,
    };
    try {
        const newUserResponse = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!newUserResponse.ok) {
            const text = await newUserResponse.text().catch(() => newUserResponse.statusText);
            throw new Error(`Request failed: ${newUserResponse.status} ${text}`);
        }
        const result = (await newUserResponse.json());
        if (result && result.message)
            requestResult.innerText = result.message;
        else {
            console.log("✅ User created");
            username.value = "";
            email.value = "";
            password.value = "";
            passwordConfirm.value = "";
            backToDefaultPage();
        }
    }
    catch (err) {
        console.error("Login error!\n => ", err);
        if (requestResult)
            requestResult.innerText = "⚠️ Error: Network error";
    }
};
window.handleLoginClick = async function (event) {
    event.preventDefault();
    const username = document.getElementById("clientUsername");
    const password = document.getElementById("clientPassword");
    const logResult = document.getElementById("signInResult");
    if (!username || !password || !logResult)
        return;
    logResult.innerText = "";
    if (!username.value) {
        logResult.innerText = "❌ Login cannot be empty !";
        username.focus();
        return;
    }
    else if (!password.value) {
        logResult.innerText = "❌ Enter your password !";
        password.focus();
        return;
    }
    const data = {
        name: username.value,
        password: password.value,
    };
    try {
        const loginResponse = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!loginResponse.ok) {
            const text = await loginResponse.text().catch(() => loginResponse.statusText);
            throw new Error(`Request failed: ${loginResponse.status} ${text}`);
        }
        const result = (await loginResponse.json());
        if (result && result.message)
            logResult.innerText = result.message;
        else {
            username.value = "";
            password.value = "";
            window.sessionStorage.setItem("logStatus", "loggedIn");
            backToDefaultPage();
        }
    }
    catch (err) {
        console.error("Login error!\n => ", err);
        logResult.innerText = "⚠️ Error: Network error";
    }
};
