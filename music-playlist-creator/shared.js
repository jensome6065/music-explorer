function createSongElement(song) {
    const songDiv = document.createElement('div');
    songDiv.className = 'song-item';
    songDiv.setAttribute('data-song-id', song.id);

    songDiv.innerHTML = `
        <button class="play-button" title="Play preview">▶</button>
        <div class="song-info">
            <div class="song-title">${song.title}</div>
            <div class="song-details">${song.artist} • ${song.album}</div>
        </div>
        <div class="song-duration">${song.duration}</div>
    `;

    const playButton = songDiv.querySelector('.play-button');
    playButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof togglePlayPause === 'function') {
            togglePlayPause(song.id, song.title, song.artist, playButton);
        }
    });

    return songDiv;
}

function shuffleSongs(songs) {
    if (!songs || songs.length === 0) {
        return [];
    }

    const shuffled = [...songs];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function calculateTotalDuration(songs) {
    if (!songs || songs.length === 0) return '0:00';

    let totalSeconds = 0;
    songs.forEach(song => {
        const parts = song.duration.split(':');
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        totalSeconds += (minutes * 60) + seconds;
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDurationForDisplay(songs) {
    if (!songs || songs.length === 0) return '0:00';

    let totalSeconds = 0;
    songs.forEach(song => {
        const parts = song.duration.split(':');
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        totalSeconds += (minutes * 60) + seconds;
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min ${seconds} sec`;
}

async function searchDeezerTrack(title, artist) {
    return new Promise((resolve) => {
        try {
            const query = encodeURIComponent(`${title} ${artist}`);
            const callbackName = `deezerCallback_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

            console.log(`Searching Deezer for: "${title}" by "${artist}"`);

            window[callbackName] = (data) => {
                delete window[callbackName];
                document.head.removeChild(script);

                if (!data.data || data.data.length === 0) {
                    console.warn(`No Deezer results found for "${title}" by "${artist}"`);
                    resolve(null);
                    return;
                }

                const track = data.data[0];
                console.log(`Found: "${track.title}" by ${track.artist.name}`);
                console.log(`Preview URL: ${track.preview || 'NOT AVAILABLE'}`);

                resolve(track.preview || null);
            };

            const script = document.createElement('script');
            script.src = `https://api.deezer.com/search?q=${query}&limit=1&output=jsonp&callback=${callbackName}`;
            script.onerror = () => {
                console.error('Deezer search failed');
                delete window[callbackName];
                document.head.removeChild(script);
                resolve(null);
            };

            document.head.appendChild(script);

        } catch (error) {
            console.error('Error searching Deezer:', error);
            resolve(null);
        }
    });
}

function resetSongUI(songId) {
    const songItem = document.querySelector(`.song-item[data-song-id="${songId}"]`);
    if (songItem) {
        const button = songItem.querySelector('.play-button');
        if (button && !button.disabled) {
            button.innerHTML = '▶';
            button.classList.remove('active');
        }
        songItem.classList.remove('playing');
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateNowPlaying(playlist, song) {
    const bar = document.getElementById('nowPlayingBar');
    const cover = document.getElementById('nowPlayingCover');
    const songEl = document.getElementById('nowPlayingSong');
    const metaEl = document.getElementById('nowPlayingMeta');

    cover.src = playlist.playlist_art;
    cover.alt = playlist.playlist_name;
    songEl.textContent = song.title;
    metaEl.textContent = `${song.artist} • ${playlist.playlist_name}`;

    bar.classList.add('visible');
    currentPlaylist = playlist;
}

function hideNowPlaying() {
    const bar = document.getElementById('nowPlayingBar');
    bar.classList.remove('visible');
    currentPlaylist = null;
}

async function playNextInQueue() {
    if (!playlistQueue || playlistQueue.length === 0 || currentQueueIndex >= playlistQueue.length) {
        stopPlaylist();
        return;
    }

    const song = playlistQueue[currentQueueIndex];
    const playlist = currentPlaylist;

    console.log(`Playing from queue [${currentQueueIndex + 1}/${playlistQueue.length}]: ${song.title}`);

    let previewUrl = song.preview_url;
    if (!previewUrl) {
        previewUrl = await searchDeezerTrack(song.title, song.artist);
        if (!previewUrl) {
            console.warn(`⏭ Skipping "${song.title}" - no preview available`);
            currentQueueIndex++;
            await playNextInQueue();
            return;
        }
        song.preview_url = previewUrl;
    }

    if (currentAudio) {
        currentAudio.pause();
    }

    try {
        currentAudio = new Audio(previewUrl);
        currentSongId = song.id;

        if (playlist) {
            updateNowPlaying(playlist, song);
        }

        const songItem = document.querySelector(`.song-item[data-song-id="${song.id}"]`);
        if (songItem) {
            const button = songItem.querySelector('.play-button');
            if (button) {
                button.innerHTML = '⏸';
                button.classList.add('active');
            }
            songItem.classList.add('playing');
        }

        await currentAudio.play();

        currentAudio.onended = () => {
            resetSongUI(song.id);
            currentQueueIndex++;
            playNextInQueue();
        };

        currentAudio.onerror = () => {
            console.error(`⏭ Error playing "${song.title}", skipping...`);
            currentQueueIndex++;
            playNextInQueue();
        };

    } catch (error) {
        console.error('Playback error:', error);
        currentQueueIndex++;
        playNextInQueue();
    }
}

function stopPlaylist() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    if (currentSongId) {
        resetSongUI(currentSongId);
        currentSongId = null;
    }

    playlistQueue = [];
    currentQueueIndex = -1;

    hideNowPlaying();
}

function setupSharedNowPlayingListeners() {
    const toggleBtn = document.getElementById('nowPlayingToggle');
    toggleBtn?.addEventListener('click', () => {
        if (currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play();
                toggleBtn.textContent = '⏸';
            } else {
                currentAudio.pause();
                toggleBtn.textContent = '▶';
            }
        }
    });

    const closeBtn = document.getElementById('nowPlayingClose');
    closeBtn?.addEventListener('click', () => {
        stopPlaylist();
    });
}
