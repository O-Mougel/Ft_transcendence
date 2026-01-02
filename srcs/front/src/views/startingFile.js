import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Welcome !");
	}

	async getHTML() {
		return `
			<div id="profilePanel" class="flex absolute right-0 top-0 h-full min-w-80 w-[20%] bg-[url(/img/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8] overflow-auto">
				<div class="flex flex-col text-center w-full h-full">
					<div class="grid h-[30%] place-items-center">
  						<div id="sidePannelPfp" class="bg-[url(/img/sillyDog.gif)] bg-cover p-4 rounded-[50%] opacity-0 shadow object-cover w-[170px] h-[170px]"></div>
					</div>
					<h1 id="playerGrabbedUsername" class="text-black text-bold mx-4 mb-15 text-2xl ">[username]</h1>
					<a href="/profileStats" class="mx-4 text-2xl mb-5 border p-4 text-[#798490]" name="profileLink" data-link>View my profile</a>
					<a href="/profileOverview" class="mx-4 text-2xl mb-5 border p-4 text-[#798490]" name="profileLink" data-link>Update profile</a>
					<a id="logoutButton" class="mx-4 text-2xl mb-15 border p-4 cursor-pointer hover:text-[#dee9f4] hover:bg-[#882639] text-[#882639]" onclick=logoutUser() name="logoutButtonName">➜] Log out</a>
					<div class="self-start">
						<input class="sr-only peer" id="friendCheck" type="checkbox"/>
						<label for="friendCheck" class="text-2xl cursor-pointer px-3 py-2 select-none hover:text-[#98c6f8]">► Online friends</label>
						<ul class="select-none peer-checked:block hidden mt-3 self-start text-left" id="friendlist">
							<li><a class="text-xl pl-2">• Goug ?</a></li>
						</ul>
					</div>
					<div class="w-full mt-3 px-4 flex">
                        <div class="w-[85%] max-w-60">
                            <div class="flex items-center">
                                <input id="friendSearchInput" type="text" placeholder="Add friend" class="w-1/4 h-8 px-2 rounded-l-md border border-white bg-transparent text-white focus:outline-none text-sm" />
                                <button id="friendSearchButton" class="w-1/4 h-8 bg-[#98c6f8] text-black rounded-r-md text-sm" onclick=sendNewFriendRequest()>🔍</button>
							</div>
							<p id="friendSearchResults" class="mt-4 text-base text-ellipsis"></p>
                        </div>
                    </div>
				</div>
			</div>
			<div class="pt-[5vw] h-full w-full">
				<h1 class="text-[4vw] my-6 2xl:text-6xl">FT_Transcendence</h1>
				<div class=" w-full h-[25%] my-15 content-center m-auto">
					<img src="/img/love-star.png" class="block w-[20%] m-auto mb-15 aspect-square" >
					<a id="mainPageLoginButton" href="/logUser" class="hidden uppercase text-sm md:text-base xl:text-2xl text-white focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis w-1/2 md:w-1/4 border hover:border-[#98c6f8] border-white py-2 px-4 rounded-lg shadow-[0_0_20px_rgba(158,202,237,0.9)]" name="logPageLink" data-link> 🚀 Sign in </a>
				</div>
			</div>`
	}
}