import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Select Tournament Size");
	}

	async getHTML() {
		return `

		<div class="h-screen w-screen flex flex-col">
			<ul class="flex w-full bg-[#302f2f] h-[7%]">
				<li class="flex items-center text-white bg-[#10732a] hover:bg-[#0a4a1b]"><a class="block p-5 m-[0px] h-full w-full" href="/" data-link>Home</a></li>
				<li class="flex items-center text-white bg-[#302f2f] hover:bg-[#1c1b1b]"><a class="block p-5 m-[0px] h-full w-full" href="/modes" data-link>Modes</a></li>
				<li class="flex items-center text-white bg-[#302f2f] hover:bg-[#1c1b1b]"><a class="block p-5 m-[0px] h-full w-full" href="/nav" data-link>Navbar</a></li>
				<li class="flex items-center text-white bg-[#302f2f] hover:bg-[#1c1b1b]"><a class="block p-5 m-[0px] h-full w-full" href="/" data-link>About</a></li>
				<li class="flex items-center text-white bg-[#302f2f] hover:bg-[#1c1b1b]"><a class="block p-5 m-[0px] h-full w-full" href="/tournament" data-link>Tournament</a></li>
			</ul>
			<div class="h-[93%] w-full grow basis-full bg-[url(/img/starField.gif)] bg-cover bg-center backdrop-blur-[10px] pt-35 text-center ml-auto mr-auto">
				<h1 class="text-white sm:text-2xl xl:text-3xl">Select the number of players in the tournament</h1>
				<div class="flex w-2/5 gap-5 justify-center mt-8 mx-auto flex-col sm:flex-row sm:w-4/5 sm:text-2xl xl:text-3xl">
					<div class="flex-1 min-w-0 flex items-center justify-center aspect-square px-4 py-2  text-white hover:text-[var(--white)] rounded-[10%] font-bold border-5 ">4</div>
					<div class="flex-1 min-w-0 flex items-center justify-center aspect-square px-4 py-2  text-white hover:text-[var(--white)] rounded-[10%] font-bold border-5 ">8</div>
					<div class="flex-1 min-w-0 flex items-center justify-center aspect-square px-4 py-2  text-white hover:text-[var(--white)] rounded-[10%] font-bold border-5 ">16</div>
				</div>
			</div>
		</div>`
	}
}