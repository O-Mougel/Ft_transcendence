
document.addEventListener("DOMContentLoaded", () => {
	document.addEventListener("click", element => {
		if (element.target.matches('#profileButton') || element.target.matches('#profileButton2'))
		{
			const panel = document.getElementById('profilePanel');
			if (!panel) return;
			panel.classList.toggle('hidden');
		}
	})
});


function reportWindowSize() {
	const panel = document.getElementById('profilePanel');
	if (!panel) return;
	var style = window.getComputedStyle(panel);
    if (style.display === 'none')
		return;
	panel.classList.toggle('hidden');
}

window.addEventListener("resize", reportWindowSize);

