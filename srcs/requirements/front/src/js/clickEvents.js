
document.addEventListener("DOMContentLoaded", () => {
	document.addEventListener("click", element => {
		if (element.target.matches('#profileButton'))
		{
			const panel = document.getElementById('profilePanel');
			if (!panel) return;
			panel.classList.toggle('hidden');
		}
	})
});