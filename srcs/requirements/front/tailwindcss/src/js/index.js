const router = async () => {
	const routes = [
		{ path: "/", view: () => console.log("In root !") },
		{ path: "/modes", view: () => console.log("Selecting modes !") },
	];

	const potentialMan = routes.map(route => {
		return {
			route : route,
			isMatch: location.pathname === route.path
		};
	});
	console.log(potentialMan);
};

document.addEventListener("DOMContentLoaded", () => {
	router();
});