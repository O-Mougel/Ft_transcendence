import ViewTemplate from "./ViewTemplate.js";

export default class AboutFileView extends ViewTemplate {
	constructor() {
		super();
		this.setTitle("About");
	}

	async getHTML(): Promise<string> {
		return `
			<div id="profilePanel" class="hidden absolute animate-slide-in-left right-0 top-0 h-full min-w-80 w-[20%] bg-[url(/img/assets/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8] overflow-auto">
				<div class="flex flex-col text-center w-full h-full">
					<div class="grid h-[30%] place-items-center">
						<div id="sidePannelPfp" class="bg-[url('/img/userPfp/default.png')] bg-cover p-4 rounded-[50%] opacity-0 shadow object-cover sm:w-[170px] sm:h-[170px] md:w-[18vh] md:h-[18vh]"></div>
					</div>
					<h1 id="playerGrabbedUsername" class="text-black text-bold underline mx-4 mb-10 text-2xl lg:text-5xl "></h1>
					<a href="/profileStats" class="mx-4 text-2xl lg:text-4xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>View profile</a>
					<a href="/customizeProfile" class="mx-4 text-2xl lg:text-4xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>Update profile</a>
					<a id="logoutButton" class="mx-4 text-2xl lg:text-4xl mb-8 border p-4 cursor-pointer hover:text-[#dee9f4] hover:bg-[#882639] text-[#882639]" onclick=logoutUser() name="logoutButtonName">➜] Log out</a>
					<div class="self-start px-4 w-full">
						<input class="sr-only peer" id="friendCheck" type="checkbox"/>
						<label for="friendCheck" class="text-2xl lg:text-3xl cursor-pointer py-2 mb-10 select-none hover:text-[#98c6f8]">➤ Friend list</label>
						<ul class="select-none peer-checked:block hidden mt-3 ml-2 self-start text-left animate-slide-fade-up" id="friendlist"></ul>
					</div>
					<div id="pendingRequestBlock" class="w-full mt-8 lg:mt-15 px-4 hidden">
							<input class="sr-only peer" id="requestCheck" type="checkbox" />
							<label for="requestCheck" id="requestCheckLabel" class="text-xl lg:text-3xl cursor-pointer mt-10 px-3 py-2 select-none hover:text-[#98c6f8] ">
								► Requests
							</label>
							<ul id="requestList" class="select-none peer-checked:block hidden mt-3 self-start text-left animate-slide-fade-up"></ul>
					</div>
					<div class="w-full mt-3 px-4 flex">
						<div class="w-full ">
							<form class="flex items-center py-2 h-full w-full mt-5">
								<input id="friendSearchInput" type="text" placeholder="Add friend" maxlength="13" class="h-[70%] w-[80%] lg:text-3xl px-2 rounded-l-md border border-white bg-transparent focus:outline-none text-sm" />
								<button id="friendSearchButton" class=" h-[70%] w-[10%] bg-[#98c6f8] text-black rounded-r-md text-sm lg:text-3xl type="submit" onclick="sendNewFriendRequest(event)" >🔍</button>
							</form>
							<p id="friendSearchResults" class="mt-4 text-2xl text-red-500 text-ellipsis"></p>
						</div>
					</div>
				</div>
			</div>

			<div class="py-[3%] px-[2%] ">
				<h1 class="flex items-start text-amber-50">✦ Who made this website ?</h1>
				<div class="flex items-start w-full py-5 mb-4">
					<h2 id="aboutMembers" class="text-left w-full wrap-break-words pl-12 text-[#44494f]" onclick="sneakyClick()" >This project was made by lchapard, omougel, vdomasch, and bhumeau.</h2>
				</div>
				<h1 class="flex items-start text-amber-50">✦ Why the space theme ?</h1>
				<div class="flex items-start w-full py-5 mb-4">
					<h2 class="text-left w-full wrap-break-words text-[#44494f] pl-12">Because the blackhole was near, makes sense if you ask me</h2>
				</div>
				<h1 class="flex items-start text-amber-50">✦ Which framework was used ?</h1>
				<div class="flex items-start w-full py-5 mb-4">
					<h2 class="text-left w-full wrap-break-words text-[#44494f] pl-12">For the backend, we used Fastify and NodeJS for the framework.</h2>
				</div>
				<h1 class="flex items-start text-amber-50">✦ What about the database ?</h1>
				<div class="flex items-start w-full py-5 mb-4">
					<h2 class="text-left w-full wrap-break-words text-[#44494f] pl-12">We used SQlite for our database, and Prisma to perform operations on it.</h2>
				</div>
				<h1 class="flex items-start text-amber-50">✦ And the front ?</h1>
				<div class="flex items-start w-full py-5 mb-4">
					<h2 class="text-left w-full wrap-break-words text-[#44494f] pl-12">TypeScript and Tailwind CSS were both used for the design of this site.</h2>
				</div>
			</div>`;
	}
}
