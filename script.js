console.log("Lets write JavaScript");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;

  // ✅ Fetch songs from playlist.json
  let a = await fetch(`/${folder}/playlist.json`);
  let response = await a.json();
  songs = response.songs;

  // ✅ Display songs in the UI
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" width="34" src="svg/music.svg" alt="">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Harry</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert playPauseButton" src="svg/play.svg" alt="">
        </div>
      </li>`;
  }

  // ✅ Attach click event to play each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "svg/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  console.log("Displaying albums");

  // 🔧 List your album folders here
  let albumFolders = ["Animal", "Dunki", "Fighter", "Gadar 2", "Jawan", "ncs"]; // <-- Update this list based on your actual folders

  let cardContainer = document.querySelector(".cardContainer");

  for (const folder of albumFolders) {
    try {
      // 🔍 Fetch info.json for each album
      let res = await fetch(`/songs/${folder}/info.json`);
      let albumInfo = await res.json();

      cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                      stroke-linejoin="round" />
              </svg>
          </div>
          <img src="/songs/${folder}/cover.jpg" alt="${albumInfo.title}">
          <h2>${albumInfo.title}</h2>
          <p>${albumInfo.description}</p>
        </div>`;
    } catch (err) {
      console.error(`Error loading album '${folder}':`, err);
    }
  }

  // ✅ Add event listener to cards
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // Get the list of all the songs
  await getSongs("songs/Animal");
  playMusic(songs[0], true);

  // Display all the albums on the page
  await displayAlbums();

  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svg/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listener to previous
  // Add an event listener to previous
  previous.addEventListener("click", () => {
    if (!songs || songs.length === 0) {
      console.warn("No songs loaded.");
      return;
    }

    currentSong.pause();
    console.log("Previous clicked");

    const currentSrc = decodeURIComponent(currentSong.src.split("/").pop());
    const index = songs.indexOf(currentSrc);

    if (index > 0) {
      playMusic(songs[index - 1]);
    } else {
      console.log("Already at the first song.");
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    if (!songs || songs.length === 0) {
      console.warn("No songs loaded.");
      return;
    }

    currentSong.pause();
    console.log("Next clicked");

    const currentSrc = decodeURIComponent(currentSong.src.split("/").pop());
    const index = songs.indexOf(currentSrc);

    if (index >= 0 && index < songs.length - 1) {
      playMusic(songs[index + 1]);
    } else {
      console.log("Already at the last song.");
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/ 100");
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      } else {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("volume.svg", "mute.svg");
      }
    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
