import Login2fa from "../views/2faLogin.js";
import { show2FAStatus } from "../js/index.js";
import { backToDefaultPage, displayCorrectErrMsg, fetchErrcodeHandler } from "../js/userLog.js";
import { adjustNavbar } from "./index.js";
import { alertBoxMsg } from "./userLog.js";


window.showQRCode = async function (event) {
	event.preventDefault();
	try 
	{
		const activate2FAResponse = await fetch('/profile/2fa/activate', {
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
		});

		if (!activate2FAResponse.ok) {
				const text = await activate2FAResponse.text().catch(() => activate2FAResponse.statusText);
				throw new Error(`Request failed: ${activate2FAResponse.status} ${text}`);
		}
		const result = await activate2FAResponse.json();	
		const showQRCodeButton = document.getElementById("showQRCodeButton");
		const qrCodeSection = document.getElementById("qrCodeSection");
		if (result)
		{
			console.log("QRCode loaded successfully!", result);
			const qrCodeImage = document.getElementById("qrCodeImage");
			qrCodeImage.src = result.qrCode;
			qrCodeSection.style.display = "flex";
			qrCodeImage.style.display = "block";
			showQRCodeButton.disabled = true;
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.showQRCode(event));
		console.error('Failed to activate 2FA!\n => ', err);
	}
};

window.disable2FA = async function () {
	try 
	{
		const disable2FARequestResponse = await fetch('/profile/2fa/deactivate', {
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
				method: 'DELETE',
		});

		if (!disable2FARequestResponse.ok) {
				const text = await disable2FARequestResponse.text().catch(() => disable2FARequestResponse.statusText);
				throw new Error(`Request failed: ${disable2FARequestResponse.status} ${text}`);
		}
		const result = await disable2FARequestResponse.json();	
		if (result)
		{
			console.log("2FA disabled successfully!", result);
			show2FAStatus();
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.disable2FA());
		console.error('Failed to disable 2FA!\n => ', err);
	}
}

window.validate2FACode = async function (event) {
	
	event.preventDefault();

	try
	{
		const password = document.getElementById('2FACodeInput').value;

		codeResult.innerText = "";
		if (!password)
		{
			codeResult.innerText = "❌ 2FA code cannot be empty !";
			password.focus();
			return ;
		}

		const data = {
			code: password,
		};

		const verify2FACode = await fetch('/profile/2fa/verify', {
				credentials: 'include',
				method: 'POST',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, 'Content-Type': 'application/json'},
				body:  JSON.stringify(data),
		});

		if (!verify2FACode.ok) {
				const text = await verify2FACode.text().catch(() => verify2FACode.statusText);
				throw new Error(`Request failed: ${verify2FACode.status} ${text}`);
		}
		const result = await verify2FACode.json();	
		if (result)
		{
			console.log("2FA code validated successfully!", result);
			codeResult.innerText = "✅ 2FA code validated successfully !";
			qrCodeImage.src = "";
			show2FAStatus();
		}
	} 
	catch (err) 
	{
		console.log(err);
		if (await fetchErrcodeHandler(err) == 0)
			return(window.validate2FACode(event));
		console.error('Failed to activate 2FA!\n => ', err);
		displayCorrectErrMsg(err, "dummydata");
	}
}


window.loginWith2FACode = async function (event) {
	
	event.preventDefault();

	try
	{
		const password = document.getElementById('2FACodeInput').value;

		codeResult.innerText = "";
		if (!password)
		{
			codeResult.innerText = "❌ 2FA code cannot be empty !";
			password.focus();
			return ;
		}

		const data = {
			code: password,
		};

		const logWith2FACode = await fetch('/login/2fa', {
				credentials: 'include',
				method: 'POST',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("temp_token")}`, 'Content-Type': 'application/json'},
				body:  JSON.stringify(data),
		});

		if (!logWith2FACode.ok) {
				const text = await logWith2FACode.text().catch(() => logWith2FACode.statusText);
				throw new Error(`Request failed: ${logWith2FACode.status} ${text}`);
		}
		const result = await logWith2FACode.json();	
		if (result)
		{
			console.log("2FA code validated successfully!", result);
			codeResult.innerText = "✅ 2FA code validated successfully !";
			sessionStorage.setItem('access_token', result.newAccessToken);
			sessionStorage.removeItem('temp_token');
			window.sessionStorage.setItem('logStatus','loggedIn');
			console.log('⏳ Logged in !');
			alertBoxMsg(`Welcome ! 😉`);
			await backToDefaultPage();
		}
	} 
	catch (err) 	
	{
		console.log(err);
		if (await fetchErrcodeHandler(err) == 0)
			return(window.loginWith2FACode(event));
		console.error('Failed to log with 2FA!\n => ', err);
	}
}


export const goTo2faLogin = async () => {

	const view = new Login2fa();
	document.querySelector("#app").innerHTML = await view.getHTML();
	adjustNavbar("/2faLogin");
	if (typeof view.init === "function") {
		 await view.init();
	}
	history.pushState(null, null, "/2faLogin");
}