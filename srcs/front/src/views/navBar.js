import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Welcome !");
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
			<div class="h-[93%] w-full bg-[url(/img/plink.gif)] grow basis-full">
				
			</div>
		</div>`
	}
}