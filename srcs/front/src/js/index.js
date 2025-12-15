import versusAI from "../views/versusAI.js";
import playerBattle from "../views/playerBattle.js";
import startingFile from "../views/startingFile.js";
import aboutFile from "../views/aboutFile.js";
import profileOverview from "../views/profileOverview.js";
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

export const adjustNavbar = path => {

	const btsmall = document.getElementById('profileButton');
	const bt = document.getElementById('profileButton2');
	if (!bt && !btsmall) return;
	if (path == "/profileOverview")
	{
		bt.style.display = 'none';
		btsmall.style.display = 'none';
		clearInterval(profileRefresh);
	}
	else
	{
		bt.style.display = 'flex';
		btsmall.style.display = 'flex';
		clearInterval(profileRefresh);
		profileRefresh = setInterval(refreshProfile, 50000);
	}

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
		{ path: "/profileOverview", view: profileOverview },
		{ path: "/tournament", view: tournamentSize },
		{ path: "/tournamentSelect_4Players", view: tournamentSelect4Players },
		{ path: "/tournamentSelect_8Players", view: tournamentSelect8Players },
		{ path: "/tournamentSelect_16Players", view: tournamentSelect16Players },
		{ path: "/newUserRegistration", view: newUserRegistration },
		{ path: "/pong", view: pong },
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
			console.log(element.target.href);
			loadURL(element.target.href);
		}
	})
	router();
});
