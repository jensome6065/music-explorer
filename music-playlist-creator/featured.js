let playlists = [];
let featuredPlaylist = null;
let featuredShuffledSongs = null;

let currentAudio = null;
let currentSongId = null;

let currentPlaylist = null;
let playlistQueue = [];
let currentQueueIndex = -1;

async function loadPlaylists() {
    try {
        const response = await fetch('data/data.json');
        playlists = await response.json();

        const randomPlaylist = selectRandomPlaylist(playlists);
        if (randomPlaylist) {
            displayFeaturedPlaylist(randomPlaylist);
        } else {
            displayMessage('No playlists available');
        }
    } catch (error) {
        console.error('Error loading playlists:', error);
        displayMessage('Error loading playlists. Please try again later.');
    }
}

function selectRandomPlaylist(playlists) {
    if (!playlists || playlists.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * playlists.length);
    return playlists[randomIndex];
}

function renderFeaturedSongs(songs) {
    const featuredSongs = document.getElementById('featuredSongs');
    featuredSongs.innerHTML = '';

    if (!songs || songs.length === 0) {
        featuredSongs.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No songs in this playlist</p>';
        return;
    }

    songs.forEach(song => {
        const songElement = createSongElement(song);
        featuredSongs.appendChild(songElement);
    });

    if (currentSongId) {
        const playingSong = songs.find(s => s.id === currentSongId);
        if (playingSong) {
            const songItem = document.querySelector(`.song-item[data-song-id="${currentSongId}"]`);
            if (songItem) {
                const button = songItem.querySelector('.play-button');
                if (button) {
                    button.innerHTML = '⏸';
                    button.classList.add('active');
                }
                songItem.classList.add('playing');
            }
        }
    }
}

function updateFeaturedFooter(playlist) {
    const songCount = playlist.songs?.length || 0;
    const totalTime = formatDurationForDisplay(playlist.songs);

    document.getElementById('featuredSongCount').textContent = `${songCount} ${songCount === 1 ? 'song' : 'songs'}`;
    document.getElementById('featuredTotalTime').textContent = totalTime;
}

function displayFeaturedPlaylist(playlist) {
    featuredPlaylist = playlist;
    featuredShuffledSongs = null;

    const coverImg = document.getElementById('featuredCover');
    coverImg.style.opacity = '0';
    coverImg.src = playlist.playlist_art;
    coverImg.alt = playlist.playlist_name + ' cover';
    coverImg.onload = () => {
        coverImg.style.transition = 'opacity 0.5s ease';
        coverImg.style.opacity = '1';
    };

    const nameElement = document.getElementById('featuredPlaylistName');
    const creatorElement = document.getElementById('featuredCreator');

    nameElement.style.opacity = '0';
    creatorElement.style.opacity = '0';

    setTimeout(() => {
        nameElement.textContent = playlist.playlist_name;
        creatorElement.textContent = 'by ' + playlist.playlist_creator;

        nameElement.style.transition = 'opacity 0.5s ease';
        creatorElement.style.transition = 'opacity 0.5s ease';
        nameElement.style.opacity = '1';
        creatorElement.style.opacity = '1';
    }, 200);

    const songsToDisplay = featuredShuffledSongs || playlist.songs;
    renderFeaturedSongs(songsToDisplay);

    updateFeaturedFooter(playlist);

    updateFeaturedPlayButton();
}

function handleFeaturedShuffle() {
    if (!featuredPlaylist || !featuredPlaylist.songs || featuredPlaylist.songs.length === 0) {
        return;
    }

    featuredShuffledSongs = shuffleSongs(featuredPlaylist.songs);
    renderFeaturedSongs(featuredShuffledSongs);
}

async function handleFeaturedDescription() {
    if (!featuredPlaylist) return;

    const descriptionDiv = document.getElementById('featuredDescription');
    const descriptionBtn = document.getElementById('featuredDescriptionBtn');

    descriptionDiv.classList.add('visible', 'loading');
    descriptionDiv.textContent = 'Generating description...';
    descriptionBtn.disabled = true;
    descriptionBtn.classList.add('loading');

    try {
        const description = await getPlaylistDescription(featuredPlaylist);

        descriptionDiv.classList.remove('loading');
        descriptionDiv.textContent = description;
    } catch (error) {
        console.error('Error generating description:', error);
        descriptionDiv.classList.remove('loading');
        descriptionDiv.classList.add('error');
        descriptionDiv.textContent = 'Unable to generate description. Please try again later.';
    } finally {
        descriptionBtn.disabled = false;
        descriptionBtn.classList.remove('loading');
    }
}

async function getPlaylistDescription(playlist) {
    const prompt = `You are a music curator analyzing a playlist.

Playlist: ${playlist.playlist_name}
Created by: ${playlist.playlist_creator}

Songs:
${playlist.songs.map(song => `- ${song.title} by ${song.artist} (from ${song.album})`).join('\n')}

Generate a 2-3 sentence description that captures the vibe, mood, and theme of this playlist. Do not list individual songs. Focus on the overall feeling and genre connections.`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/gemma-2-9b-it:free',
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenRouter API error:', error);
        throw error;
    }
}

function displayMessage(message) {
    const featuredSongs = document.getElementById('featuredSongs');
    featuredSongs.innerHTML = `<p style="text-align: center; color: #666; font-size: 1.2rem; padding: 2rem;">${message}</p>`;
}


async function togglePlayPause(songId, songTitle, songArtist, button) {
    const songItem = button.closest('.song-item');

    if (currentSongId === songId && currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        button.innerHTML = '▶';
        button.classList.remove('active');
        songItem.classList.remove('playing');
        return;
    }

    if (currentSongId === songId && currentAudio && currentAudio.paused) {
        currentAudio.play();
        button.innerHTML = '⏸';
        button.classList.add('active');
        songItem.classList.add('playing');
        return;
    }

    if (currentAudio) {
        currentAudio.pause();
        resetSongUI(currentSongId);
    }

    let previewUrl = button.getAttribute('data-preview-url');

    if (!previewUrl || previewUrl === 'null') {
        button.innerHTML = '<span class="loading-spinner">⏳</span>';
        button.disabled = true;

        previewUrl = await searchDeezerTrack(songTitle, songArtist);

        button.setAttribute('data-preview-url', previewUrl || 'null');
        button.disabled = false;

        if (!previewUrl) {
            button.innerHTML = '🚫';
            button.title = 'Preview unavailable';
            button.disabled = true;
            showToast('Preview not available for this song');
            return;
        }
    }

    try {
        currentAudio = new Audio(previewUrl);
        currentSongId = songId;

        playlistQueue = [];
        currentQueueIndex = -1;

        button.innerHTML = '⏸';
        button.classList.add('active');
        songItem.classList.add('playing');

        const song = featuredPlaylist?.songs.find(s => s.id === songId);
        if (featuredPlaylist && song) {
            updateNowPlaying(featuredPlaylist, song);
        }

        await currentAudio.play();

        currentAudio.onended = () => {
            resetSongUI(songId);
            currentAudio = null;
            currentSongId = null;
            hideNowPlaying();
        };

        currentAudio.onerror = () => {
            console.error('Audio playback error');
            showToast('Playback failed');
            resetSongUI(songId);
            currentAudio = null;
            currentSongId = null;
            hideNowPlaying();
        };

    } catch (error) {
        console.error('Error playing audio:', error);
        showToast('Unable to play audio');
        resetSongUI(songId);
        currentAudio = null;
        currentSongId = null;
    }
}


async function playPlaylist(playlist) {
    if (currentAudio) {
        currentAudio.pause();
        resetSongUI(currentSongId);
    }

    playlistQueue = [...playlist.songs];
    currentQueueIndex = 0;
    currentPlaylist = playlist;

    updateFeaturedPlayButton();
    await playNextInQueue();
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
    updateFeaturedPlayButton();
}

function updateFeaturedPlayButton() {
    const playAllBtn = document.getElementById('featuredPlayAllBtn');
    if (!playAllBtn || !featuredPlaylist) return;

    const isPlaying = currentPlaylist?.playlistID === featuredPlaylist.playlistID && playlistQueue.length > 0;

    if (isPlaying) {
        playAllBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
            </svg>
        `;
        playAllBtn.classList.add('playing');
        playAllBtn.title = 'Stop playlist';
    } else {
        playAllBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `;
        playAllBtn.classList.remove('playing');
        playAllBtn.title = 'Play all songs';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadPlaylists();
    setupNowPlayingListeners();
});

function setupNowPlayingListeners() {
    setupSharedNowPlayingListeners();

    const playAllBtn = document.getElementById('featuredPlayAllBtn');
    playAllBtn?.addEventListener('click', () => {
        if (featuredPlaylist) {
            if (playlistQueue.length > 0 && currentPlaylist?.playlistID === featuredPlaylist.playlistID) {
                stopPlaylist();
            } else {
                playPlaylist(featuredPlaylist);
            }
        }
    });

    const shuffleBtn = document.getElementById('featuredShuffleBtn');
    shuffleBtn?.addEventListener('click', handleFeaturedShuffle);

    const descriptionBtn = document.getElementById('featuredDescriptionBtn');
    descriptionBtn?.addEventListener('click', handleFeaturedDescription);
}
