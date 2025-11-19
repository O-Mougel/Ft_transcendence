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
				<li class="flex items-center text-white bg-[#10732a] hover:bg-[#0a4a1b]"><a class="block p-5 m-0 h-full w-full" href="/" data-link>Home</a></li>
				<li class="flex items-center text-white bg-[#302f2f] hover:bg-[#1c1b1b]"><a class="block p-5 m-0 h-full w-full" href="/modes" data-link>Modes</a></li>
				<li class="flex items-center text-white bg-[#302f2f] hover:bg-[#1c1b1b]"><a class="block p-5 m-0 h-full w-full" href="/nav" data-link>Navbar</a></li>
				<li class="flex items-center text-white bg-[#302f2f] hover:bg-[#1c1b1b]"><a class="block p-5 m-0 h-full w-full" href="/" data-link>About</a></li>
				<input id="profileButton" type="button" value="Profile" class="flex items-center text-white bg-[#302f2f] hover:bg-[#1c1b1b] ml-auto p-5 m-0" />
			</ul>
			<div class="relative h-[93%] w-full bg-gray-700 grow basis-full">
				<div id="profilePanel" class="flex absolute right-0 top-0 h-full w-[15%] bg-[#897777] z-50 items-center justify-center">
                    GougouGaga ?
                </div>
                <div class="p-4">

                </div>
			</div>
		</div>`
	}
}