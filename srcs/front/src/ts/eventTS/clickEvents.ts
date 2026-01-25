import { fetchErrcodeHandler, alertBoxMsg, displayCorrectErrMsg } from "./userLog.js";
import { startTournament } from "./clickTournamentSelectPlayers.js";
import type { FileUploadResponse, ProfileEditData } from "../types/api.types";

document.addEventListener("DOMContentLoaded", (): void => {
	document.addEventListener("click", (element: MouseEvent): void => {
		const target = element.target as HTMLElement;
		if (target.matches('#profileButton') || target.matches('#profileButton2')) {
			const panel = document.getElementById('profilePanel') as HTMLElement | null;
			if (!panel) return;

			if (panel.style.display === "none")
				panel.style.display = "flex";
			else
				panel.style.display = "none";
		}
	});
});

function reportWindowSize(): void {
	const panel = document.getElementById('profilePanel') as HTMLElement | null;
	if (!panel) return;
	const style = window.getComputedStyle(panel);
	if (style.display === 'none')
		return;
	panel.style.display = 'none';
}

window.addEventListener("resize", reportWindowSize);

window.addEventListener('keydown', (e: KeyboardEvent): void => {
	try {
		const isF5 = e.code === 'F5' || e.key === 'F5';
		const isCtrlR = e.key.toLowerCase() === 'r' && (e.ctrlKey || e.metaKey);
		const isCtrlF5 = isF5 && (e.ctrlKey || e.metaKey);

		if (isF5 || isCtrlR || isCtrlF5)
			sessionStorage.setItem('f5WasPressed', 'true');

	} catch (err) {
		console.error("Key listened had an issue !", err);
	}
});

window.addEventListener("pagehide", (): void => {
	if (!(sessionStorage.getItem('f5WasPressed'))) {
		sessionStorage.setItem('f5WasPressed', 'false');
		sessionStorage.setItem('f5VarNotSet', 'true');
	}

	const checkKeyReload = sessionStorage.getItem('f5WasPressed') === 'true';
	const reloadTypeResult = isPageReload();

	if (checkKeyReload || reloadTypeResult) {
		window.sessionStorage.setItem('pagehide', 'pageshouldreload');
		return;
	}
	window.sessionStorage.setItem('pagehide', 'logout_fetch_sent');
	try {
		fetch('/logout', {
			method: 'POST',
			credentials: 'include',
			headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
			keepalive: true,
		});
		window.sessionStorage.setItem('logStatus', 'loggedOut');
		window.sessionStorage.setItem('access_token', 'userSelfLogoutToken');
	} catch (err) {
		// ignore for now
	}
});

window.onFileSelected = function (inputFileSelector: HTMLInputElement): void {
	const selectedFileName = document.getElementById('selectedFileName') as HTMLElement | null;
	if (!inputFileSelector || !selectedFileName) return;
	const file = inputFileSelector.files && inputFileSelector.files[0];

	if (file) {
		selectedFileName.textContent = file.name;
	} else {
		selectedFileName.textContent = '';
	}
};

function isPageReload(): boolean {
	try {
		const entries = performance.getEntriesByType && performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
		if (entries && entries.length && entries[0].type === 'reload') {
			window.sessionStorage.setItem('nbReloadsLeft', '1');
			return true;
		}
	} catch (e) { }
	return false;
}

async function uploadFileToServer(fileObj: File): Promise<string | null> {
	const fileInput = document.getElementById('myfileSelector') as HTMLInputElement | null;
	const filenameStr = document.getElementById('selectedFileName') as HTMLElement | null;
	if (!fileInput || !filenameStr) return null;
	const formData = new FormData();
	formData.append("myfileSelector", fileObj);

	try {
		const fileUploadFetchResponse = await fetch('/file_upload', {
			method: 'POST',
			credentials: 'include',
			headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
			body: formData,
		});

		if (!fileUploadFetchResponse.ok) {
			const text = await fileUploadFetchResponse.text().catch(() => fileUploadFetchResponse.statusText);
			throw new Error(`Request failed: ${fileUploadFetchResponse.status} ${text}`);
		}
		const result: FileUploadResponse = await fileUploadFetchResponse.json();
		if (result) {
			console.log("Upload fetch success ✅");
			return result.path;
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return await uploadFileToServer(fileObj);
		if ((err as Error).toString().indexOf("Request Entity Too Large") != -1)
		{
			alertBoxMsg("❌ Cannot upload file bigger than 5MB !");
			console.error("❌ Cannot upload file bigger than 5MB !");
		}
		else
			displayCorrectErrMsg(err as Error);
		filenameStr.innerText = "❌ File upload failed";
		return null;
	}
	return null;
}

window.backToTournamentPage = function (): void {
	window.history.pushState({}, "", "/tournament");
	window.dispatchEvent(new PopStateEvent("popstate"));
};

window.validatePlayerNameFields = function (nbPlayers: number, event: Event): void {
	for (let i = 1; i <= nbPlayers; i++) {
		const currentInput = document.getElementById(`player${i}`) as HTMLInputElement | null;
		if (currentInput) {
			if (!currentInput.value)
				currentInput.value = currentInput.placeholder;
		} else {
			console.log(`Input player${i} not found !`);
		}
	}
	startTournament(nbPlayers, event);
};

window.createCustomTournamentPage = function (nbPlayers: number): void {
	if (nbPlayers !== 4 && nbPlayers !== 8 && nbPlayers !== 16)
		return;
	const tournamentNbPlayerSelect = document.getElementById('tournamentNbPlayerSelect') as HTMLElement | null;
	const tournamentBuiltBlock = document.getElementById('tournamentBuiltBlock') as HTMLElement | null;
	if (!tournamentBuiltBlock || !tournamentNbPlayerSelect) return;

	tournamentNbPlayerSelect.style.display = "none";
	tournamentBuiltBlock.style.display = "block";
	tournamentBuiltBlock.innerHTML = "";

	let i: number;
	for (i = 1; i <= nbPlayers; i++) {
		const listItem = document.createElement("input");
		listItem.setAttribute('placeholder', "Player" + `${i}`);
		listItem.setAttribute('id', "player" + `${i}`);
		listItem.setAttribute('placeholder', "Player " + `${i}`);
		listItem.setAttribute('tabindex', `${i}`);
		listItem.className = 'pb-2 w-[40%] mt-[1vw] ml-4 pl-5 mx-auto hover:text-[#98c6f8] focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autofocus autocomplete="off"';
		tournamentBuiltBlock.appendChild(listItem);
	}

	const usernameInputDiv = document.createElement("div");
	usernameInputDiv.className = "mt-5";
	usernameInputDiv.innerHTML = `<input tabindex=\"${i}\" class=\"shadow-[0_0_20px_rgba(158,202,237,0.9)] w-[20vw] mt-[1vw] h-[4vw] focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] border hover:border-[#98c6f8] border-white rounded-lg \" name=\"start4Players\" type=\"submit\" value=\"Start\" onclick=\"validatePlayerNameFields(${nbPlayers} ,event)\">`;
	tournamentBuiltBlock.appendChild(usernameInputDiv);
};

window.spinMeAround = function (): void {
	const deathStarImg = document.getElementById('deathStarImg') as HTMLElement | null;

	if (!deathStarImg) return;

	if (deathStarImg.classList.contains("animate-spin"))
		deathStarImg.classList.remove("animate-spin");
	else
		deathStarImg.classList.add("animate-spin");
};

window.sneakyClick = function (): void {
	const aboutText = document.getElementById('aboutMembers') as HTMLElement | null;

	if (!aboutText) return;
	aboutText.textContent = "Just kidding, lchapard did everything (what a great guy)";
};

window.saveProfileInfo = async function (): Promise<void> {
	const username = document.getElementById('newUsername') as HTMLInputElement | null;
	const confirmText = document.getElementById('confirmChangeResults') as HTMLElement | null;
	const fileInput = document.getElementById("myfileSelector") as HTMLInputElement | null;
	const userPfp = document.getElementById('userPfp') as HTMLImageElement | null;
	const selectedFileName = document.getElementById('selectedFileName') as HTMLElement | null;

	if (!username || !confirmText || !fileInput || !userPfp || !selectedFileName) return;

	const selectedFile = fileInput.files?.[0];
	confirmText.innerText = "";

	if (!username.value && !selectedFile)
		return;

	if (username) {
		if (username.value && username.value.length < 3) {
			confirmText.innerText = "❌ Username must be at least 3 characters !";
			username.focus();
			return;
		}
		if (username.value.length > 13) {
			confirmText.innerText = "❌ New username is too long ! (13 max)";
			username.value = "";
			username.focus();
			return;
		}
		if (username.value === username.placeholder) {
			confirmText.innerText = "❌ New username cannot be the same as the old one !";
			username.value = "";
			username.focus();
			return;
		}
	}

	let fullFilename = userPfp.getAttribute("src") || "";

	if (selectedFile && selectedFile.name) {
		const uploadPath = await uploadFileToServer(selectedFile);
		if (uploadPath)
			fullFilename = uploadPath;
		else {
			username.value = "";
			fileInput.value = "";
			selectedFileName.textContent = '';
			return;
		}
	}
	if (!username.value)
		username.value = username.placeholder;

	const data: ProfileEditData = {
		name: username.value.toUpperCase(),
		avatar: fullFilename,
	};

	try {
		const applyChangeResponse = await fetch('/profile/edit', {
			method: 'PATCH',
			headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(data),
		});

		if (!applyChangeResponse.ok) {
			const text = await applyChangeResponse.text().catch(() => applyChangeResponse.statusText);
			throw new Error(`Request failed: ${applyChangeResponse.status} ${text}`);
		}
		const result = await applyChangeResponse.json();

		if (result) {
			alertBoxMsg(`✅ User was updated !`);
			selectedFileName.textContent = '';
			fileInput.value = "";
			username.placeholder = username.value;
			userPfp.setAttribute('src', fullFilename);
			username.value = "";
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return window.saveProfileInfo();
		username.value = "";
		fileInput.value = "";
		selectedFileName.textContent = '';
		console.error('⚠️ Could not edit user info!\n', err);
		displayCorrectErrMsg(err as Error);
	}
};
