import { fetchErrcodeHandler, alertBoxMsg, displayCorrectErrMsg, backToDefaultPage } from "./userLog.js";
import { closeSocketCommunication } from "./userSocket.js";
import { router } from "./index.js";
import { startTournament } from "./clickTournamentSelectPlayers.js";
import type { FileUploadResponse, ProfileEditData } from "../types/api.types";
import { CONTEXT } from "../gameTS/context.js";

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

	const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
	if (!canvas) return;
	canvas!.width = canvas.parentElement?.clientWidth ?? 800;
	canvas!.height = canvas.parentElement?.clientHeight ?? 500;
	CONTEXT.RES_CHANGE = CONTEXT.canvas!.height / CONTEXT.GAME_HEIGHT;
	
	
	const panel = document.getElementById('profilePanel') as HTMLElement | null;
	if (panel)
	{
		const style = window.getComputedStyle(panel);
		if (style.display === 'none')
			return;
		panel.style.display = 'none';
	}
}

export const alterTournamentSelectPage = async (): Promise<void> => {
	const tournamentBuiltBlock = document.getElementById('tournamentBuiltBlock') as HTMLElement | null;
	const tournamentNbPlayerSelect = document.getElementById('tournamentNbPlayerSelect') as HTMLElement | null;
	const baseTournamentDiv = document.getElementById('baseTournamentDiv') as HTMLElement | null;
	if (!tournamentBuiltBlock || !tournamentNbPlayerSelect || !baseTournamentDiv)
		return ;

	baseTournamentDiv.innerHTML = "";
	let ongoingTournamentDiv = document.createElement("div");
	ongoingTournamentDiv.className = 'flex flex-col justify-around items-center border border-white rounded-lg w-[30%] gap-2 p-4 mx-auto';
	ongoingTournamentDiv.innerHTML = "<div class=\"text-center text-white text-lg mb-2\">Tournament in progress</div> <a id=\"backToTournament\" href=\"/tournament\" class=\"px-6 py-3 w-full bg-transparent border border-[#98c6f8] font-bold rounded-lg hover:bg-white/10 cursor-pointer\" data-link>Back to tournament</a>";
    baseTournamentDiv.appendChild(ongoingTournamentDiv);
}

export function resizeCanvasToElement(): void {

	const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
	if (!canvas)
	{
		return ;
	}
	let ctx = canvas.getContext("2d");
	if (!ctx)
	{
		return ;
	}
	const cssW = canvas.parentElement?.clientWidth ?? 800;
	const cssH = canvas.parentElement?.clientHeight ?? 500;

	CONTEXT.GAME_WIDTH = cssW;
	CONTEXT.GAME_HEIGHT = cssH;
	
	const backingW = Math.floor(cssW);
	const backingH = Math.floor(cssH);
	if (canvas!.width !== backingW || canvas!.height !== backingH) {
		canvas!.width = backingW;
		canvas!.height = backingH;
	}
	CONTEXT.RES_CHANGE = CONTEXT.canvas!.height / CONTEXT.GAME_HEIGHT;

	ctx.setTransform(1, 0, 0, 1, 0, 0);
};

window.addEventListener('storage', async (event) => {
	if (event.key == "delogAllOthers")
	{
		if (event.newValue == "true")
		{
			window.sessionStorage.setItem('logStatus', 'loggedOut');
			window.sessionStorage.setItem('access_token', 'userSelfLogoutToken');
			window.localStorage.setItem('allowAutolog','false');
			console.info("You logged out in another tab !");
			backToDefaultPage();
		}
	}
});

window.addEventListener("resize", reportWindowSize);

window.addEventListener('keydown', (e: KeyboardEvent): void => {
	
	if (!e.key)
		return ;
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
	}

	const checkKeyReload = sessionStorage.getItem('f5WasPressed') === 'true';
	const reloadTypeResult = isPageReload();

	if (checkKeyReload || reloadTypeResult) {
		window.sessionStorage.setItem('pagehide', 'pageshouldreload');
		closeSocketCommunication();
		return;
	}
	// window.sessionStorage.setItem('pagehide', 'logout_fetch_sent');
	// try {
	// 	fetch('/logout', {
	// 		method: 'POST',
	// 		credentials: 'include',
	// 		headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
	// 		keepalive: true,
	// 	});
	// 	window.sessionStorage.setItem('logStatus', 'loggedOut');
	// 	window.sessionStorage.setItem('access_token', 'userSelfLogoutToken');
	// } catch (err) {
	// 	// ignore for now
	// }
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

export function isPageReload(): boolean {
	try {
		const entries = performance.getEntriesByType && performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
		if (entries && entries.length && entries[0].type === 'reload') {
			window.sessionStorage.setItem('nbReloadsLeft', '1');
			return true;
		}
	} catch (err) { }
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

window.validatePlayerNameFields = function (nbPlayers: number, event: Event): void {
	
	const resultFieldTournament = document.getElementById('resultFieldTournament') as HTMLElement | null;

	for (let i = 1; i <= nbPlayers; i++) {
		const currentInput = document.getElementById(`player${i}`) as HTMLInputElement | null;
		if (currentInput) {
			if (!currentInput.value)
				currentInput.value = currentInput.placeholder;
			if (currentInput.value.length > 13) {
				currentInput.focus();
				if (resultFieldTournament) {
					resultFieldTournament.classList.remove('hidden');
					resultFieldTournament.textContent = "❌ Player names must be at most 13 characters.";
				}
				return;
			}
			else if (currentInput.value.length < 3) {
				currentInput.focus();
				if (resultFieldTournament) {
					resultFieldTournament.classList.remove('hidden');
					resultFieldTournament.textContent = "❌ Player names must be at least 3 characters.";
				}
				return;
			}
			else if (!/^[A-Za-z0-9_]+$/.test(currentInput.value)) {
				currentInput.focus();
				if (resultFieldTournament) {
					resultFieldTournament.classList.remove('hidden');
					resultFieldTournament.textContent = "❌ Player names can only contain letters, numbers and underscores.";
				}
				return;
			}
		} else {
			console.log(`Input player${i} not found !`);
			return;
		}
	}
	startTournament(nbPlayers, event);
};

window.createCustomTournamentPage = async function (nbPlayers: number): Promise<void> {
	if (nbPlayers !== 4 && nbPlayers !== 8 && nbPlayers !== 16)
		return;
	const tournamentNbPlayerSelect = document.getElementById('tournamentNbPlayerSelect') as HTMLElement | null;
	const tournamentBuiltBlock = document.getElementById('tournamentBuiltBlock') as HTMLElement | null;
	const playerFieldsDiv = document.getElementById('playerFieldsDiv') as HTMLElement | null;
	if (!tournamentBuiltBlock || !tournamentNbPlayerSelect || !playerFieldsDiv) return;

	tournamentNbPlayerSelect.style.display = "none";
	tournamentBuiltBlock.style.display = "block";
	playerFieldsDiv.innerHTML = "";
	let loggedPlayerName;
	try 
	{
		const dataRequestResponse = await fetch('/profile/grab', {
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
				credentials: 'include',
		});
	
		if (!dataRequestResponse.ok) {
				const text = await dataRequestResponse.text().catch(() => dataRequestResponse.statusText);
				throw new Error(`Request failed: ${dataRequestResponse.status} ${text}`);
		}
		const result = await dataRequestResponse.json();	
		if (result)
			loggedPlayerName = result.name;
	} 
	catch (err) 
	{
		loggedPlayerName = "";
	}

	const nicknameDiv = document.createElement("div");
	const nicknameInput = document.createElement("input");
	const otherPlayersHeader = document.createElement("h1");
	if (loggedPlayerName)
		nicknameInput.setAttribute('placeholder', loggedPlayerName);
	else
		nicknameInput.setAttribute('placeholder', "Player_1");
	nicknameInput.setAttribute('id', "player1");
	nicknameInput.setAttribute('tabindex', `1`);
	nicknameInput.setAttribute('type', 'text');
	nicknameInput.setAttribute('autocomplete', 'off');
	nicknameInput.setAttribute('oninput', "this.value = this.value.replace(/[^A-Za-z0-9_]/g,'').slice(0,13)");
	nicknameInput.className = 'pb-2 w-[40%] mt-[1vw] ml-4 pl-5 mx-auto hover:text-[#98c6f8] focus:outline-none hover:border-[#3e64fa]-[35px] rounded-sm border border-[#3e64fa]';
	nicknameInput.setAttribute('autofocus', 'true');
	nicknameDiv.appendChild(nicknameInput);
	otherPlayersHeader.textContent = "Other participants names :"
	otherPlayersHeader.className = "mt-5"
	playerFieldsDiv.appendChild(nicknameDiv);
	playerFieldsDiv.appendChild(otherPlayersHeader);

	let i: number;
	for (i = 2; i <= nbPlayers; i++) {
		const listItem = document.createElement("input");
		listItem.setAttribute('id', "player" + `${i}`);
		listItem.setAttribute('placeholder', "Player_" + `${i}`);
		listItem.setAttribute('tabindex', `${i}`);
		listItem.setAttribute('type', 'text');
		listItem.setAttribute('autocomplete', 'off');
		listItem.setAttribute('oninput', "this.value = this.value.replace(/[^A-Za-z0-9_]/g,'').slice(0,13)");
		listItem.className = 'pb-2 w-[40%] mt-[1vw] ml-4 pl-5 mx-auto hover:text-[#98c6f8] focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]';
		playerFieldsDiv.appendChild(listItem);
	}

	const startTournamentBtnDiv = document.createElement("div");
	startTournamentBtnDiv.className = "mt-5";
	startTournamentBtnDiv.innerHTML = `<input tabindex=\"${i}\" class=\"shadow-[0_0_20px_rgba(158,202,237,0.9)] w-[20vw] mt-[1vw] h-[4vw] focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] border hover:border-[#98c6f8] border-white rounded-lg \" name=\"validatePlayerNameDiv\" type=\"submit\" value=\"Start\" onclick=\"validatePlayerNameFields(${nbPlayers} ,event)\">`;
	playerFieldsDiv.appendChild(startTournamentBtnDiv);

	const resultTextDiv = document.createElement("div");
	resultTextDiv.setAttribute('id', 'resultFieldTournament');
	resultTextDiv.className = "text-[#e85b51] mt-4 text-center w-[60%] mx-auto hidden";
	resultTextDiv.textContent = "Player names must be between 3 and 13 characters and can only contain letters, numbers and underscores.";
	playerFieldsDiv.appendChild(resultTextDiv);
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

window.ft_bh = function (): void {
	const bigMainTitle = document.getElementById('bigMainTitle') as HTMLElement | null;

	if (!bigMainTitle)
		return;
	if (!sessionStorage.getItem("secretfeature"))
		sessionStorage.setItem("secretfeature", "1");
	else
	{
		const nbClick = parseInt(window.sessionStorage.getItem('secretfeature') || '0');
			if (nbClick == 4)
			{
				bigMainTitle.textContent= "FT_BLACKHOLE";
				sessionStorage.setItem("secretfeature", "0");
				return ;
			}
			window.sessionStorage.setItem('secretfeature', String(nbClick + 1));
	}
};

window.saveProfileInfo = async function (): Promise<void> {
	const username = document.getElementById('newUsername') as HTMLInputElement | null;
	const fileInput = document.getElementById("myfileSelector") as HTMLInputElement | null;
	const userPfp = document.getElementById('userPfp') as HTMLImageElement | null;
	const selectedFileName = document.getElementById('selectedFileName') as HTMLElement | null;

	if (!username || !fileInput || !userPfp || !selectedFileName) return;

	const selectedFile = fileInput.files?.[0];

	if (!username.value && !selectedFile)
		return;

	if (username) {
		if (username.value && username.value.length < 3) {
			alertBoxMsg("❌ Username must be at least 3 characters !");
			username.focus();
			return;
		}
		if (username.value.length > 13) {
			alertBoxMsg("❌ New username is too long ! (13 max)");
			username.value = "";
			username.focus();
			return;
		}
		if (username.value === username.placeholder) {
			alertBoxMsg("❌ New username cannot be the same as the old one !");
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
