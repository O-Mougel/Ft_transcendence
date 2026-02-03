import Login2fa from "../viewTS/2faLogin.js";
import { show2FAStatus } from "./index.js";
import { backToDefaultPage, displayCorrectErrMsg, fetchErrcodeHandler, alertBoxMsg } from "./userLog.js";
import { adjustNavbar, router } from "./index.js";
import type { QRCodeResponse, TwoFALoginResponse, Player2TwoFAResponse, TwoFACodeData } from "../types/api.types.js";
import { setupSocketCommunication }  from "./userSocket.js";


window.showQRCode = async function (event: Event): Promise<void> {
	event.preventDefault();

	const showQRCodeButton = document.getElementById("showQRCodeButton") as HTMLButtonElement | null;
	const qrCodeSection = document.getElementById("qrCodeSection") as HTMLElement | null;
	const TwoFACodeInput = document.getElementById('2FACodeInput') as HTMLInputElement | null;
	const qrCodeImage = document.getElementById("qrCodeImage") as HTMLImageElement | null;

	if (!qrCodeImage || !qrCodeSection || !showQRCodeButton || !TwoFACodeInput) return;

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
		const result: QRCodeResponse = await activate2FAResponse.json();

		if (result) {
			qrCodeImage.src = result.qrCode;
			qrCodeSection.style.display = "flex";
			qrCodeImage.style.display = "block";
			showQRCodeButton.disabled = true;
			TwoFACodeInput.focus();
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return window.showQRCode(event);
		console.error('Failed to activate 2FA!\n => ', err);
		displayCorrectErrMsg(err as Error);
	}
};

window.disable2FA = async function (): Promise<void> {
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
			const qrCodeSection = document.getElementById("qrCodeSection") as HTMLElement | null;
			if (qrCodeSection)
				qrCodeSection.style.display = "none";
			show2FAStatus();
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return window.disable2FA();
		console.error('Failed to disable 2FA!\n => ', err);
		displayCorrectErrMsg(err as Error);
	}
}

window.validate2FACode = async function (event: Event): Promise<void> {
	event.preventDefault();
	const TwoFACodeInput = document.getElementById('2FACodeInput') as HTMLInputElement | null;
	if (!TwoFACodeInput) return;

	try {
		const password = TwoFACodeInput.value;

		if (!password) {
			alertBoxMsg("❌ 2FA code cannot be empty !");
			TwoFACodeInput.focus();
			return;
		}

		const data: TwoFACodeData = {
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
			const qrCodeSection = document.getElementById("qrCodeSection") as HTMLElement | null;
			if (qrCodeSection)
				qrCodeSection.style.display = "none";
			show2FAStatus();
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return window.validate2FACode(event);
		console.error('Failed to activate 2FA!\n => ', err);
		displayCorrectErrMsg(err as Error);
	}
}

window.loginWith2FACode = async function (event: Event): Promise<void> {
	event.preventDefault();
	const TwoFACodeInput = document.getElementById('2FACodeInput') as HTMLInputElement | null;
	if (!TwoFACodeInput) return;

	try {
		const password = TwoFACodeInput.value;

		if (!password) {
			alertBoxMsg("❌ 2FA code cannot be empty !");
			TwoFACodeInput.focus();
			return;
		}

		const data: TwoFACodeData = {
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
		const result: TwoFALoginResponse = await logWith2FACode.json();
		if (result) {
			sessionStorage.setItem('access_token', result.newAccessToken);
			if (sessionStorage.getItem('temp_token'))
				sessionStorage.removeItem('temp_token');
			window.sessionStorage.setItem('logStatus', 'loggedIn');
			if (!setupSocketCommunication())
					throw new Error(`Request failed: 401 ${JSON.stringify({ message: "Socket creation failed", errRef: "socketCreationFailed" })}`);
			console.log('⏳ Logged in !');
			alertBoxMsg(`Welcome ! 😉`);
			await backToDefaultPage();
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return window.loginWith2FACode(event);
		console.error('Failed to log with 2FA!\n => ', err);
	}
}

export const goTo2faLogin = async (): Promise<void> => {
	const view = new Login2fa();
	const appElement = document.querySelector("#app") as HTMLElement | null;
	if (appElement) {
		appElement.innerHTML = await view.getHTML();
	}
	adjustNavbar("/2faLogin");
	if (typeof view.init === "function") {
		await view.init();
	}
	const codeInput = document.getElementById('2FACodeInput') as HTMLInputElement | null;
	if (codeInput) codeInput.focus();
	history.pushState(null, "", "/2faLogin");
	router();
}

window.player2TwoFAValidation = async function (event: Event): Promise<void> {
	event.preventDefault();
	const TwoFACodeInput = document.getElementById('player2TwoFAInput') as HTMLInputElement | null;
	if (!TwoFACodeInput) return;

	try {
		const password = TwoFACodeInput.value;
		const divLogin = document.getElementById('profile2Login') as HTMLElement | null;
		const divLogin2FA = document.getElementById('profile2Login2FA') as HTMLElement | null;
		const profile2Overview = document.getElementById('profile2Overview') as HTMLElement | null;
		const goToGameButtonDiv = document.getElementById('goToGameButtonDiv') as HTMLElement | null;

		if (!password) {
			alertBoxMsg("❌ 2FA code cannot be empty !");
			TwoFACodeInput.focus();
			return;
		}

		const data: TwoFACodeData = {
			code: password,
		};

		const logWith2FACode = await fetch('/login/player2/2fa', {
			credentials: 'include',
			method: 'POST',
			headers: { Authorization: `Bearer ${sessionStorage.getItem("match_token")}`, 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});

		if (!logWith2FACode.ok) {
			const text = await logWith2FACode.text().catch(() => logWith2FACode.statusText);
			alertBoxMsg("❌ Invalid 2FA code !");
			throw new Error(`Request failed: ${logWith2FACode.status} ${text}`);
		}
		const result: Player2TwoFAResponse = await logWith2FACode.json();
		if (result) {
			window.sessionStorage.setItem('player2_token', result.matchToken);
			if (sessionStorage.getItem('match_token'))
				sessionStorage.removeItem('match_token');
			await window.loadPlayer2Data();
			alertBoxMsg('⏳ Player 2 Logged in !');
			if (divLogin) divLogin.style.display = "none";
			if (divLogin2FA) divLogin2FA.style.display = "none";
			if (profile2Overview) profile2Overview.style.display = "flex";
			if (goToGameButtonDiv) goToGameButtonDiv.style.display = "flex";
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return window.player2TwoFAValidation(event);
		console.error('Failed to validate 2FA!\n => ', err);
	}
}
