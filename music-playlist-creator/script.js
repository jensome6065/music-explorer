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

function createSongElement(song) {
    const songDiv = document.createElement('div');
    songDiv.className = 'song-item';

    songDiv.innerHTML = `
        <div class="song-info">
            <div class="song-title">${song.title}</div>
            <div class="song-details">${song.artist} • ${song.album}</div>
        </div>
        <div class="song-duration">${song.duration}</div>
    `;

    return songDiv;
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
}

function setupEventListeners() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    document.getElementById('modalClose').addEventListener('click', closeModal);

    document.addEventListener('click', (e) => {
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
