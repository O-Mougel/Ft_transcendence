
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('profileButton');
  const panel = document.getElementById('profilePanel');
  if (!btn || !panel) return;


 panel.classList.toggle('hidden');
 
  btn.addEventListener('click', (e) => {
    panel.classList.toggle('hidden');
  });
});