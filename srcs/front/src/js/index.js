import versusAI from "../views/versusAI.js";
import playerBattle from "../views/playerBattle.js";
import startingFile from "../views/startingFile.js";
import aboutFile from "../views/aboutFile.js";
import customizeProfile from "../views/customizeProfile.js";
import profileStats from "../views/profileStats.js";
import setup2FA from "../views/setup2FA.js";
import tournamentSize from "../views/tournamentSize.js";
import tournamentSelect4Players from "../views/tournamentSelect_4Players.js";
import tournamentSelect8Players from "../views/tournamentSelect_8Players.js";
import tournamentSelect16Players from "../views/tournamentSelect_16Players.js";
import newUserRegistration from "../views/newUserRegistration.js";
import pong from "../views/pong.js";
import logUser from "../views/login.js";
import tournament from "../views/tournament.js";

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

	if (friendRemover2000.value == "dummyvalue") // no friend selected
		return ;
	
	const data = {
		frienddeletename: friendRemover2000.value,
	};

	// 	console.log("frienddeletename : ", friendRemover2000.value);
	// return ;
	try 
	{
		const removeFriendRequestResponse = await fetch('/friend/delete', {
			method: "DELETE",
			headers: { 'Content-Type': 'application/json' },
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
			grabUserStatsAndInfo();
		}
	} 
	catch (err) 
	{
		console.error('Friend remove fetch failed !\n => ', err);
	}
}

window.fillFriendRemovalBox = async (friendArray) => 
{
	const friendRemover2000 = document.getElementById("selectBoxFriendRemover");
	
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
		listItem.setAttribute('value', `${friendArray[i].name}`);
		friendRemover2000.appendChild(listItem);
	}
}	

window.grabLoggedUserStats = async () => 
{
	document.getElementById("nbOfMatchCpt").innerHTML = "0";
	document.getElementById("winRatioPercent").innerHTML = "0%";
	document.getElementById("longestMatchCpt").innerHTML = "0";
	document.getElementById("biggestStreakCpt").innerHTML = "0";
	
	try 
	{
		const loggedUserStatsRequestResponse = await fetch('/match/self', {
				credentials: 'include',
		});
	
		if (!loggedUserStatsRequestResponse.ok) {
				const text = await loggedUserStatsRequestResponse.text().catch(() => loggedUserStatsRequestResponse.statusText);
				throw new Error(`Request failed: ${loggedUserStatsRequestResponse.status} ${text}`);
		}
		const result = await loggedUserStatsRequestResponse.json();
		if (result)
		{
			document.getElementById("nbOfMatchCpt").innerHTML = result.matchsnb;
			document.getElementById("winRatioPercent").innerHTML = result.winrate + " %";
			document.getElementById("longestMatchCpt").innerHTML = result.longestMatch + " sec";
			document.getElementById("biggestStreakCpt").innerHTML = result.biggest_streak;
		}
	} 
	catch (err) 
	{
		console.error('Logged user stats fetch failed in profileStat!\n => ', err);
	}
}

window.fetchPlayerStats = async (playerUsername) => 
{
	document.getElementById("nbOfMatchCpt2").innerHTML = "--";
	document.getElementById("winRatioPercent2").innerHTML = "--";
	document.getElementById("longestMatchCpt2").innerHTML = "--";
	document.getElementById("biggestStreakCpt2").innerHTML = "--";

	document.getElementById("selectedPlayerUsernameHeader").innerHTML = playerUsername + " 's stats :";

	const data = {
		username: playerUsername,
	};
	
	try 
	{
		const userStatsRequestResponse = await fetch('/match/others', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(data),
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
				document.getElementById("nbOfMatchCpt2").innerHTML = "0";
				document.getElementById("winRatioPercent2").innerHTML = "--";
				document.getElementById("longestMatchCpt2").innerHTML = "--";
				document.getElementById("biggestStreakCpt2").innerHTML = "--";
			}
			else
			{
				document.getElementById("nbOfMatchCpt2").innerHTML = result.matchsnb;
				document.getElementById("winRatioPercent2").innerHTML = result.winrate + " %";
				document.getElementById("longestMatchCpt2").innerHTML = result.longestMatch + " sec";
				document.getElementById("biggestStreakCpt2").innerHTML = result.biggest_streak;
			}
			document.getElementById("friendStatDisplayBox").style.display = "flex";
			document.getElementById("selectedPlayerUsernameHeader").style.display = "block";
		}
	} 
	catch (err) 
	{
		console.error('User stats fetch failed in profileStat!\n => ', err);
	}
}

export const show2FAStatus = async () => 
{
	console.log("Showing 2FA status...");

	try
	{
		const get2FAStatus = await fetch('/profile/2fa', {
				credentials: 'include',
		});

		if (!get2FAStatus.ok) {
				const text = await get2FAStatus.text().catch(() => get2FAStatus.statusText);
				throw new Error(`Request failed: ${get2FAStatus.status} ${text}`);
		}
		const result = await get2FAStatus.json();	
		if (result)
		{
			codeResult.innerText = "";
			document.getElementById("showQRCodeButton").disabled = false;
			document.getElementById("2FACodeInput").value = "";
			document.getElementById("qrCodeImage").src = "";
			document.getElementById("qrCodeImage").style.display = "none";

			if (result.twofastatus == true)
			{
				console.log("2FA is activated !");
				document.getElementById("2FAActivated").style.display = "flex";
				document.getElementById("2FADisabled").style.display = "none";
			}
			else
			{
				console.log("2FA is disabled !");
				document.getElementById("2FADisabled").style.display = "flex";
				document.getElementById("2FAActivated").style.display = "none";
			}
		}
	} 
	catch (err) 
	{
		console.error('Failed to disable 2FA!\n => ', err);
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
					listItem.className = 'w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg';
					listItem.innerHTML = `${result.friends[i].name}`;
					listItem.setAttribute('name', clearName);
					listItem.setAttribute('onclick',`fetchPlayerStats("${result.friends[i].name}")`); // can be broken with weird names
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
		console.error('Friend info fetch failed in profileStat!\n => ', err);
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
			playerUsernameProfile.innerHTML = result.name;
		}
	} 
	catch (err) 
	{
		console.error('Profile custom grab failed !\n => ', err);
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
		console.error('Profile custom grab failed !\n => ', err);
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

	if (status == "loggedOut")
	{
		bar1.style.display = 'none';
		bar2.style.display = 'none';
		bar3.style.display = 'none';
		bar4.style.display = 'none';
		icon1.style.display = 'none';
		icon2.style.display = 'none';
		icon3.style.display = 'none';
		icon4.style.display = 'none';
		barProfile.disabled=true;
		iconProfile.disabled=true;
		if (!logButton) return;
		logButton.style.display = "inline";
	}
	else if (status == "loggedIn")
	{
		bar1.style.display = 'block';
		bar2.style.display = 'block';
		bar3.style.display = 'block';
		bar4.style.display = 'block';
		icon1.style.display = 'block';
		icon2.style.display = 'block';
		icon3.style.display = 'block';
		icon4.style.display = 'block';
		barProfile.disabled=false;
		iconProfile.disabled=false;
		if (!logButton) return;
		logButton.style.display = "none";
	}
}

export const adjustNavbar = path => {

	navbarHiddenCheck();
	const btsmall = document.getElementById('profileButton');
	const bt = document.getElementById('profileButton2');
	if (!bt && !btsmall) return ;
	if (path == "/customizeProfile")
	{
		bt.style.display = 'none';
		btsmall.style.display = 'none';
		// clearInterval(profileRefresh);
		grabCustomizationPageInfo();
	}
	else if (path == "/profileStats")
	{
		bt.style.display = 'none';
		btsmall.style.display = 'none';
		grabUserStatsAndInfo();
	}
	else if (path == "/setup2FA")
	{
		bt.style.display = 'none';
		btsmall.style.display = 'none';
		show2FAStatus();
	}
	else
	{
		bt.style.display = 'flex';
		btsmall.style.display = 'flex';
		// clearInterval(profileRefresh);
		// profileRefresh = setInterval(refreshProfile, 50000);
	}

	//closes all opened panels when switching tabs
	const profilePanel = document.getElementById('profilePanel'); 
	if (profilePanel)
		profilePanel.classList.toggle('hidden');

	const cb = document.getElementById('modListBox');
	if (cb)
		cb.checked = false;

	const cb2 = document.getElementById('modListBoxSmall');
	if (cb2)
		cb2.checked = false;
}

const pathToRegex = path =>
  new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "([^\\/]+)") + "$");

const getParams = match => {
  const values = match.result.slice(1);
  const keys = Array.from(match.mapElement.path.matchAll(/:(\w+)/g)).map(r => r[1]);
  return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
};


const router = async () => {
	const routes = [
		{ path: "/", view: startingFile },
		{ path: "/versusAI", view: versusAI },
		{ path: "/playerBattle", view: playerBattle },
		{ path: "/about", view: aboutFile },
		{ path: "/customizeProfile", view: customizeProfile },
		{ path: "/profileStats", view: profileStats },
		{ path: "/setup2FA", view: setup2FA },
		{ path: "/tournamentSize", view: tournamentSize },
		{ path: "/tournamentSelect_4Players", view: tournamentSelect4Players },
		{ path: "/tournamentSelect_8Players", view: tournamentSelect8Players },
		{ path: "/tournamentSelect_16Players", view: tournamentSelect16Players },
		{ path: "/newUserRegistration", view: newUserRegistration },
		{ path: "/pongAI", view: pong },
		{ path: "/pong", view: pong },
		{ path: "/pong2", view: pong },
		{ path: "/logUser", view: logUser },
		{ path: "/tournament/:id", view: tournament },
	];

	// const potentialMan = routes.map(mapElement => { //mapElement is the name of each array element for routes
	// 	return {
	// 		mapElement : mapElement,
	// 		isMatch: location.pathname === mapElement.path
	// 	};
	// });

	const potentialMan = routes.map(mapElement => {
		const regex = pathToRegex(mapElement.path);
		const result = location.pathname.match(regex);
		return {
			mapElement,
			result,
			isMatch: result !== null
		};
});


	let match = potentialMan.find(pm => pm.isMatch); //pm is the name of each array element for potentialMan
	// find will stop when the function returns true, so when we find a pm.isMatch == true

	if (!match) // if no matches
	{
		match = {
			mapElement: routes[0], //defaults to / 
			isMatch: true
		};
	}

	// const view = new match.mapElement.view();
	const params = getParams(match);
	const view = new match.mapElement.view(params);

	document.querySelector("#app").innerHTML = await view.getHTML();
	adjustNavbar(match.mapElement.path);
	if (typeof view.init === "function") {
 		await view.init();
}

};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
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
		window.sessionStorage.setItem('logStatus','loggedOut');
	}
	else
		console.log("Grabbed status ! Current :",sessionStorage.getItem("logStatus"));
	console.groupEnd();
	router();
});
