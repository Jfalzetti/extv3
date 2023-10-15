console.log("content.js loaded");

let fullscreenClosed = false;
let reviewBoxVisible = false;
let fullscreenClicked = false;
let isFullscreenActive = false;
let videoFullscreenClicked = false;
let currentThumbnailIndex = 0;
let allshorts = [];


const url = window.location.href;
const match = url.match(/channel\/(UC[^?\/]+)/);

let channelId;
if (match && match[1]) {
    channelId = match[1];
    console.log("Channel ID:", channelId);
}

function fetchDiscordChannelsByYouTubeID(youtubeChannelID) {
    return fetch(`https://adloxs.marvelcrm.com/wp-content/plugins/adloxs/files/test.php?action=fetchDiscordChannels&youtube_channel_id=${youtubeChannelID}`)
        .then(response => response.json())
        .then(discordChannelIDs => {
           
        })
        .catch(error => {
            console.error("Error fetching Discord channels by YouTube ID:", error);
        });
}

function fetchThumbnailsByYouTubeID(youtubeChannelID) {
    return fetch(`https://adloxs.marvelcrm.com/wp-content/plugins/adloxs/files/test.php?action=fetchThumbnailsByYouTubeID&youtube_channel_id=${youtubeChannelID}`)
        .then(response => response.json())
        .then(thumbnails => {
            console.log(thumbnails);
            // Handle the thumbnails here
            return thumbnails;
        })
        .catch(error => {
            console.error("Error fetching thumbnails by YouTube ID:", error);
        });
}

function fetchShortsByYouTubeID(youtubeChannelID) {
    return fetch(`https://adloxs.marvelcrm.com/wp-content/plugins/adloxs/files/test.php?action=fetchShortsByYouTubeID&youtube_channel_id=${youtubeChannelID}`)
        .then(response => response.json())
        .then(shorts => {
            console.log(shorts);
            
            return shorts;
        })
        .catch(error => {
            console.error("Error fetching s by YouTube ID:", error);
        });
}

function addReviewButton() {
    const existingButton = document.querySelector('ytcp-home-button');
    if (existingButton && !document.querySelector('.reviewButton')) {
        const reviewBtn = document.createElement('button');
        reviewBtn.innerText = 'Adloxs';
        reviewBtn.className = 'reviewButton';
        reviewBtn.style.backgroundColor = 'red';
        reviewBtn.style.color = 'white';
        reviewBtn.style.height = '25px';
        reviewBtn.style.padding = '0 5px';
        reviewBtn.style.borderRadius = '5px';
        reviewBtn.style.marginTop = '7px';
        reviewBtn.style.border = 'none';
        reviewBtn.style.cursor = 'pointer'; // Makes the cursor a hand when hovering over the button
        reviewBtn.style.transition = 'all 0.2s'; // Smooth transition for the drop effect

        reviewBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (reviewBoxVisible) {
                const existingReviewBox = document.querySelector('.reviewBoxClass');
                if (existingReviewBox) existingReviewBox.remove();
                reviewBoxVisible = false;
                reviewBtn.style.boxShadow = 'none';
                reviewBtn.style.transform = 'none';
            } else {
                // Fetch both thumbnails and shorts data
                Promise.all([
                    fetchThumbnailsByYouTubeID(channelId),
                    fetchShortsByYouTubeID(channelId)  // Assuming you have a similar function for fetching shorts
                ]).then(([thumbnails, shorts]) => {
                    const reviewBox = createReviewBox(thumbnails, shorts);
                    document.body.appendChild(reviewBox);
                    reviewBoxVisible = true;
                    reviewBtn.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.2)';
                    reviewBtn.style.transform = 'scaleY(0.98)';
                }).catch(error => {
                    console.error("Error fetching data:", error);
                });
            }
        });

        existingButton.insertAdjacentElement('afterend', reviewBtn);
    }
}



function createReviewBox(thumbnails, shorts) {
    const reviewBox = document.createElement('div');
    reviewBox.className = 'reviewBoxClass';
    reviewBox.id = 'adloxsReviewBox';
    reviewBox.style.width = '400px';
    reviewBox.style.border = '1px solid #e0e0e0';
    reviewBox.style.padding = '10px';
    reviewBox.style.position = 'fixed';
    reviewBox.style.top = '72px';
    reviewBox.style.left = '20.5%';
    reviewBox.style.backgroundColor = '#fff';
    reviewBox.style.zIndex = '1000';
    reviewBox.style.overflowY = 'auto';
    reviewBox.style.borderRadius = '5px';
    reviewBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';

    // Hide scrollbar for Firefox
    reviewBox.style.scrollbarWidth = 'none';

    // For Chrome, Safari, and newer versions of Edge, you'll need to append a style element
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        #adloxsReviewBox::-webkit-scrollbar {
            display: none;
        }
    `;
    document.head.appendChild(styleElement);

    const baseHeightPerThumbnail = 40;  // Assume each thumbnail container needs about 150px. Adjust as needed.
    const baseHeightPerShort = 40;  // Assume each short container needs about 40px. Adjust as needed.
    const minHeight = 80;  // Minimum height to ensure tabs are visible. Adjust as needed.
    const totalHeight = Math.max(minHeight, thumbnails.length * baseHeightPerThumbnail + shorts.length * baseHeightPerShort); // Calculate total height based on both thumbnails and shorts
    const maxHeight = window.innerHeight * 0.8;  // Let's set a max height to 80% of the viewport height

    reviewBox.style.height = Math.min(totalHeight, maxHeight) + 'px';  // Set the height based on content count but don't exceed maxHeight

    if (totalHeight > maxHeight) {
        reviewBox.style.overflowY = 'auto';  // If the content exceeds the max height, make it scrollable
    }

    // Create tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabsContainer';
    tabsContainer.style.marginBottom = '10px';  // Adjust the value as needed
    tabsContainer.style.display = 'flex';
    tabsContainer.style.justifyContent = 'space-between';
    //tabsContainer.style.borderBottom = '1px solid #e0e0e0';

    const tabButtonStyle = `
        flex: 1;
        padding: 5px 15px;
        background-color: #e10e10e10;
        border: none;
        border-radius: 5px 5px 0 0 ;
        cursor: pointer;
        transition: background-color 0.3s;
    `;
    const activeTabStyle = `
        background-color: #e9e9e9; 
    `;

    function updateTabAppearance() {
        if (thumbnailsTab.classList.contains('active')) {
            thumbnailsTab.style.fontSize = '15px';
            thumbnailsTab.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.2)';
            thumbnailsTab.style.transform = 'scaleY(0.98)';
            shortsTab.style.fontSize = '14px';
            shortsTab.style.boxShadow = 'none';
            shortsTab.style.transform = 'none';
        } else {
            shortsTab.style.fontSize = '15px';
            shortsTab.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.2)';
            shortsTab.style.transform = 'scaleY(0.98)';
            thumbnailsTab.style.fontSize = '14px';
            thumbnailsTab.style.boxShadow = 'none';
            thumbnailsTab.style.transform = 'none';
        }
    }

    // Create Thumbnails tab
    const thumbnailsTab = document.createElement('button');
    thumbnailsTab.innerText = 'Thumbnails';
    thumbnailsTab.className = 'tabButton active';
    thumbnailsTab.style.cssText = tabButtonStyle + activeTabStyle;
    thumbnailsTab.addEventListener('click', function () {
        shortsContent.style.display = 'none';       // Hide Shorts content
        thumbnailsContent.style.display = 'block';  // Show Thumbnails content
        shortsTab.classList.remove('active');
        shortsTab.style.cssText = tabButtonStyle;
        thumbnailsTab.classList.add('active');
        thumbnailsTab.style.cssText = tabButtonStyle + activeTabStyle;
        updateTabAppearance();
    });
    // Create Shorts tab
    const shortsTab = document.createElement('button');
    shortsTab.innerText = 'Shorts';
    shortsTab.className = 'tabButton';
    shortsTab.style.cssText = tabButtonStyle;
    shortsTab.addEventListener('click', function () {
        thumbnailsContent.style.display = 'none';   // Hide Thumbnails content
        shortsContent.style.display = 'block';      // Show Shorts content
        thumbnailsTab.classList.remove('active');
        thumbnailsTab.style.cssText = tabButtonStyle;
        shortsTab.classList.add('active');
        shortsTab.style.cssText = tabButtonStyle + activeTabStyle;
        updateTabAppearance();
    });

    // Append tabs to the container
    tabsContainer.appendChild(thumbnailsTab);
    tabsContainer.appendChild(shortsTab);
    reviewBox.appendChild(tabsContainer);

    // Initial appearance update
    updateTabAppearance();

    // Create content containers for Thumbnails and Shorts
    const thumbnailsContent = document.createElement('div');
    thumbnailsContent.style.display = 'block';  // Initially show the Thumbnails content
    const shortsContent = document.createElement('div');
    shortsContent.style.display = 'none';  // Initially hide the Shorts content


    // Populate the Thumbnails content
    thumbnails.forEach((thumbnail, index) => {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.marginBottom = '10px';
        if (index !== thumbnails.length - 1) {
            container.style.borderBottom = '1px solid lightgrey';
        }
        container.style.paddingBottom = '10px';

        const img = document.createElement('img');
        img.src = thumbnail.thumbnail_url;  
        img.setAttribute('data-id', thumbnail.id);
        img.setAttribute('discord_channel_id', thumbnail.discord_channel_id);
        img.setAttribute('discord_thread_id', thumbnail.discord_thread_id);
        img.setAttribute('discord_message_id', thumbnail.discord_message_id);
        img.style.display = 'block';
        img.width = 120;
        img.style.marginRight = '15px';
        img.style.borderRadius = '5px';
        img.style.cursor = 'pointer';
        img.className = 'thumbnail-image';
        img.setAttribute('data-src', thumbnail.thumbnail_url);
        img.onclick = function () {
            viewImageFullscreen(thumbnail.thumbnail_url, index, thumbnails);  // Ensure you're using the correct property from the thumbnail object
        };


         const desc = document.createElement('div');
        desc.innerText = thumbnail.video_title || "No Title Available"; // This is where you can define what is displayed in description next to image
        desc.style.flexGrow = '1';
        desc.style.fontFamily = "YouTube Sans, sans-serif";
        desc.style.fontSize = '15px';
        desc.className = 'description';

        container.appendChild(img);
        container.appendChild(desc);
        thumbnailsContent.appendChild(container);

    });

    shorts.forEach((short) => {
            const container = document.createElement('div');
        container.style.marginBottom = '10px';
            if (short !== shorts[shorts.length - 1]) {
        container.style.borderBottom = '1px solid lightgrey';
        }
        container.style.paddingBottom = '10px';

            // Create a link element with the video title as its text
            const titleLink = document.createElement('a');
        titleLink.href = short.shorts_url;; // Assuming the URL property is named 'video_url'
        titleLink.innerText = short.video_title || "No Title Available"; // Display the video title or a default message
        titleLink.target = '_blank'; // Open the link in a new tab
        titleLink.style.flexGrow = '1';
        titleLink.style.fontFamily = "YouTube Sans, sans-serif";
        titleLink.style.fontSize = '15px';
        titleLink.style.color = '#007BFF'; // Give it a blue color to indicate it's a clickable link
        titleLink.style.textDecoration = 'none'; // Remove the underline
        titleLink.setAttribute('data-id', short.id);
        titleLink.setAttribute('discord_channel_id', short.discord_channel_id);
        titleLink.setAttribute('discord_thread_id', short.discord_thread_id);
        titleLink.setAttribute('discord_message_id', short.discord_message_id);
        titleLink.setAttribute('data-shorts-url', short.shorts_url);
        titleLink.onclick = function(event) {
        event.preventDefault(); // Prevent the default link behavior
        viewShortFullscreen(short.shorts_url, shorts.indexOf(short), shorts);
        };

        // Append the title link to the container
        container.appendChild(titleLink);

        // Append the container to the shortsContent
        shortsContent.appendChild(container);
    });



    // Append content containers to the review box
        reviewBox.appendChild(thumbnailsContent);
        reviewBox.appendChild(shortsContent);

        return reviewBox;
    }

function cycleToNextThumbnail(img, thumbnails) {
    if (thumbnails[currentThumbnailIndex + 1]) {
        currentThumbnailIndex++;
        img.src = thumbnails[currentThumbnailIndex].thumbnail_url;
        return thumbnails[currentThumbnailIndex].thumbnail_url;  // Return the new imageUrl
    } else {
        const fullscreenDiv = document.getElementById('fullscreenDiv');
        if (fullscreenDiv) {
            document.body.removeChild(fullscreenDiv);
        }
        return null;
    }
}



function viewImageFullscreen(imageUrl, index, thumbnails) {
        const fullscreenDiv = document.createElement('div');
    fullscreenDiv.style.position = 'fixed';
    fullscreenDiv.style.top = '0';
    fullscreenDiv.style.left = '0';
    fullscreenDiv.style.width = '100vw';
    fullscreenDiv.style.height = '100vh';
    fullscreenDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    fullscreenDiv.style.zIndex = '2000';
    fullscreenDiv.style.display = 'flex';
    fullscreenDiv.style.justifyContent = 'center';
    fullscreenDiv.style.alignItems = 'center';
    fullscreenDiv.id = 'fullscreenDiv';

        const img = document.createElement('img');
    img.src = imageUrl;
    img.src = thumbnails[index].thumbnail_url;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.borderRadius = '20px';
    img.style.marginRight = '20px';

        const approveBtn = document.createElement('button');
    approveBtn.innerText = '✔';
    approveBtn.style.backgroundColor = 'green';
    approveBtn.style.color = 'white';
    approveBtn.style.marginBottom = '10px';
    approveBtn.style.border = 'none';
    approveBtn.style.padding = '5px 10px';  // Increase the padding to make the button larger
    approveBtn.style.borderRadius = '4px';  // Round the button corners
    approveBtn.style.fontSize = '20px';  // Increase the font size for visibility
    approveBtn.onclick = function (event) {
        console.log("Approve button clicked");
        event.stopPropagation();
        console.log(imageUrl + ' approved');
        

        // Find the associated thumbnail element in the review box
        const associatedThumbnailElement = document.querySelector(`[data-src="${imageUrl}"]`);
 
        // Add the 'approved' class to the container of the associated thumbnail
        associatedThumbnailElement.closest('div').classList.add('approved');
    
        // Update the thumbnail status in the database
        const thumbnailId = associatedThumbnailElement.getAttribute('data-id'); // Assuming you have a data-id attribute on the thumbnail element
        updateThumbnailStatus(thumbnailId, 'approved');
    
        const newImageUrl = cycleToNextThumbnail(img, thumbnails);
        if (newImageUrl) {
        imageUrl = newImageUrl;
        cycleToNextThumbnail(thumbnails);
    }
};
        
        const reviseBtn = document.createElement('button');
    reviseBtn.innerText = '✖';
    reviseBtn.style.backgroundColor = 'red';
    reviseBtn.style.color = 'white';
    reviseBtn.style.border = 'none';
    reviseBtn.style.padding = '5px 10px';  // Increase the padding to make the button larger
    reviseBtn.style.borderRadius = '4px';  // Round the button corners
    reviseBtn.style.fontSize = '20px';  // Increase the font size for visibility
    reviseBtn.onclick = function (event) {
        console.log("Revise button clicked");
    event.stopPropagation();
        const comment = prompt('Enter your revision request:', '');
      if (comment) {
        console.log('Revision for ' + imageUrl + ':', comment);
            
          const associatedThumbnailElement = document.querySelector(`[data-src="${imageUrl}"]`);

          associatedThumbnailElement.closest('div').classList.add('revised');
        
          const thumbnailId = associatedThumbnailElement.getAttribute('data-id'); // Assuming you have a data-id attribute on the thumbnail element
          updateThumbnailStatus(thumbnailId, 'revised', comment);
 
          const newImageUrl = cycleToNextThumbnail(img, thumbnails);
          if (newImageUrl) {
            imageUrl = newImageUrl;

            cycleToNextThumbnail(thumbnails);
        }
    }
};

       const buttonContainer = document.createElement('div');
       buttonContainer.style.display = 'flex';
       buttonContainer.style.flexDirection = 'column';
       buttonContainer.style.alignItems = 'flex-end';  // Align buttons to the right
       buttonContainer.style.marginRight = '10px';  // Add some space on the right

       buttonContainer.appendChild(approveBtn);
       buttonContainer.appendChild(reviseBtn);

       fullscreenDiv.appendChild(img);
       fullscreenDiv.appendChild(buttonContainer);
       document.body.appendChild(fullscreenDiv);

       isFullscreenActive = true;

       fullscreenDiv.addEventListener('click', function(event) {
            console.log("Fullscreen div clicked");
        event.stopPropagation();  // Stop the event from propagating to the document
        fullscreenDiv.remove();

       isFullscreenActive = false;
    });

}
let currentShortIndex = 0;

function cycleToNextShort(iframe, shortsArray, btn) {
    console.log("Shorts array:", shortsArray);
    console.log("Current short index:", currentShortIndex); // Add this log
    console.log("Total number of shorts:", shortsArray.length);  // Add this log

    if (shortsArray[currentShortIndex + 1]) {
        currentShortIndex++;
        const nextShort = shortsArray[currentShortIndex];
        btn.short = nextShort;
        console.log ("ns"+nextShort);
        const fileIdMatch = nextShort.shorts_url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
        if (fileIdMatch) {
            const fileId = fileIdMatch[1];
            iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
            console.log("Cycling to next short:", iframe.src); // Add this log
            return nextShort.shorts_url;
        }
    } else {
        console.log("No more shorts to display"); // Add this log
        const fullscreenDiv = document.getElementById('fullscreenDiv');
        if (fullscreenDiv) {
            fullscreenDiv.remove();
        }
        return null;
    }
}


function viewShortFullscreen(driveUrl, index, shorts) {
    allshorts = shorts;
    // Extract the FILE_ID from the Google Drive URL
    const fileIdMatch = driveUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (!fileIdMatch) {
        console.error("Invalid Google Drive URL:", driveUrl);
        return;
    }
    const fileId = fileIdMatch[1];

    const fullscreenDiv = document.createElement('div');
    fullscreenDiv.style.position = 'fixed';
    fullscreenDiv.style.top = '0';
    fullscreenDiv.style.left = '0';
    fullscreenDiv.style.width = '100vw';
    fullscreenDiv.style.height = '100vh';
    fullscreenDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    fullscreenDiv.style.zIndex = '2000';
    fullscreenDiv.style.display = 'flex';
    fullscreenDiv.style.justifyContent = 'center';
    fullscreenDiv.style.alignItems = 'center';
    fullscreenDiv.id = 'fullscreenDiv';

    const iframe = document.createElement('iframe');
    //iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
    iframe.src = `https://www.youtube.com/embed/t-YdLxqi49Q`;
    iframe.style.width = '90%';  // Adjust as needed
    iframe.style.height = '90%'; // Adjust as needed
    
    iframe.style.borderRadius = '20px';
    iframe.style.marginRight = '20px';
    iframe.allowFullscreen = true;

    const approveBtn = document.createElement('button');
    approveBtn.innerText = '✔';
    approveBtn.style.backgroundColor = 'green';
    approveBtn.style.color = 'white';
    approveBtn.style.marginBottom = '10px';
    approveBtn.style.border = 'none';
    approveBtn.style.padding = '5px 10px';
    approveBtn.style.borderRadius = '4px';
    approveBtn.style.fontSize = '20px';
    approveBtn.short = shorts[index];
    approveBtn.onclick = function(event) {
        event.stopPropagation();
        var short = this.short;
        console.log(this.short);
        console.log(driveUrl + ' approved');
        updateShortStatus(short.id, 'approved'); // Call the function to update the short status
        const newDriveUrl = cycleToNextShort(iframe, allshorts, approveBtn);
        if (newDriveUrl) {
            driveUrl = newDriveUrl;
        }    
    };

    const reviseBtn = document.createElement('button');
    reviseBtn.innerText = '✖';
    reviseBtn.style.backgroundColor = 'red';
    reviseBtn.style.color = 'white';
    reviseBtn.style.border = 'none';
    reviseBtn.style.padding = '5px 10px';
    reviseBtn.style.borderRadius = '4px';
    reviseBtn.style.fontSize = '20px';
    reviseBtn.short = shorts[index];
    reviseBtn.onclick = function(event) {
        event.stopPropagation();
        const comment = prompt('Enter your revision request:', '');
        if (comment) {
            var short = this.short;
            console.log(this.short);
            console.log('Revision for ' + driveUrl + ':', comment);
            updateShortStatus(short.id, 'revised', comment); // Call the function to update the short status with a comment
            const newDriveUrl = cycleToNextShort(iframe, allshorts, reviseBtn);
            if (newDriveUrl) {
                driveUrl = newDriveUrl;
            }
        }   
    };

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.alignItems = 'flex-end';

    buttonContainer.appendChild(approveBtn);
    buttonContainer.appendChild(reviseBtn);

    fullscreenDiv.appendChild(iframe); // Append the iframe first
    fullscreenDiv.appendChild(buttonContainer); // Then append the buttons
    document.body.appendChild(fullscreenDiv);

    fullscreenDiv.addEventListener('click', function() {
        videoFullscreenClicked = true;  // Set the flag when the video fullscreen is clicked
        fullscreenDiv.remove();
    });
}


function updateThumbnailStatus(thumbnailId, status, revisionComment = null) {
    const formData = new URLSearchParams();
    formData.append('thumbnail_id', thumbnailId);
    formData.append('status', status);
    if (revisionComment) {
        formData.append('revision_comment', revisionComment);
    }

    // First, update the database
    fetch('https://adloxs.marvelcrm.com/wp-content/plugins/adloxs/files/test.php?action=updateThumbnailStatus', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);

        // Retrieve associated thumbnail attributes
        const associatedThumbnailElement = document.querySelector(`[data-id="${thumbnailId}"]`);
        if (!associatedThumbnailElement) {
            console.error("Thumbnail element not found for thumbnailId:", thumbnailId);
            return;
        }

       //const channelId = associatedThumbnailElement.getAttribute('discord_channel_id');
        const threadId = associatedThumbnailElement.getAttribute('discord_thread_id');
        const messageId = associatedThumbnailElement.getAttribute('discord_message_id');
        //const imageUrl = associatedThumbnailElement.getAttribute('data-src');

        // Construct JSON data
        const requestData = {            
            threadId:  String(threadId),
            messageId: String(messageId),
           // imageUrl:  imageUrl,
            status:    status
        };

        if (status === 'revised' && revisionComment) {
            requestData.revisionComment = revisionComment;
        }
        console.log("Sending data:", requestData);
        // Send JSON request to Discord update PHP script
        return fetch('https://adloxs.marvelcrm.com/wp-content/plugins/adloxs/files/DiscordUpdatecurl.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function updateShortStatus(shortId, status, revisionComment = null) {
    const formData = new URLSearchParams();
    formData.append('short_id', shortId);
    formData.append('status', status);
    if (revisionComment) {
        formData.append('revision_comment', revisionComment);
    }

    // Assuming the PHP endpoint for updating short status is similar to the thumbnail one
    fetch('https://adloxs.marvelcrm.com/wp-content/plugins/adloxs/files/test.php?action=updateShortStatus', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);

            // Retrieve associated thumbnail attributes
            const associatedShortElement = document.querySelector(`[data-id="${shortId}"]`);
            if (!associatedShortElement) {
                console.error("Thumbnail element not found for thumbnailId:", shortId);
                return;
            }
           
          //  const channelId = associatedShortElement.getAttribute('discord_channel_id');
            const threadId = associatedShortElement.getAttribute('discord_thread_id');
            const messageId = associatedShortElement.getAttribute('discord_message_id');
          //  const driveUrl = associatedShortElement.getAttribute('data-shorts-url');

            // Construct JSON data
            const requestData = {
                threadId: String(threadId),
                messageId: String(messageId),
              //  driveUrl: driveUrl,
                status: status
            };

            if (status === 'revised' && revisionComment) {
                requestData.revisionComment = revisionComment;
            }
            console.log("Sending data:", requestData);
            // Send JSON request to Discord update PHP script
            return fetch('https://adloxs.marvelcrm.com/wp-content/plugins/adloxs/files/DiscordUpdatecurl.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
        })
        .catch(error => {
            console.error("Error:", error);
        });
}
function injectStyles() {
    console.log("Injecting styles...");
    const styles = `
        .approved .description {
            text-decoration: line-through;
            color: green;
        }

        .approved .thumbnail-image {
            filter: brightness(50%) sepia(1) hue-rotate(100deg); /* green filter */
        }

        .revised .description {
            text-decoration: line-through;
            color: red;
        }

        .revised .thumbnail-image {
            filter: brightness(70%) sepia(1) hue-rotate(0deg); /* red filter */
        }
         #fullscreenDiv img.slide-in {
        animation: slideIn 0.5s forwards;
        }

        @keyframes slideIn {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(0);
        }
        .tabsContainer {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid grey;
        margin-bottom: 10px;
        }

        .tabButton {
        padding: 10px 20px;
        cursor: pointer;
        background-color: #f5f5f5;
        border: none;
        outline: none;
        }

        .tabButton.active {
        background-color: #ddd;
        }
        
        .tabsContainer {
        margin-bottom: 20px; /* Adjust the value as needed */
        }


    }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

injectStyles(); // manually invoke the function

document.addEventListener('click', function (event) {
    const reviewBox = document.getElementById('adloxsReviewBox');

    setTimeout(() => {
        if (reviewBoxVisible && reviewBox && 
            !reviewBox.contains(event.target) && 
            !event.target.matches('.reviewButton') && 
            !isFullscreenActive && 
            !videoFullscreenClicked) {  // Check the new flag here
            reviewBox.remove();
            reviewBoxVisible = false;
        }
        videoFullscreenClicked = false;  // Reset the flag after checking
    }, 1);
});

document.addEventListener('DOMContentLoaded', addReviewButton);

const reviewButtonObserver = new MutationObserver(addReviewButton);
reviewButtonObserver.observe(document.body, { childList: true, subtree: true });