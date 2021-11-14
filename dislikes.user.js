// ==UserScript==
// @name         Restore Dislikes on YouTube
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Restores the dislike counter for YouTube videos. 
// @author       TheBoredProputer

// @match        *://*.youtube.com/*
// @match        *://*.googleapis.com/youtube/v3/videos?part=*
// @icon         https://github.com/TheBoredProputer/Restore-Dislikes-on-Youtube/tree/main/icons
// ==/UserScript==

const youtubeKey = "AIzaSyC9bCs8vDYpfwImAU31WxLJwWFP3iHJCvE";
var youtubeWeb;
var youtubeParameters;
var videoID;
var dislikes = 0;
var likePercentage = "0%";

// .toFixed but the returned number is rounded down
function toFixedFloor(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}

function run()
{
    var dislikesString;
    youtubeWeb = window.location.search;
    console.log(youtubeWeb + " weburl");
    youtubeParameters = new URLSearchParams(youtubeWeb);
    videoID = youtubeParameters.get('v');

    // pull video data from google api
    fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoID}&key=${youtubeKey}`)
        .then(response => {
            return response.json()
        })
        .then(data => {
            // set likes and dislikes to their real values
            likes = data["items"][0].statistics.likeCount;
            dislikes = data["items"][0].statistics.dislikeCount;
            likePercentage = Math.round(Number(likes) / ((Number(likes) + Number(dislikes))) * 100).toString() + "%";
            
            // set dislikes to a string; add letter depending on dislike count
            if(dislikes >= 1000000000)
            {
                dislikesString = toFixedFloor((Number(dislikes)/1000000000), 1) + "B";
            }
            else if(dislikes >= 1000000)
            {
                dislikesString = toFixedFloor((Number(dislikes)/1000000), 1) + "M";
            }
            else if (dislikes >= 1000)
            {
                dislikesString = toFixedFloor((Number(dislikes)/1000), 1) + "K";
            }
            else
            {
                dislikesString = dislikes;
            }

            // set the dislike counter to the correct value
            document.querySelectorAll('#menu #top-level-buttons-computed ytd-toggle-button-renderer a yt-formatted-string')[1].textContent = dislikesString;
            console.log(dislikesString);
            // unhide the like/dislike bar
            document.querySelectorAll('#menu-container ytd-sentiment-bar-renderer')[0].hidden = false;
            // set the like/dislike bar to the correct percentage
            document.getElementById('like-bar')[0].style.width = likePercentage;
        })
        .catch(error => {
            console.log("Error: " + error);
        });
}

document.onload = run();
document.addEventListener('yt-navigate-finish', run, true);
