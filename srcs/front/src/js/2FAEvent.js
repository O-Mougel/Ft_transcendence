import Login2fa from "../views/2faLogin.js";
import { show2FAStatus } from "../js/index.js";
import { backToDefaultPage, displayCorrectErrMsg, fetchErrcodeHandler } from "../js/userLog.js";
import { adjustNavbar } from "./index.js";
import { alertBoxMsg } from "./userLog.js";
window.showQRCode = async function (event) {
    event.preventDefault();
    const showQRCodeButton = document.getElementById("showQRCodeButton");
    const qrCodeSection = document.getElementById("qrCodeSection");
    const TwoFACodeInput = document.getElementById('2FACodeInput');
    const qrCodeImage = document.getElementById("qrCodeImage");
    if (!qrCodeImage || !qrCodeSection || !showQRCodeButton || !TwoFACodeInput)
        return;
    try {
        const activate2FAResponse = await fetch('/profile/2fa/activate', {
            credentials: 'include',
            method: 'PATCH',
            headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
        });
        if (!activate2FAResponse.ok) {
            const text = await activate2FAResponse.text().catch(() => activate2FAResponse.statusText);
            throw new Error(`Request failed: ${activate2FAResponse.status} ${text}`);
        }
        const result = await activate2FAResponse.json();
        if (result) {
            qrCodeImage.src = result.qrCode;
            qrCodeSection.style.display = "flex";
            qrCodeImage.style.display = "block";
            showQRCodeButton.disabled = true;
            TwoFACodeInput.focus();
        }
    }
    catch (err) {
        if (await fetchErrcodeHandler(err) == 0)
            return (window.showQRCode(event));
        console.error('Failed to activate 2FA!\n => ', err);
        displayCorrectErrMsg(err);
    }
};
window.disable2FA = async function () {
    try {
        const disable2FARequestResponse = await fetch('/profile/2fa/deactivate', {
            credentials: 'include',
            headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
            method: 'PATCH',
        });
        if (!disable2FARequestResponse.ok) {
            const text = await disable2FARequestResponse.text().catch(() => disable2FARequestResponse.statusText);
            throw new Error(`Request failed: ${disable2FARequestResponse.status} ${text}`);
        }
        const result = await disable2FARequestResponse.json();
        if (result) {
            alertBoxMsg("✅ 2FA disabled successfully !");
            const qrCodeSection = document.getElementById("qrCodeSection");
            if (qrCodeSection)
                qrCodeSection.style.display = "none";
            show2FAStatus();
        }
    }
    catch (err) {
        if (await fetchErrcodeHandler(err) == 0)
            return (window.disable2FA());
        console.error('Failed to disable 2FA!\n => ', err);
        displayCorrectErrMsg(err);
    }
};
window.validate2FACode = async function (event) {
    event.preventDefault();
    const TwoFACodeInput = document.getElementById('2FACodeInput');
    if (!TwoFACodeInput)
        return;
    try {
        const password = TwoFACodeInput.value;
        if (!password) {
            alertBoxMsg("❌ 2FA code cannot be empty !");
            TwoFACodeInput.focus();
            return;
        }
        const data = {
            code: password,
        };
        const verify2FACode = await fetch('/profile/2fa/verify', {
            credentials: 'include',
            method: 'PATCH',
            headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!verify2FACode.ok) {
            const text = await verify2FACode.text().catch(() => verify2FACode.statusText);
            alertBoxMsg("❌ Invalid 2FA code !");
            throw new Error(`Request failed: ${verify2FACode.status} ${text}`);
        }
        const result = await verify2FACode.json();
        if (result) {
            alertBoxMsg("✅ 2FA activated successfully !");
            // qrCodeImage.src = "";
            const qrCodeSection = document.getElementById("qrCodeSection");
            if (qrCodeSection)
                qrCodeSection.style.display = "none";
            show2FAStatus();
        }
    }
    catch (err) {
        if (await fetchErrcodeHandler(err) == 0)
            return (window.validate2FACode(event));
        console.error('Failed to activate 2FA!\n => ', err);
        displayCorrectErrMsg(err);
    }
};
window.loginWith2FACode = async function (event) {
    event.preventDefault();
    const TwoFACodeInput = document.getElementById('2FACodeInput');
    if (!TwoFACodeInput)
        return;
    try {
        const password = TwoFACodeInput.value;
        if (!password) {
            alertBoxMsg("❌ 2FA code cannot be empty !");
            TwoFACodeInput.focus();
            return;
        }
        const data = {
            code: password,
        };
        const logWith2FACode = await fetch('/login/2fa', {
            credentials: 'include',
            method: 'POST',
            headers: { Authorization: `Bearer ${sessionStorage.getItem("temp_token")}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!logWith2FACode.ok) {
            const text = await logWith2FACode.text().catch(() => logWith2FACode.statusText);
            alertBoxMsg("❌ Invalid 2FA code !");
            throw new Error(`Request failed: ${logWith2FACode.status} ${text}`);
        }
        const result = await logWith2FACode.json();
        if (result) {
            sessionStorage.setItem('access_token', result.newAccessToken);
            sessionStorage.removeItem('temp_token');
            window.sessionStorage.setItem('logStatus', 'loggedIn');
            console.log('⏳ Logged in !');
            alertBoxMsg(`Welcome ! 😉`);
            await backToDefaultPage();
        }
    }
    catch (err) {
        if (await fetchErrcodeHandler(err) == 0)
            return (window.loginWith2FACode(event));
        console.error('Failed to log with 2FA!\n => ', err);
    }
};
export const goTo2faLogin = async () => {
    const view = new Login2fa();
    document.querySelector("#app").innerHTML = await view.getHTML();
    adjustNavbar("/2faLogin");
    if (typeof view.init === "function") {
        await view.init();
    }
    if (document.getElementById('2FACodeInput'))
        document.getElementById('2FACodeInput').focus();
    history.pushState(null, null, "/2faLogin");
};
window.player2TwoFAValidation = async function (event) {
    event.preventDefault();
    const TwoFACodeInput = document.getElementById('player2TwoFAInput');
    if (!TwoFACodeInput)
        return;
    try {
        const password = TwoFACodeInput.value;
        const divLogin = document.getElementById('profile2Login');
        const divLogin2FA = document.getElementById('profile2Login2FA');
        const profile2Overview = document.getElementById('profile2Overview');
        const goToGameButtonDiv = document.getElementById('goToGameButtonDiv');
        if (!password) {
            alertBoxMsg("❌ 2FA code cannot be empty !");
            TwoFACodeInput.focus();
            return;
        }
        const data = {
            code: password,
        };
        const logWith2FACode = await fetch('/login/player2/2fa', {
            credentials: 'include',
            method: 'POST',
            headers: { Authorization: `Bearer ${sessionStorage.getItem("temp_token")}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!logWith2FACode.ok) {
            const text = await logWith2FACode.text().catch(() => logWith2FACode.statusText);
            alertBoxMsg("❌ Invalid 2FA code !");
            throw new Error(`Request failed: ${logWith2FACode.status} ${text}`);
        }
        const result = await logWith2FACode.json();
        if (result) {
            window.sessionStorage.setItem('player2_token', result.matchToken);
            sessionStorage.removeItem('temp_token');
            await window.loadPlayer2Data();
            alertBoxMsg('⏳ Player 2 Logged in !');
            divLogin.style.display = "none";
            divLogin2FA.style.display = "none";
            profile2Overview.style.display = "flex";
            goToGameButtonDiv.style.display = "flex";
        }
    }
    catch (err) {
        if (await fetchErrcodeHandler(err) == 0)
            return (window.player2TwoFAValidation());
        console.error('Failed to validate 2FA!\n => ', err);
    }
};
