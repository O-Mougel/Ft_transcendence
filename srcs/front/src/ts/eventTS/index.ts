import versusAI from "../viewTS/versusAI.js";
import playerBattle from "../viewTS/playerBattle.js";
import startingFile from "../viewTS/startingFile.js";
import aboutFile from "../viewTS/aboutFile.js";
import customizeProfile from "../viewTS/customizeProfile.js";
import profileStats from "../viewTS/profileStats.js";
import setup2FA from "../viewTS/setup2FA.js";
import tournamentSize from "../viewTS/tournamentSize.js";
import newUserRegistration from "../viewTS/newUserRegistration.js";
import pong from "../viewTS/pong.js";
import logUser from "../viewTS/login.js";
import tournament from "../viewTS/tournament.js";
import page404 from "../viewTS/404page.js";
import Login2fa from "../viewTS/2faLogin.js";
import changePassword from "../viewTS/changePassword.js";
import rankedLogin from "../viewTS/rankedLogin.js";
import UserMatchHistory from "../viewTS/UserMatchHistory.js";

// stop pong game when navigating away from /pong
import { emitStopGame } from "../gameTS/socket.js";
import { CONTEXT } from "../gameTS/context.js";

import { displayCorrectErrMsg, isUserAllowedHere, fetchErrcodeHandler, alertBoxMsg, backToDefaultPage, attemptSocketConnection } from "./userLog.js";
import type { Friend, FriendsListResponse, MatchStats, UserProfile, FriendDeleteData, FriendRemoveResponse, RefreshTokenResponse } from "../types/api.types";
import { scales, Title } from "chart.js";

interface ViewClass {
	new(): ViewInstance;
}

interface ViewInstance {
	getHTML(): Promise<string>;
	init?(): Promise<void>;
}

interface Route {
	path: string;
	view: ViewClass;
}

interface RouteMatch {
	mapElement: Route;
	isMatch: boolean;
}

export {};
declare global {
  // allow using the global Chart (UMD) from CDN without TS errors
  var Chart: any;
}

// let profileRefresh: ReturnType<typeof setInterval> | undefined;

const loadURL = (url: string): void => {
	history.pushState(null, "", url);
	router();
};

// const refreshProfile = (): void => {
// 	console.log("Tick tick tick ...");
// };

window.confirmFriendRemoval = async (): Promise<void> => {
	const friendRemover2000 = document.getElementById("selectBoxFriendRemover") as HTMLSelectElement | null;

	if (!friendRemover2000 || friendRemover2000.value === "dummyvalue")
		return;

	const parsedID = parseInt(friendRemover2000.value);
	if (!parsedID)
		return;

	const data: FriendDeleteData = {
		friendDeleteId: parsedID,
	};

	try {
		const removeFriendRequestResponse = await fetch('/friend/delete', {
			method: "DELETE",
			headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(data),
		});

		if (!removeFriendRequestResponse.ok) {
			const text = await removeFriendRequestResponse.text().catch(() => removeFriendRequestResponse.statusText);
			throw new Error(`Request failed: ${removeFriendRequestResponse.status} ${text}`);
		}
		const result: FriendRemoveResponse = await removeFriendRequestResponse.json();
		if (result) {
			console.log("✅ Removed friend");
			alertBoxMsg(`✅ Removed \"${result.removedName}\" from friends !`);
			grabUserStatsAndInfo();
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return window.confirmFriendRemoval();
		console.error('⚠️ Couldn\'t delete selected friend !\n => ', err);
		displayCorrectErrMsg(err as Error);
	}
};

window.fillFriendRemovalBox = async (friendArray: Friend[]): Promise<void> => {
	const friendRemover2000 = document.getElementById("selectBoxFriendRemover") as HTMLSelectElement | null;

	if (!friendRemover2000 || !friendArray) return;
	friendRemover2000.innerHTML = '';

	const dummyItem = document.createElement("option");
	dummyItem.textContent = '--Select a friend--';
	dummyItem.setAttribute('name', "dummyValueFriendDelete");
	dummyItem.setAttribute('value', 'dummyvalue');
	friendRemover2000.appendChild(dummyItem);

	for (let i = 0; i < friendArray.length; i++) {
		const listItem = document.createElement("option");
		const clearName = friendArray[i].name + "[deleteBox]";
		listItem.textContent = `${friendArray[i].name}`;
		listItem.setAttribute('name', clearName);
		listItem.setAttribute('value', String(friendArray[i].id));
		friendRemover2000.appendChild(listItem);
	}
};

window.grabLoggedUserStats = async (): Promise<void> => {
	const longestMatchCpt = document.getElementById("longestMatchCpt") as HTMLElement | null;
	const biggestStreakCpt = document.getElementById("biggestStreakCpt") as HTMLElement | null;
	const winLossDoughnutChart = document.getElementById("winLossDoughnutChart") as HTMLCanvasElement | null;
	const winRatioBar = document.getElementById("winRatioBar") as HTMLCanvasElement | null;

	if (!longestMatchCpt || !biggestStreakCpt || !winLossDoughnutChart || !winRatioBar) return;

	longestMatchCpt.textContent = "--";
	biggestStreakCpt.textContent = "--";

	try {
		const loggedUserStatsRequestResponse = await fetch('/match/self', {
			credentials: 'include',
			headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
		});

		if (!loggedUserStatsRequestResponse.ok) {
			const text = await loggedUserStatsRequestResponse.text().catch(() => loggedUserStatsRequestResponse.statusText);
			throw new Error(`Request failed: ${loggedUserStatsRequestResponse.status} ${text}`);
		}
		const result: MatchStats = await loggedUserStatsRequestResponse.json();
		if (result) {
			if (result.matchsnb === 0) {
				longestMatchCpt.textContent = "--";
				biggestStreakCpt.textContent = "--";
			} else {
				longestMatchCpt.textContent = result.longestMatch + " sec";
				biggestStreakCpt.textContent = String(result.biggest_streak);
				new Chart(winLossDoughnutChart, {
					type: 'doughnut',
					data: {
						labels: ['Win', 'Loss'],
						datasets: [{
							label: ' ',
							data: [2, 3],
							backgroundColor: ['#4ac03d9f', '#c03d3d9f'],
							hoverBackgroundColor: ['#4ac03d9f', '#c03d3d9f']
						}]
					},
					options: {
						borderColor: 'none',
						
					},
				});
				new Chart(winRatioBar, {
					type: 'bar',
					data: {
						labels: ['Win Ratio'],
						datasets: [{
							label: 'Win Ratio %',
							data: [result.winrate],
							backgroundColor: '#4ac03d9f',
							hoverBackgroundColor: '#4ac03d9f'
						}]
					},
					options: {
						borderColor: 'none',
						scales: {
							y: {
								beginAtZero: true,
								min: 0,
								max: 100,
							}
						},
					},
				});
			}
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return window.grabLoggedUserStats();
		console.error('⚠️ Couldn\'t fetch logged user stats !\n => ', err);
	}
};
	
window.fetchPlayerStats = async (playerId: string, playerUsername: string): Promise<void> => {
	const nbOfMatchCpt2 = document.getElementById("nbOfMatchCpt2") as HTMLElement | null;
	const winRatioPercent2 = document.getElementById("winRatioPercent2") as HTMLElement | null;
	const longestMatchCpt2 = document.getElementById("longestMatchCpt2") as HTMLElement | null;
	const biggestStreakCpt2 = document.getElementById("biggestStreakCpt2") as HTMLElement | null;
	const friendStatDisplayBox = document.getElementById("friendStatDisplayBox") as HTMLElement | null;
	const selectedPlayerUsernameHeader = document.getElementById("selectedPlayerUsernameHeader") as HTMLElement | null;

	if (!playerId || !nbOfMatchCpt2 || !winRatioPercent2 || !longestMatchCpt2 || !biggestStreakCpt2 || !friendStatDisplayBox || !selectedPlayerUsernameHeader) return;

	nbOfMatchCpt2.textContent = "--";
	winRatioPercent2.textContent = "--";
	longestMatchCpt2.textContent = "--";
	biggestStreakCpt2.textContent = "--";

	selectedPlayerUsernameHeader.textContent = playerUsername + " 's stats :";

	try {
		const userStatsRequestResponse = await fetch(`/match/${playerId}`, {
			credentials: 'include',
			headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
		});

		if (!userStatsRequestResponse.ok) {
			const text = await userStatsRequestResponse.text().catch(() => userStatsRequestResponse.statusText);
			throw new Error(`Request failed: ${userStatsRequestResponse.status} ${text}`);
		}
		const result: MatchStats = await userStatsRequestResponse.json();
		if (result) {
			if (result.matchsnb === 0) {
				nbOfMatchCpt2.textContent = "0";
				winRatioPercent2.textContent = "--";
				longestMatchCpt2.textContent = "--";
				biggestStreakCpt2.textContent = "--";
			} else {
				nbOfMatchCpt2.textContent = String(result.matchsnb);
				winRatioPercent2.textContent = result.winrate + " %";
				longestMatchCpt2.textContent = result.longestMatch + " sec";
				biggestStreakCpt2.textContent = String(result.biggest_streak);
			}
			friendStatDisplayBox.style.display = "flex";
			selectedPlayerUsernameHeader.style.display = "block";
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return window.fetchPlayerStats(playerId, playerUsername);
		console.error('⚠️ Couldn\'t fetch user stats in profileStat!\n => ', err);
	}
};

export const show2FAStatus = async (): Promise<void> => {
	const showQRCodeButton = document.getElementById("showQRCodeButton") as HTMLButtonElement | null;
	const TwoFACodeInput = document.getElementById("2FACodeInput") as HTMLInputElement | null;
	const qrCodeImage = document.getElementById("qrCodeImage") as HTMLImageElement | null;
	const TwoFAActivated = document.getElementById("2FAActivated") as HTMLElement | null;
	const TwoFADisabled = document.getElementById("2FADisabled") as HTMLElement | null;

	if (!TwoFADisabled || !TwoFAActivated || !qrCodeImage || !TwoFACodeInput || !showQRCodeButton) return;

	try {
		const get2FAStatus = await fetch('/profile/2fa', {
			credentials: 'include',
			headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
		});

		if (!get2FAStatus.ok) {
			const text = await get2FAStatus.text().catch(() => get2FAStatus.statusText);
			throw new Error(`Request failed: ${get2FAStatus.status} ${text}`);
		}
		const result: UserProfile = await get2FAStatus.json();
		if (result) {
			showQRCodeButton.disabled = false;
			TwoFACodeInput.value = "";
			qrCodeImage.src = "";
			qrCodeImage.style.display = "none";

			if (result.twofastatus === true) {
				console.log("2FA is activated !");
				TwoFAActivated.style.display = "flex";
				TwoFADisabled.style.display = "none";
			} else {
				console.log("2FA is disabled !");
				TwoFADisabled.style.display = "flex";
				TwoFAActivated.style.display = "none";
			}
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return show2FAStatus();
		console.error('⚠️ Failed to display 2FA status!\n => ', err);
	}
};

const createFriendsStatLink = async (): Promise<void> => {
	const friendlistProfileParent = document.getElementById('friendlistProfileParent') as HTMLElement | null;
	const currentUser = document.getElementById('playerUsernameProfile') as HTMLElement | null;

	if (!friendlistProfileParent || !currentUser) return;

	try {
		const friendLinkRequestResponse = await fetch('/friend', {
			credentials: 'include',
			headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
		});

		if (!friendLinkRequestResponse.ok) {
			const text = await friendLinkRequestResponse.text().catch(() => friendLinkRequestResponse.statusText);
			throw new Error(`Request failed: ${friendLinkRequestResponse.status} ${text}`);
		}
		const result: FriendsListResponse = await friendLinkRequestResponse.json();
		if (result) {
			friendlistProfileParent.innerHTML = '';
			if (result.friends.length) {
				for (let i = 0; i < result.friends.length; i++) {
					const listItem = document.createElement("li");
					const clearName = result.friends[i].name + "[userFriend]";
					listItem.className = 'w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg focus:border-[#98c6f8] hover:text-[#98c6f8] hover:border-[#98c6f8]';
					listItem.textContent = `${result.friends[i].name}`;
					listItem.setAttribute('name', clearName);
					listItem.setAttribute('onclick', `fetchPlayerStats("${result.friends[i].id}", "${result.friends[i].name}")`);
					friendlistProfileParent.appendChild(listItem);
				}
			} else {
				const listItem = document.createElement("li");
				listItem.className = 'w-[60%] sm:w-[30%] flex items-center justify-center';
				listItem.textContent = 'No friends to display !';
				const friendRemoverBoxDiv = document.getElementById("removeFriendBoxDiv") as HTMLSelectElement | null;
				if (friendRemoverBoxDiv)
					friendRemoverBoxDiv.style.display = "none";
				friendlistProfileParent.appendChild(listItem);
			}
			window.grabLoggedUserStats();
			window.fillFriendRemovalBox(result.friends);
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return createFriendsStatLink();
		console.error('⚠️ Couldn\'t recover user friendlist!\n => ', err);
	}
};

const grabUserStatsAndInfo = async (): Promise<void> => {
	const playerUsernameProfile = document.getElementById('playerUsernameProfile') as HTMLElement | null;
	const userPfpProfile = document.getElementById('userPfpProfile') as HTMLImageElement | null;
	const selectedPlayerUsernameHeader = document.getElementById('selectedPlayerUsernameHeader') as HTMLElement | null;
	const friendStatDisplayBox = document.getElementById('friendStatDisplayBox') as HTMLElement | null;

	if (!playerUsernameProfile || !userPfpProfile || !selectedPlayerUsernameHeader || !friendStatDisplayBox) return;

	selectedPlayerUsernameHeader.style.display = "none";
	friendStatDisplayBox.style.display = "none";

	try {
		const statsRequestResponse = await fetch('/profile/grab', {
			credentials: 'include',
			headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
		});

		if (!statsRequestResponse.ok) {
			const text = await statsRequestResponse.text().catch(() => statsRequestResponse.statusText);
			throw new Error(`Request failed: ${statsRequestResponse.status} ${text}`);
		}
		const result: UserProfile = await statsRequestResponse.json();
		if (result) {
			const defaultAvatar = '/img/userPfp/default.png';
			userPfpProfile.onerror = () => {
				userPfpProfile.onerror = null;
				userPfpProfile.src = defaultAvatar;
			};
			userPfpProfile.src = result?.avatar || defaultAvatar;
			userPfpProfile.style.display = "block";
			playerUsernameProfile.textContent = result.name;
			playerUsernameProfile.style.display = "inline";
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return grabUserStatsAndInfo();
		console.error('⚠️ Couldn\'t display user profile !\n => ', err);
	}
	createFriendsStatLink();
};

const grabCustomizationPageInfo = async (): Promise<void> => {
	const newUsername = document.getElementById('newUsername') as HTMLInputElement | null;
	const profilePicture = document.getElementById('userPfp') as HTMLImageElement | null;

	if (!newUsername || !profilePicture) return;

	try {
		const dataRequestResponse = await fetch('/profile/grab', {
			credentials: 'include',
			headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
		});

		if (!dataRequestResponse.ok) {
			const text = await dataRequestResponse.text().catch(() => dataRequestResponse.statusText);
			throw new Error(`Request failed: ${dataRequestResponse.status} ${text}`);
		}
		const result: UserProfile = await dataRequestResponse.json();
		if (result) {
			const defaultAvatar = '/img/userPfp/default.png';
			profilePicture.onerror = () => {
				profilePicture.onerror = null;
				profilePicture.src = defaultAvatar;
			};
			profilePicture.src = result?.avatar || defaultAvatar;
			newUsername.placeholder = result.name;
		}
	} catch (err) {
		if (await fetchErrcodeHandler(err as Error) === 0)
			return grabCustomizationPageInfo();
		console.error('⚠️ Couldn\'t grab user info!\n => ', err);
	}
};

const navbarHiddenCheck = (): void => {
	const logButton = document.getElementById('mainPageLoginButton') as HTMLButtonElement | null;
	const bar1 = document.getElementById('navBarHomeId') as HTMLElement | null;
	const bar2 = document.getElementById('navBarModesId') as HTMLElement | null;
	const bar3 = document.getElementById('navBarCupId') as HTMLElement | null;
	const bar4 = document.getElementById('navBarAboutId') as HTMLElement | null;
	const icon1 = document.getElementById('navBarHomeIconId') as HTMLElement | null;
	const icon2 = document.getElementById('navBarModesIconId') as HTMLElement | null;
	const icon3 = document.getElementById('navBarCupIconId') as HTMLElement | null;
	const icon4 = document.getElementById('navBarAboutIconId') as HTMLElement | null;
	const barProfile = document.getElementById('profileButton2') as HTMLButtonElement | null;
	const iconProfile = document.getElementById('profileButton') as HTMLButtonElement | null;
	const status = sessionStorage.getItem("logStatus");

	if (status === "loggedOut") {
		if (bar1) bar1.style.display = 'none';
		if (bar2) bar2.style.display = 'none';
		if (bar3) bar3.style.display = 'none';
		if (bar4) bar4.style.display = 'none';
		if (icon1) icon1.style.display = 'none';
		if (icon2) icon2.style.display = 'none';
		if (icon3) icon3.style.display = 'none';
		if (icon4) icon4.style.display = 'none';
		if (barProfile) barProfile.disabled = true;
		if (iconProfile) iconProfile.disabled = true;
		if (!logButton) return;
		logButton.style.display = "inline";
	} else if (status === "loggedIn") {
		if (bar1) bar1.style.display = 'block';
		if (bar2) bar2.style.display = 'block';
		if (bar3) bar3.style.display = 'block';
		if (bar4) bar4.style.display = 'block';
		if (icon1) icon1.style.display = 'block';
		if (icon2) icon2.style.display = 'block';
		if (icon3) icon3.style.display = 'block';
		if (icon4) icon4.style.display = 'block';
		if (barProfile) barProfile.disabled = false;
		if (iconProfile) iconProfile.disabled = false;
		if (!logButton) return;
		logButton.style.display = "none";
	}
};

const hideProfileButtons = (): void => {
	const btsmall = document.getElementById('profileButton') as HTMLElement | null;
	const bt = document.getElementById('profileButton2') as HTMLElement | null;
	if (!bt && !btsmall) return;

	if (bt) bt.style.display = 'none';
	if (btsmall) btsmall.style.display = 'none';
};

const newtabRelogFetch = async (): Promise<void> => {
	try {
		const newTabrefreshTokenResponse = await fetch('/login/refresh', {
			credentials: 'include',
			method: 'POST'
		});

		if (!newTabrefreshTokenResponse.ok) {
			const text = await newTabrefreshTokenResponse.text().catch(() => newTabrefreshTokenResponse.statusText);
			throw new Error(`Request failed: ${newTabrefreshTokenResponse.status} ${text}`);
		}
		const result: RefreshTokenResponse | null = await newTabrefreshTokenResponse.json();
		if (result && result.newAccessToken) {
			sessionStorage.setItem('access_token', result.newAccessToken);
			sessionStorage.setItem('logStatus', 'loggedIn');
			console.info("Logged back in using refresh_token !");
		} else if (result) {
			console.log("A new tab was opened.");
			return;
		} else {
			throw new Error(`Token could not be generated !`);
		}
	} catch (err) {
		window.sessionStorage.setItem('logStatus', 'loggedOut');
	}
};

const forceUserRelog = async (): Promise<void> => {
	const view = new logUser();
	const appElement = document.querySelector("#app") as HTMLElement | null;
	if (appElement) {
		appElement.innerHTML = await view.getHTML();
	}
	adjustNavbar("/logUser");
	if (typeof view.init === "function") {
		await view.init();
	}
	history.pushState(null, "", "/logUser");
};

export const adjustNavbar = async (path: string): Promise<void> => {
	if (path === "/logUser" || path === "/" || path === "/404" || path === "/newUserRegistration" || path === "/2faLogin") {
		// no logging required
	} else {
		const res = await isUserAllowedHere();
		if (res === 0) {
			console.info("Forced relog!");
			await forceUserRelog();
		}
	}

	navbarHiddenCheck();
	if (path === "/customizeProfile") {
		hideProfileButtons();
		grabCustomizationPageInfo();
	} else if (path === "/profileStats") {
		hideProfileButtons();
		grabUserStatsAndInfo();
	} else if (path === "/setup2FA") {
		hideProfileButtons();
		show2FAStatus();
	} else {
		const profileBtn2 = document.getElementById('profileButton2') as HTMLElement | null;
		const profileBtn = document.getElementById('profileButton') as HTMLElement | null;
		if (profileBtn2) profileBtn2.style.display = 'flex';
		if (profileBtn) profileBtn.style.display = 'flex';
	}

	// closes all opened panels when switching tabs
	const profilePanel = document.getElementById('profilePanel') as HTMLElement | null;
	if (profilePanel && profilePanel.style.display !== "none")
		profilePanel.style.display = "none";

	const cb = document.getElementById('modListBox') as HTMLInputElement | null;
	if (cb) cb.checked = false;

	const cb2 = document.getElementById('modListBoxSmall') as HTMLInputElement | null;
	if (cb2) cb2.checked = false;
};

const attemptAutolog = async (): Promise<void> => {
	if (sessionStorage.getItem('pagehide') !== 'pageshouldreload')
		await newtabRelogFetch();
	else
	{
		if (sessionStorage.getItem('logStatus') == "loggedOut")
			return (await router());
		if (await attemptSocketConnection() == false)
		{
			alertBoxMsg("❌ Connection to socket could not be established !");
			backToDefaultPage();
			//refresh token and retry
			return ;
		}
	}
	await router();
};

const router = async (): Promise<void> => {
	const routes: Route[] = [
		{ path: "/", view: startingFile },
		{ path: "/404", view: page404 },
		{ path: "/versusAI", view: versusAI },
		{ path: "/playerBattle", view: playerBattle },
		{ path: "/about", view: aboutFile },
		{ path: "/customizeProfile", view: customizeProfile },
		{ path: "/profileStats", view: profileStats },
		{ path: "/setup2FA", view: setup2FA },
		{ path: "/tournamentSize", view: tournamentSize },
		{ path: "/newUserRegistration", view: newUserRegistration },
		{ path: "/pongAI", view: pong },
		{ path: "/pong", view: pong },
		{ path: "/pong2", view: pong },
		{ path: "/pongRanked", view: pong },
		{ path: "/pongTournament", view: pong },
		{ path: "/logUser", view: logUser },
		{ path: "/tournament", view: tournament },
		{ path: "/2faLogin", view: Login2fa },
		{ path: "/ranked", view: rankedLogin },
		{ path: "/changePassword", view: changePassword },
		{ path: "/UserMatchHistory", view: UserMatchHistory },
	];

	const potentialMan: RouteMatch[] = routes.map(mapElement => {
		return {
			mapElement: mapElement,
			isMatch: location.pathname === mapElement.path
		};
	});

	let match = potentialMan.find(pm => pm.isMatch);

	if (!match) {
		match = {
			mapElement: routes[1], // defaults to 404
			isMatch: true
		};
	}

	if (CONTEXT.isGameStarted || CONTEXT.gameId) {
		CONTEXT.isGameStarted = false;
		CONTEXT.gameId = null;
		emitStopGame();
	}

	if (match && match.mapElement.path === "/tournamentSize" && CONTEXT.tournamentId) {
		const tournamentRoute = routes.find(r => r.path === "/tournament");
		if (tournamentRoute) match.mapElement = tournamentRoute;
	}

	const view = new match.mapElement.view();

	if (sessionStorage.getItem('pagehide') && sessionStorage.getItem('pagehide') === 'pageshouldreload') {
		sessionStorage.setItem('pagehide', 'pagehasreloaded');
	}

	const appElement = document.querySelector("#app") as HTMLElement | null;
	if (appElement) {
		appElement.innerHTML = await view.getHTML();
	}
	await adjustNavbar(match.mapElement.path);
	if (typeof view.init === "function") {
		await view.init();
	}
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", async (): Promise<void> => {
	document.addEventListener("click", (element: MouseEvent): void => {
		const target = element.target as HTMLElement;
		if (target.matches("[data-link]")) {
			element.preventDefault();
			const anchor = target as HTMLAnchorElement;
			loadURL(anchor.href);
		}
	});
	console.group("Page loaded !");

	if (!sessionStorage.getItem("f5WasPressed"))
		sessionStorage.setItem('f5WasPressed', 'false');
	if (!sessionStorage.getItem("logStatus")) {
		sessionStorage.setItem('logStatus', 'loggedOut');
		console.log("logStatus unknown ! Now set to \"loggedOut\"");
	} else {
		console.log("Grabbed status ! Current :", sessionStorage.getItem("logStatus"));
	}
	console.groupEnd();
	await attemptAutolog();
});
