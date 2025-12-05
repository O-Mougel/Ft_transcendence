import selectModes from "../views/selectModes.js";
import startingFile from "../views/startingFile.js";
import profileOverview from "../views/profileOverview.js";
import tournamentSize from "../views/tournamentSize.js";
import pong from "../views/pong.js";


const loadURL = url => {
	history.pushState(null, null, url);
	router();
}

const router = async () => {
	const routes = [
		{ path: "/", view: startingFile },
		{ path: "/modes", view: selectModes },
		{ path: "/profileOverview", view: profileOverview },
		{ path: "/tournament", view: tournamentSize },
		{ path: "/pong", view: pong },
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
