console.log("popup.js loaded");


// Function to send a chat message to Discord via webhook
function sendChatMessageToDiscord(message) {
    // Replace 'YOUR_WEBHOOK_URL' with your actual Discord webhook URL
    const webhookUrl = 'https://discord.com/api/webhooks/1157529752605831242/ZMP5oULgtpSXCk03Z5SGKaNUb0XdRicHWbHfN9rC_GHX2ZYaQeUU10x-Jqd60QnssQuX';

    // Create a JSON payload for the message
    const payload = {
        content: message,
    };

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => {
        if (response.ok) {
            console.log('Message sent to Discord successfully.');
        } else {
            console.error('Failed to send message to Discord:', response.status, response.statusText);
        }
    })
    .catch(error => {
        console.error('Error sending message to Discord:', error);
    });
}

// Send a chat message when the send button is clicked
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('sendChatMessageButton').addEventListener('click', function() {
        const message = document.getElementById('chatMessageInput').value;
        if (message) {
            sendChatMessageToDiscord(message);
            document.getElementById('chatMessageInput').value = ''; // Clear the input field
        }
    });
});

