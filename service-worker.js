/*
Docs:
https://github.com/mihiraggarwal/select-gpt
https://platform.openai.com/docs/api-reference/responses/create
https://platform.openai.com/docs/guides/text?api-mode=responses&prompt-example=code
https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses
https://platform.openai.com/logs?api=responses
https://openai.com/api/pricing/
https://platform.openai.com/usage
https://github.com/mozilla/pdf.js/releases
*/

const OPENAI_API_KEY = '<INSERT API KEY>';

async function askChatGPT(tabId, prompt) {
	if (!prompt) return 'Missing prompt';

	const res = await fetch('https://api.openai.com/v1/responses', {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${OPENAI_API_KEY}`,
	  },
	  body: JSON.stringify({
		model: 'gpt-4.1',
		input: [
			{
				role: 'system',
				content: `
					Context:
					'''
					-you are a Hardware Engineer with over 3 years of experience
					-you will receive grid test questions and you will respond with only the letter of the correct answer letter or number(e.g. A, B, C, D, 1, 2, 3, 4, which represent the correct answer)
					'''
				`,
			},
			{
				role: 'user',
				content: prompt,
			},
		],
	  }),
	});

	const json = await res.json();
	return json.output[0].content[0].text;
}

function sendMessageToTab(tabId, message) {
	return new Promise((resolve) => {
		chrome.tabs.sendMessage(tabId, message, resolve);
	});
}

function _print(tabId, message) {
	chrome.scripting.executeScript({
		target: { tabId: tabId },
		func: (text) => console.log(`[select-gpt] ${text}`),
		args: [message],
	});
}

chrome.commands.onCommand.addListener(async (command) => {
  // Find the currently active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  if (command === 'send-to-chatgpt') {
	// Retrieve the current text highlighted on the page
	const selection = await sendMessageToTab(tab.id, { action: 'get-highlight' });

	const prompt = `${selection}`;
	let answer;
	try {
		answer = await askChatGPT(tab.id, `${prompt}`);
	} catch (error) {
		_print(tab.id, `${error}`);
		answer = 'fail';
	}

	await sendMessageToTab(tab.id, { action: 'copy', answer: `${answer}` });

	return;
  }
});