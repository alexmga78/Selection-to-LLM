function returnSelection() {
  return window.getSelection
	? window.getSelection().toString()
	: document.getSelection
	  ? document.getSelection().toString()
	  : '';
}

function copyTextToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.style.position = 'fixed';  // won't scroll
  textarea.style.opacity = '0';       // hide it
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, _sender, reply) => {
  if (message.action === 'get-highlight') {
	const selection = returnSelection();
	reply(selection);
  }

  if (message.action === 'copy') {
	copyTextToClipboard(message.answer);	// navigator.clipboard.writeText(message.answer);
	reply('copied');
  }
});