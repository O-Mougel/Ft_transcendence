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

var profileRefresh;

const loadURL = url => {
	history.pushState(null, null, url);
	router();
}

const refreshProfile = () => {
	console.log("Tick tick tick ...");
}
window.fetchPlayerStats = async (playerUsername) => 
{
	try 
	{
		const userStatsRequestResponse = await fetch('/friend/stats', {
				credentials: 'include',
		});
	
		if (!userStatsRequestResponse.ok) {
				const text = await userStatsRequestResponse.text().catch(() => userStatsRequestResponse.statusText);
				throw new Error(`Request failed: ${userStatsRequestResponse.status} ${text}`);
		}
		const result = await userStatsRequestResponse.json();	
		if (result)
		{
			console.log("Grabbed user stats !", result);
		}
	} 
	catch (err) 
	{
		console.error('User stats fetch failed in profileStat!\n => ', err);
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
					listItem.setAttribute('onclick',`fetchPlayerStats("${result.friends[i].name}")`);
					friendlistProfileParent.appendChild(listItem);
				}
			}
			else
			{
				var listItem = document.createElement("li");
				listItem.className = 'w-[45%] sm:w-[30%] flex items-center justify-center';
				listItem.innerHTML = 'No friends to display ! Try adding some !';
				friendlistProfileParent.appendChild(listItem);
			}
		}
		// fetchPlayerStats(currentUser.innerHTML);
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

	if (!playerUsernameProfile || !userPfpProfile) return;

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

const router = async () => {
	const routes = [
		{ path: "/", view: startingFile },
		{ path: "/versusAI", view: versusAI },
		{ path: "/playerBattle", view: playerBattle },
		{ path: "/about", view: aboutFile },
		{ path: "/customizeProfile", view: customizeProfile },
		{ path: "/profileStats", view: profileStats },
		{ path: "/setup2FA", view: setup2FA },
		{ path: "/tournament", view: tournamentSize },
		{ path: "/tournamentSelect_4Players", view: tournamentSelect4Players },
		{ path: "/tournamentSelect_8Players", view: tournamentSelect8Players },
		{ path: "/tournamentSelect_16Players", view: tournamentSelect16Players },
		{ path: "/newUserRegistration", view: newUserRegistration },
		{ path: "/pongAI", view: pong },
		{ path: "/pong", view: pong },
		{ path: "/pong2", view: pong },
		{ path: "/logUser", view: logUser },
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
			mapElement: routes[0], //defaults to / 
			isMatch: true
		};
	}

	const view = new match.mapElement.view();
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
