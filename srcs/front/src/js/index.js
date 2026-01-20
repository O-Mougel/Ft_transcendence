import versusAI from "../views/versusAI.js";
import playerBattle from "../views/playerBattle.js";
import startingFile from "../views/startingFile.js";
import aboutFile from "../views/aboutFile.js";
import customizeProfile from "../views/customizeProfile.js";
import profileStats from "../views/profileStats.js";
import setup2FA from "../views/setup2FA.js";
import tournamentSize from "../views/tournamentSize.js";
import newUserRegistration from "../views/newUserRegistration.js";
import pong from "../views/pong.js";
import logUser from "../views/login.js";
import tournament from "../views/tournament.js";
import page404 from "../views/404page.js";
import Login2fa from "../views/2faLogin.js";
import changePassword from "../views/changePassword.js";
import rankedLogin from "../views/rankedLogin.js";
import UserMatchHistory	from "../views/UserMatchHistory.js";

// stop pong game when navigating away from /pong
import { emitStopGame } from "../game/socket.js";
import { CONTEXT } from "../game/context.js";


import { displayCorrectErrMsg, isUserAllowedHere } from "./userLog.js";
import { fetchErrcodeHandler } from "./userLog.js";
import { alertBoxMsg } from "./userLog.js";

var profileRefresh;

const loadURL = url => {
	history.pushState(null, null, url);
	router();
}

const refreshProfile = () => {
	console.log("Tick tick tick ...");
}

window.confirmFriendRemoval = async () =>
{
	const friendRemover2000 = document.getElementById("selectBoxFriendRemover");

	if (!friendRemover2000 || friendRemover2000.value == "dummyvalue") // no friend selected
		return ;
	
	const data = {
		friendDeleteId: friendRemover2000.value,
	};

	// 	console.log("frienddeletename : ", friendRemover2000.value);
	// return ;
	try 
	{
		const removeFriendRequestResponse = await fetch('/friend/delete', {
			method: "DELETE",
			headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, 'Content-Type': 'application/json'},
			credentials: 'include',
			body: JSON.stringify(data),
		});
	
		if (!removeFriendRequestResponse.ok) {
				const text = await removeFriendRequestResponse.text().catch(() => removeFriendRequestResponse.statusText);
				throw new Error(`Request failed: ${removeFriendRequestResponse.status} ${text}`);
		}
		const result = await removeFriendRequestResponse.json();
		if (result)
		{
			console.log("✅ Removed friend");
			alertBoxMsg(`✅ Removed \"${result.removedName}\" from friends !`);
			grabUserStatsAndInfo();
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.confirmFriendRemoval());
		console.error('⚠️ Couldn\'t delete selected friend !\n => ', err);
		displayCorrectErrMsg(err, data.frienddeletename);
	}
}

window.fillFriendRemovalBox = async (friendArray) => 
{
	const friendRemover2000 = document.getElementById("selectBoxFriendRemover");
	
	if (!friendRemover2000 || !friendArray) return;
	friendRemover2000.innerHTML = '';

	var listItem = document.createElement("option");
	// listItem.className = 'py-2 flex items-center justify-between';
	listItem.innerHTML = '--Select a friend--';
	listItem.setAttribute('name', "dummyValueFriendDelete");
	listItem.setAttribute('value', 'dummyvalue');
	friendRemover2000.appendChild(listItem);
	for(let i = 0; i < friendArray.length; i++) 
	{
		var listItem = document.createElement("option");
		let	clearName = friendArray[i].name + "[deleteBox]";
		// listItem.className = 'py-2 flex items-center justify-between';
		listItem.innerHTML = `${friendArray[i].name}`; // TODO : special cases to handle
		listItem.setAttribute('name', clearName);
		listItem.setAttribute('value', `${friendArray[i].id}`);
		friendRemover2000.appendChild(listItem);
	}
}	

window.grabLoggedUserStats = async () => 
{
	const nbOfMatchCpt = document.getElementById("nbOfMatchCpt");
	const winRatioPercent = document.getElementById("winRatioPercent");
	const longestMatchCpt = document.getElementById("longestMatchCpt");
	const biggestStreakCpt = document.getElementById("biggestStreakCpt");

	if (!nbOfMatchCpt || !winRatioPercent || !longestMatchCpt || !biggestStreakCpt) return ;

	nbOfMatchCpt.innerHTML = "--";
	winRatioPercent.innerHTML = "--";
	longestMatchCpt.innerHTML = "--";
	biggestStreakCpt.innerHTML = "--";
	
	
	try 
	{
		const loggedUserStatsRequestResponse = await fetch('/match/self', {
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
		});
	
		if (!loggedUserStatsRequestResponse.ok) {
				const text = await loggedUserStatsRequestResponse.text().catch(() => loggedUserStatsRequestResponse.statusText);
				throw new Error(`Request failed: ${loggedUserStatsRequestResponse.status} ${text}`);
		}
		const result = await loggedUserStatsRequestResponse.json();
		if (result)
		{
			if (result.matchsnb == 0) // nomatches played
			{
				nbOfMatchCpt.innerHTML = "0";
				winRatioPercent.innerHTML = "--";
				longestMatchCpt.innerHTML = "--";
				biggestStreakCpt.innerHTML = "--";
			}
			else
			{
				nbOfMatchCpt.innerHTML = result.matchsnb;
				winRatioPercent.innerHTML = result.winrate + " %";
				longestMatchCpt.innerHTML = result.longestMatch + " sec";
				biggestStreakCpt.innerHTML = result.biggest_streak;
			}
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.grabLoggedUserStats());
		console.error('⚠️ Couldn\'t fetch logged user stats !\n => ', err);
	}
}

window.fetchPlayerStats = async (playerId, playerUsername) => 
{

	const nbOfMatchCpt2 = document.getElementById("nbOfMatchCpt2");
	const winRatioPercent2 = document.getElementById("winRatioPercent2");
	const longestMatchCpt2 = document.getElementById("longestMatchCpt2");
	const biggestStreakCpt2 = document.getElementById("biggestStreakCpt2");
	const friendStatDisplayBox = document.getElementById("friendStatDisplayBox");
	const selectedPlayerUsernameHeader = document.getElementById("selectedPlayerUsernameHeader");

	if (!playerId || !nbOfMatchCpt2 || !winRatioPercent2 || !longestMatchCpt2 || !biggestStreakCpt2 || !friendStatDisplayBox || !selectedPlayerUsernameHeader) return ;

	nbOfMatchCpt2.innerHTML = "--";
	winRatioPercent2.innerHTML = "--";
	longestMatchCpt2.innerHTML = "--";
	biggestStreakCpt2.innerHTML = "--";

	document.getElementById("selectedPlayerUsernameHeader").innerHTML = playerUsername + " 's stats :";
	
	try 
	{
		const userStatsRequestResponse = await fetch(`/match/${playerId}`, {
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
		});
	
		if (!userStatsRequestResponse.ok) {
				const text = await userStatsRequestResponse.text().catch(() => userStatsRequestResponse.statusText);
				throw new Error(`Request failed: ${userStatsRequestResponse.status} ${text}`);
		}
		const result = await userStatsRequestResponse.json();
		if (result)
		{
			if (result.matchsnb == 0) // nomatches played
			{
				nbOfMatchCpt2.innerHTML = "0";
				winRatioPercent2.innerHTML = "--";
				longestMatchCpt2.innerHTML = "--";
				biggestStreakCpt2.innerHTML = "--";
			}
			else
			{
				nbOfMatchCpt2.innerHTML = result.matchsnb;
				winRatioPercent2.innerHTML = result.winrate + " %";
				longestMatchCpt2.innerHTML = result.longestMatch + " sec";
				biggestStreakCpt2.innerHTML = result.biggest_streak;
			}
			friendStatDisplayBox.style.display = "flex";
			selectedPlayerUsernameHeader.style.display = "block";
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.fetchPlayerStats(playerId, playerUsername));
		console.error('⚠️ Couldn\'t fetch user stats in profileStat!\n => ', err);
	}
}

export const show2FAStatus = async () => 
{
	const showQRCodeButton = document.getElementById("showQRCodeButton");
	const TwoFACodeInput = document.getElementById("2FACodeInput");
	const qrCodeImage = document.getElementById("qrCodeImage");
	const TwoFAActivated = document.getElementById("2FAActivated");
	const TwoFADisabled = document.getElementById("2FADisabled");

	if (!TwoFADisabled || !TwoFAActivated || !qrCodeImage || !TwoFACodeInput || !showQRCodeButton) return ;

	try
	{
		const get2FAStatus = await fetch('/profile/2fa', {
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
		});

		if (!get2FAStatus.ok) {
				const text = await get2FAStatus.text().catch(() => get2FAStatus.statusText);
				throw new Error(`Request failed: ${get2FAStatus.status} ${text}`);
		}
		const result = await get2FAStatus.json();	
		if (result)
		{
			showQRCodeButton.disabled = false;
			TwoFACodeInput.value = "";
			qrCodeImage.src = "";
			qrCodeImage.style.display = "none";

			if (result.twofastatus == true)
			{
				console.log("2FA is activated !");
				TwoFAActivated.style.display = "flex";
				TwoFADisabled.style.display = "none";
			}
			else
			{
				console.log("2FA is disabled !");
				TwoFADisabled.style.display = "flex";
				TwoFAActivated.style.display = "none";
			}
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(show2FAStatus());
		console.error('⚠️ Failed to disable 2FA!\n => ', err);
	}

}

const createFriendsStatLink = async () => 
{
	
	const friendlistProfileParent = document.getElementById('friendlistProfileParent');
	const currentUser = document.getElementById('playerUsernameProfile');

	if (!friendlistProfileParent || !currentUser) return;

	try 
	{
		const friendLinkRequestResponse = await fetch('/friend', {
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
		});
	
		if (!friendLinkRequestResponse.ok) {
				const text = await friendLinkRequestResponse.text().catch(() => friendLinkRequestResponse.statusText);
				throw new Error(`Request failed: ${friendLinkRequestResponse.status} ${text}`);
		}
		const result = await friendLinkRequestResponse.json();	
		if (result)
		{
			friendlistProfileParent.innerHTML = '';
			if (result.friends.length)
			{
				for(let i = 0; i < result.friends.length; i++) 
				{
					var listItem = document.createElement("li");
					let	clearName = result.friends[i].name + "[userFriend]";
					listItem.className = 'w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg focus:border-[#98c6f8] hover:text-[#98c6f8] hover:border-[#98c6f8]';
					listItem.innerHTML = `${result.friends[i].name}`;
					listItem.setAttribute('name', clearName);
					listItem.setAttribute('onclick',`fetchPlayerStats("${result.friends[i].id}", "${result.friends[i].name}")`); // can be broken with weird names
					friendlistProfileParent.appendChild(listItem);
				}
			}
			else
			{
				var listItem = document.createElement("li");
				listItem.className = 'w-[60%] sm:w-[30%] flex items-center justify-center';
				listItem.innerHTML = 'No friends to display ! Try adding some !';
				friendlistProfileParent.appendChild(listItem);
			}
			grabLoggedUserStats();
			fillFriendRemovalBox(result.friends);
		}
		
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(createFriendsStatLink());
		console.error('⚠️ Couldn\'t recover user friendlist!\n => ', err);
	}
}

const grabUserStatsAndInfo = async () => 
{
	const playerUsernameProfile = document.getElementById('playerUsernameProfile');
	const userPfpProfile = document.getElementById('userPfpProfile');
	const selectedPlayerUsernameHeader = document.getElementById('selectedPlayerUsernameHeader');
	const friendStatDisplayBox = document.getElementById('friendStatDisplayBox');

	if (!playerUsernameProfile || !userPfpProfile || !selectedPlayerUsernameHeader || !friendStatDisplayBox) return;

	selectedPlayerUsernameHeader.style.display = "none";
	friendStatDisplayBox.style.display = "none";

	try 
	{
		const statsRequestResponse = await fetch('/profile/grab', {
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
		});
	
		if (!statsRequestResponse.ok) {
				const text = await statsRequestResponse.text().catch(() => statsRequestResponse.statusText);
				throw new Error(`Request failed: ${statsRequestResponse.status} ${text}`);
		}
		const result = await statsRequestResponse.json();	
		if (result)
		{
			
			const defaultAvatar = '/img/userPfp/default.png';
			userPfpProfile.onerror = () => {
			userPfpProfile.onerror = null;
			userPfpProfile.src = defaultAvatar;
			};
			userPfpProfile.src = result?.avatar || defaultAvatar;			
			playerUsernameProfile.innerHTML = "<u>" + result.name + "</u>";
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(grabUserStatsAndInfo());
		console.error('⚠️ Couldn\'t display user profile !\n => ', err);
	}
	createFriendsStatLink();
}

const grabCustomizationPageInfo = async () => 
{
	const newUsername = document.getElementById('newUsername');
	const profilePicture = document.getElementById('userPfp');

	if (!newUsername || !profilePicture) return;

	try 
	{
		const dataRequestResponse = await fetch('/profile/grab', { //GET request by default without the "request" parameter
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
		});
	
		if (!dataRequestResponse.ok) {
				const text = await dataRequestResponse.text().catch(() => dataRequestResponse.statusText);
				throw new Error(`Request failed: ${dataRequestResponse.status} ${text}`);
		}
		const result = await dataRequestResponse.json();	
		if (result)
		{
			
			const defaultAvatar = '/img/userPfp/default.png';
			profilePicture.onerror = () => {
			profilePicture.onerror = null;
			profilePicture.src = defaultAvatar;
			};
			profilePicture.src = result?.avatar || defaultAvatar;			
			newUsername.placeholder = result.name;
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(grabCustomizationPageInfo());
		console.error('⚠️ Couldn\'t grab user info!\n => ', err);
	}

}

const	navbarHiddenCheck = () => {

	const	logButton = document.getElementById('mainPageLoginButton');
	const	bar1 = document.getElementById('navBarHomeId');
	const	bar2 = document.getElementById('navBarModesId');
	const	bar3 = document.getElementById('navBarCupId');
	const	bar4 = document.getElementById('navBarAboutId');
	const	icon1 = document.getElementById('navBarHomeIconId');
	const	icon2 = document.getElementById('navBarModesIconId');
	const	icon3 = document.getElementById('navBarCupIconId');
	const	icon4 = document.getElementById('navBarAboutIconId');
	const	barProfile = document.getElementById('profileButton2');
	const	iconProfile = document.getElementById('profileButton');
	const	status = sessionStorage.getItem("logStatus");

	// console.trace("I am currently : ", status);
	if (status == "loggedOut")
	{
		if (bar1)
			bar1.style.display = 'none';
		if (bar2)
			bar2.style.display = 'none';
		if (bar3)
			bar3.style.display = 'none';
		if (bar4)
			bar4.style.display = 'none';
		if (icon1)
			icon1.style.display = 'none';
		if (icon2)
			icon2.style.display = 'none';
		if (icon3)
			icon3.style.display = 'none';
		if (icon4)
			icon4.style.display = 'none';
		if (barProfile)
			barProfile.disabled=true;
		if (iconProfile)
			iconProfile.disabled=true;
		if (!logButton) return;
		logButton.style.display = "inline";
	}
	else if (status == "loggedIn")
	{
		if (bar1)
			bar1.style.display = 'block';
		if (bar2)
			bar2.style.display = 'block';
		if (bar3)
			bar3.style.display = 'block';
		if (bar4)
			bar4.style.display = 'block';
		if (icon1)
			icon1.style.display = 'block';
		if (icon2)
			icon2.style.display = 'block';
		if (icon3)
			icon3.style.display = 'block';
		if (icon4)
			icon4.style.display = 'block';
		if (barProfile)
			barProfile.disabled=false;
		if (iconProfile)
			iconProfile.disabled=false;
		if (!logButton) return;
		logButton.style.display = "none";
	}
}

const hideProfileButtons = () => {
	const btsmall = document.getElementById('profileButton');
	const bt = document.getElementById('profileButton2');
	if (!bt && !btsmall) return ;

	bt.style.display = 'none';
	btsmall.style.display = 'none';
}



const newtabRelogFetch = async () => {
	try 
		{
			const newTabrefreshTokenResponse = await fetch('/login/refresh', {
					credentials: 'include',
					method:'POST'
			});
		
			if (!newTabrefreshTokenResponse.ok) {
					const text = await newTabrefreshTokenResponse.text().catch(() => newTabrefreshTokenResponse.statusText);
					throw new Error(`Request failed: ${newTabrefreshTokenResponse.status} ${text}`);
			}
			const result = await newTabrefreshTokenResponse.json();	
			if (result && result.newAccessToken) 
			{
				sessionStorage.setItem('access_token', result.newAccessToken); //grab new token
				sessionStorage.setItem('logStatus', 'loggedIn');
				// console.log("token after fech is : ", sessionStorage.getItem("access_token"));
				// console.log("logStatus after fech is : ", sessionStorage.getItem("logStatus"));
				console.info("Logged back in using refresh_token !");
			}
			else if (result)
			{
				console.log("A new tab was opened.");
				return ;
			}
			else
				throw new Error(`Token could not be generated !`);
		} 
		catch (err) 
		{
			console.info("Nuh uhhhhh !", err);
			window.sessionStorage.setItem('logStatus', 'loggedOut');
			// backToDefaultPage();
		}
}


const forceUserRelog = async () => {

	const view = new logUser();
	document.querySelector("#app").innerHTML = await view.getHTML();
	adjustNavbar("/logUser");
	if (typeof view.init === "function") {
		 await view.init();
	}
	history.pushState(null, null, "/logUser");
}


export const adjustNavbar = async (path) => {

	if (path === "/logUser" || (path === "/") || (path === "/404") || (path === "/newUserRegistration") || (path === "/2faLogin")) //no logging is required
	{
		//
	}
	else
	{
		const res = await isUserAllowedHere();
		if (res == 0) // not allowed
		{
			console.info("Forced relog!");
			await forceUserRelog();
		}
	}
	
	navbarHiddenCheck();
	if (path === "/customizeProfile")
	{
		hideProfileButtons();
		grabCustomizationPageInfo();
		// clearInterval(profileRefresh);
	}
	else if (path === "/profileStats")
	{
		hideProfileButtons();
		grabUserStatsAndInfo();
	}
	else if (path === "/setup2FA")
	{
		hideProfileButtons();
		show2FAStatus();
	}
	else
	{
		if(document.getElementById('profileButton2'))
			document.getElementById('profileButton2').style.display = 'flex';
		if(document.getElementById('profileButton'))
			document.getElementById('profileButton').style.display = 'flex';
		// clearInterval(profileRefresh);
		// profileRefresh = setInterval(refreshProfile, 50000);
	}

	//closes all opened panels when switching tabs
	const profilePanel = document.getElementById('profilePanel'); 
	if (profilePanel && profilePanel.style.display != "none")
		profilePanel.style.display = "none";

	const cb = document.getElementById('modListBox');
	if (cb)
		cb.checked = false;

	const cb2 = document.getElementById('modListBoxSmall');
	if (cb2)
		cb2.checked = false;
}

const attemptAutolog = async () => {
	await newtabRelogFetch();
	await router();
}

const router = async () => {
	const routes = [
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
		{ path: "/logUser", view: logUser },
		{ path: "/tournament", view: tournament },
		{ path: "/2faLogin", view: Login2fa },
		{ path: "/ranked", view: rankedLogin },
		{ path: "/changePassword", view: changePassword },
		{ path: "/UserMatchHistory", view: UserMatchHistory },
	];

	const potentialMan = routes.map(mapElement => { //mapElement is the name of each array element for routes
		return {
			mapElement : mapElement,
			isMatch: location.pathname === mapElement.path
		};
	});

	

	let match = potentialMan.find(pm => pm.isMatch); //pm is the name of each array element for potentialMan
	// find will stop when the function returns true, so when we find a pm.isMatch == true

	if (!match) // if no matches
	{
		match = {
			mapElement: routes[1], //defaults to 404
			isMatch: true
		};
	}

	const view = new match.mapElement.view();
	
	if(sessionStorage.getItem('pagehide') && sessionStorage.getItem('pagehide') === 'pageshouldreload')
	{
		sessionStorage.setItem('pagehide', 'pagehasreloaded');
		document.querySelector("#app").innerHTML = await new routes[0].view().getHTML();
		await adjustNavbar("/");
		return ;
	}
	document.querySelector("#app").innerHTML = await view.getHTML();
	await adjustNavbar(match.mapElement.path);
	if (typeof view.init === "function") {
		await view.init();
}

};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", async () => {
	document.addEventListener("click", element => {
		if (element.target.matches("[data-link]")){
			element.preventDefault();
			loadURL(element.target.href);
		}
	})
	console.group("Page loaded !");

	if (!(sessionStorage.getItem("logStatus")))
	{
		console.log("NULL O_O ! Setting to logged out");
		sessionStorage.setItem('logStatus','loggedOut');
	}
	else
		console.log("Grabbed status ! Current :",sessionStorage.getItem("logStatus"));
	console.groupEnd();
	await attemptAutolog();
});
