require("dotenv").config();
const token = process.env.TELEGRAM_TOKEN;
let TelegramBot = require("node-telegram-bot-api");
let bot = new TelegramBot(token, { polling: true });
const TikTokNoWatermark = require("tiktok-no-watermark-api");

const loadingMessage = "⏳";
bot.setMyCommands([
	{ command: "video", description: "Download Video Without watermark ❤" },
	{ command: "audio", description: "Coming Soon ❤" },
	{ command: "cover", description: "Coming Soon ❤" },
	{ command: "profile", description: "Coming Soon ❤" },
	{ command: "details", description: "Coming Soon ❤" },
]);

const contact = `[MOLTEN](https://t.me/molten_01)`;
const introductionMessage = `
		🎉🌟 **Welcome to the TikTok Video Bot!** 📹🤖
		
		Send me a TikTok video URL, and I will provide you with various options for downloading media:
		
		Simply paste the TikTok URL, and I'll take care of the rest! ⚡️
		
		*Note* that this is still under development. 🚧 Thank you. If you encounter any errors, please report them to *@molten_01* 🛠️
		
		*Developed by:* ${contact}!`;

const facingErrorWithArtSign = `
Sorry, the video can't start with **@**. Please send us the actual video 🎥 link 🔗.\
Message me if you encounter any errors ${contact}`;
async function fetchTikTokNoWatermark(url, hasWatermark) {
	try {
		const response = await TikTokNoWatermark(url, hasWatermark);
		return response;
	} catch (error) {
		return error;
	}
}

bot.on("message", async (msg) => {
	const chatId = msg.chat.id;
	console.log(`Chat ID: ${chatId} had joined now!`);
	const tiktokUrlRegex =
		/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/(@[\w.-]+\/video\/(\d+))/i;
	const tiktokShortUrlRegex =
		/^https?:\/\/(?:www\.)?vm\.tiktok\.com\/([^\s/]+)/;

	const startsWithAt = msg.text.startsWith("@");
	console.log(startsWithAt);

	const match =
		msg.text.match(tiktokUrlRegex) || msg.text.match(tiktokShortUrlRegex);

	if (msg.text && msg.text.toLowerCase() === "/start") {
		bot.sendMessage(chatId, introductionMessage, {
			parse_mode: "Markdown",
		});
	} else if (match) {
		const sentMessage = await bot.sendMessage(chatId, loadingMessage);
		const tiktokUrl = match[0];

		fetchTikTokNoWatermark(tiktokUrl, true)
			.then((res) => {
				console.log("TikTok Video without Watermark:", res);

				const responseData = res.result.details;
				const likes = responseData.total_likes;
				const desc = responseData.desc;
				const views = responseData.total_views;
				const comment = responseData.total_comment;
				const share = responseData.total_share;
				const videoUrl = responseData.video_url;
				const trimmedUrl = videoUrl.trim() + ".mp4";
				bot.deleteMessage(chatId, sentMessage.message_id);
				const fileOptions = {
					width: res.result.details.width,
					height: res.result.details.height,
					thumbnail: res.result.details.cover,
					contentType: "video/mp4",
					filename: `tiktok_video_videoId.mp4`,
				};
				bot.sendVideo(
					chatId,
					trimmedUrl,
					{
						caption: `Description: ${desc} 

\ Total Likes 👍: ${likes}
\ Total Views 👀: ${views}
\ Total Comment 💬: ${comment}
\ Total Share 🚀: ${share}
`,
					},
					fileOptions
				);
			})
			.catch((err) => {
				console.log(
					"Error fetching TikTok video without watermark:",
					err
				);
			});
	} else if (startsWithAt) {
		await bot.sendMessage(
			chatId,
			facingErrorWithArtSign,

			{ parse_mode: "Markdown" }
		);
		await bot.sendMessage(chatId, "😐");
	} else {
		const sentMessage = await bot.sendMessage(chatId, loadingMessage);
		console.log("Loading Emoji sent!");
		await bot.deleteMessage(chatId, sentMessage.message_id);
		console.log("Loading Emoji deleted successfully!");
		await bot.sendMessage(
			chatId,
			`Error Extracting Data 😟 from: **${msg.text}**

Is not a valid Tiktok Link 🔗.

Message 🎯 me if you encounter any errors ${contact}
`,
			{ parse_mode: "Markdown" }
		);
		await bot.sendMessage(chatId, "😟");
	}
});
