import versusAI from "../views/versusAI.js";
import playerBattle from "../views/playerBattle.js";
import startingFile from "../views/startingFile.js";
import profileOverview from "../views/profileOverview.js";
import tournamentSize from "../views/tournamentSize.js";


const loadURL = url => {
	history.pushState(null, null, url);
	router();
}

const adjustNavbar = path => {

	const btsmall = document.getElementById('profileButton');
	const bt = document.getElementById('profileButton2');

	if (!bt && !btsmall) return;
	if (path == "/profileOverview")
	{
		bt.style.display = 'none';
		btsmall.style.display = 'none';
	}
	else
	{
		bt.style.display = 'flex';
		btsmall.style.display = 'flex';
	}

	const profilePanel = document.getElementById('profilePanel'); 
	if (!profilePanel) return;
	profilePanel.classList.toggle('hidden');

	 const cb = document.getElementById('modListBox');
	 if (!cb) return;
	 cb.checked = false;
}

const router = async () => {
	const routes = [
		{ path: "/", view: startingFile },
		{ path: "/versusAI", view: versusAI },
		{ path: "/playerBattle", view: playerBattle },
		{ path: "/profileOverview", view: profileOverview },
		{ path: "/tournament", view: tournamentSize },
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
