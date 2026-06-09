let playlists = [];

async function loadPlaylists() {
    try {
        const response = await fetch('data/data.json');
        playlists = await response.json();
        renderPlaylistCards(playlists);
    } catch (error) {
        console.error('Error loading playlists:', error);
        displayMessage('Error loading playlists. Please try again later.');
    }
}

function renderPlaylistCards(playlists) {
    const container = document.querySelector('.playlist-cards');

    container.innerHTML = '';

    if (!playlists || playlists.length === 0) {
        displayMessage('No playlists found');
        return;
    }

    playlists.forEach(playlist => {
        const card = createPlaylistCard(playlist);
        container.appendChild(card);
    });
}

function createPlaylistCard(playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.setAttribute('data-playlist-id', playlist.playlistID);

    card.innerHTML = `
        <img src="${playlist.playlist_art}" alt="${playlist.playlist_name} playlist cover" class="playlist-cover">
        <div class="playlist-info">
            <h3 class="playlist-name">${playlist.playlist_name}</h3>
            <p class="playlist-author">${playlist.playlist_creator}</p>
            <div class="playlist-likes">
                <span class="heart-icon">♡</span>
                <span class="like-count">${playlist.likeCount}</span>
            </div>
        </div>
    `;

    return card;
}

function displayMessage(message) {
    const container = document.querySelector('.playlist-cards');
    container.innerHTML = `<p style="text-align: center; color: #666; font-size: 1.2rem; padding: 2rem;">${message}</p>`;
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

function handleShuffleClick() {
    const modalPlaylistName = document.getElementById('modalPlaylistName').textContent;
    const currentPlaylist = playlists.find(p => p.playlist_name === modalPlaylistName);

    if (!currentPlaylist || !currentPlaylist.songs || currentPlaylist.songs.length === 0) {
        return;
    }

    const shuffledSongs = shuffleSongs(currentPlaylist.songs);

    const modalSongs = document.getElementById('modalSongs');
    modalSongs.innerHTML = '';

    shuffledSongs.forEach(song => {
        const songElement = createSongElement(song);
        modalSongs.appendChild(songElement);
    });
}

function populateModal(playlist) {
    document.getElementById('modalCover').src = playlist.playlist_art;
    document.getElementById('modalCover').alt = playlist.playlist_name;
    document.getElementById('modalPlaylistName').textContent = playlist.playlist_name;
    document.getElementById('modalPlaylistAuthor').textContent = playlist.playlist_creator;

    const modalSongs = document.getElementById('modalSongs');
    modalSongs.innerHTML = '';

    if (!playlist.songs || playlist.songs.length === 0) {
        modalSongs.innerHTML = '<p style="text-align: center; color: #666; padding: 1rem;">No songs in this playlist</p>';
        return;
    }

    playlist.songs.forEach(song => {
        const songElement = createSongElement(song);
        modalSongs.appendChild(songElement);
    });
}

function openModal(playlistID) {
    const playlist = playlists.find(p => p.playlistID === playlistID);

    if (!playlist) {
        console.error(`Playlist with ID ${playlistID} not found`);
        return;
    }

    populateModal(playlist);
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');

    const descriptionDiv = document.getElementById('modalDescription');
    descriptionDiv.classList.remove('visible', 'loading', 'error');
    descriptionDiv.textContent = '';
}

async function getPlaylistDescription(playlist) {
    // API key is loaded from secrets.js (not committed to git)
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('OpenRouter API key not configured');
        return 'Unable to generate description. API key not configured.';
    }

    try {
        const songList = playlist.songs.map(song =>
            `- ${song.title} by ${song.artist} (from ${song.album})`
        ).join('\n');

        const prompt = `You are a music curator analyzing a playlist.

Playlist: ${playlist.playlist_name}
Created by: ${playlist.playlist_creator}

Songs:
${songList}

Generate a 2-3 sentence description that captures the vibe, mood, and theme of this playlist. Do not list individual songs. Focus on the overall feeling and genre connections.`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Music Playlist Explorer'
            },
            body: JSON.stringify({
                model: 'google/gemma-3-27b-it',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        const description = data.choices?.[0]?.message?.content;

        if (!description || description.trim() === '') {
            return 'Description unavailable at this time.';
        }

        return description.trim();

    } catch (error) {
        console.error('Error generating playlist description:', error);
        console.error('Error details:', error.message);
        return 'Unable to generate description. Please try again later.';
    }
}

async function handleGetDescriptionClick() {
    const descriptionDiv = document.getElementById('modalDescription');
    const descriptionBtn = document.getElementById('descriptionBtn');

    const modalPlaylistName = document.getElementById('modalPlaylistName').textContent;
    const currentPlaylist = playlists.find(p => p.playlist_name === modalPlaylistName);

    if (!currentPlaylist) {
        console.error('No playlist currently displayed');
        return;
    }

    descriptionDiv.textContent = 'Generating description...';
    descriptionDiv.classList.remove('error');
    descriptionDiv.classList.add('visible', 'loading');
    descriptionBtn.disabled = true;

    const description = await getPlaylistDescription(currentPlaylist);

    descriptionDiv.textContent = description;
    descriptionDiv.classList.remove('loading');

    if (description.includes('Unable to generate') || description.includes('unavailable')) {
        descriptionDiv.classList.add('error');
    }

    descriptionBtn.disabled = false;
}

function toggleLike(playlistID, heartIcon) {
    const playlist = playlists.find(p => p.playlistID === playlistID);

    if (!playlist) {
        console.error(`Playlist with ID ${playlistID} not found`);
        return;
    }

    const isLiked = heartIcon.classList.contains('liked');

    if (isLiked) {
        playlist.likeCount = Math.max(0, playlist.likeCount - 1);
        heartIcon.classList.remove('liked');
        heartIcon.textContent = '♡';
    } else {
        playlist.likeCount += 1;
        heartIcon.classList.add('liked');
        heartIcon.textContent = '♥';
    }

    const card = heartIcon.closest('.playlist-card');
    const likeCountElement = card.querySelector('.like-count');
    likeCountElement.textContent = playlist.likeCount;
}

function setupEventListeners() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    document.getElementById('modalClose').addEventListener('click', closeModal);

    document.getElementById('shuffleBtn').addEventListener('click', handleShuffleClick);
    document.getElementById('descriptionBtn').addEventListener('click', handleGetDescriptionClick);

    document.addEventListener('click', (e) => {
        const heartIcon = e.target.closest('.heart-icon');
        if (heartIcon) {
            e.stopPropagation();
            const card = heartIcon.closest('.playlist-card');
            const playlistID = parseInt(card.getAttribute('data-playlist-id'));
            toggleLike(playlistID, heartIcon);
            return;
        }

        const card = e.target.closest('.playlist-card');
        if (card) {
            const playlistID = parseInt(card.getAttribute('data-playlist-id'));
            openModal(playlistID);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadPlaylists();
    setupEventListeners();
});
