import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Welcome !");
	}

	async getHTML() {
		return `
		<body class="">
			<div class="min-h-screen bg-[url(/img/loginUnblured.jpg)] bg-cover backdrop-blur-[10px] pt-15 text-center ml-auto mr-auto">
				<img class ="mx-auto mb-[75px]" id="logo" src="./img/sillyDog.gif">
				<form>
					<div class="content-center">
						<input tabindex="1" class="mx-auto text-white text-ellipsis w-1/2 md:w-1/4 h-[35px] text-sm md:text-base rounded-s border border-2 border-black pt-[8px] pb-[5px] pr-[20px] pl-[20px] mb-[25px]" name="playerUsername" value="" type="text" autofocus autocomplete="off" placeholder="Enter your login" aria-invalid>
					</div>
					<div class="content-center">
						<input tabindex="2" class="mx-auto text-white text-ellipsis w-1/2 md:w-1/4 h-[35px] text-sm md:text-base rounded-sm border border-2 border-black pt-[8px] pb-[5px] pr-[20px] pl-[20px] mb-[35px]" name="playerPassword" value="" type="text" autocomplete="off" placeholder="Enter your password" aria-invalid>
					</div>
					<div class="">
						<input tabindex="3" class="uppercase text-sm md:text-base xl:text-2xl text-ellipsis bg-blue-500 w-1/2 md:w-1/4 font-bold pt-[8px] pb-[8px] rounded-lg text-white" name="login" type="submit" value="Sign In">
					</div>
					<a href="/modes" data-link>Click for modes !</a>
				</form>
			</div>
			<script type="module" src="/js/index.js"></script>
		</body>`
	}
}