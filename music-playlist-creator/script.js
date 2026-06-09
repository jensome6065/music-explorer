let playlists = [];
let currentSort = 'likes';

function createSkeletonCard() {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-card';
    skeleton.innerHTML = `
        <div class="skeleton-cover"></div>
        <div class="skeleton-info">
            <div class="skeleton-title"></div>
            <div class="skeleton-author"></div>
            <div class="skeleton-likes"></div>
        </div>
    `;
    return skeleton;
}

function showSkeletonLoaders(count = 6) {
    const container = document.querySelector('.playlist-cards');
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        container.appendChild(createSkeletonCard());
    }
}

async function loadPlaylists() {
    showSkeletonLoaders();

    try {
        const response = await fetch('data/data.json');
        playlists = await response.json();

        await new Promise(resolve => setTimeout(resolve, 300));

        const sortedPlaylists = sortPlaylists(playlists, currentSort);
        renderPlaylistCards(sortedPlaylists);
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

function createPlaylistCard(playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.setAttribute('data-playlist-id', playlist.playlistID);

    const totalDuration = calculateTotalDuration(playlist.songs);
    const songCount = playlist.songs ? playlist.songs.length : 0;

    card.innerHTML = `
        <button class="card-delete-btn" data-playlist-id="${playlist.playlistID}" aria-label="Delete playlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
        <button class="card-edit-btn" data-playlist-id="${playlist.playlistID}" aria-label="Edit playlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
        </button>
        <img src="${playlist.playlist_art}" alt="${playlist.playlist_name} playlist cover" class="playlist-cover">
        <div class="playlist-info">
            <h3 class="playlist-name">${playlist.playlist_name}</h3>
            <div class="playlist-bottom">
                <div class="playlist-meta">
                    <span class="playlist-duration">${totalDuration}</span>
                    <span class="playlist-dot">•</span>
                    <span class="playlist-count">${songCount} ${songCount === 1 ? 'song' : 'songs'}</span>
                </div>
                <div class="playlist-likes">
                    <span class="heart-icon">♡</span>
                    <span class="like-count">${playlist.likeCount}</span>
                </div>
            </div>
        </div>
    `;

    return card;
}

function displayMessage(message) {
    const container = document.querySelector('.playlist-cards');
    container.innerHTML = `<p style="text-align: center; color: var(--text-secondary); font-size: 1.2rem; padding: 2rem;">${message}</p>`;
}

function displayNoResults(searchQuery) {
    const container = document.querySelector('.playlist-cards');
    container.innerHTML = `
        <div class="no-results">
            <svg class="no-results-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
            </svg>
            <div class="no-results-text">No playlists found</div>
            <div class="no-results-subtext">Try searching for "${searchQuery}"</div>
        </div>
    `;
}

function sortPlaylists(playlistsToSort, sortBy) {
    const sorted = [...playlistsToSort];

    switch (sortBy) {
        case 'likes':
            sorted.sort((a, b) => {
                if (b.likeCount !== a.likeCount) {
                    return b.likeCount - a.likeCount;
                }
                return a.playlist_name.localeCompare(b.playlist_name);
            });
            break;

        case 'name':
            sorted.sort((a, b) => {
                return a.playlist_name.localeCompare(b.playlist_name);
            });
            break;

        case 'recent':
            sorted.sort((a, b) => {
                if (b.playlistID !== a.playlistID) {
                    return b.playlistID - a.playlistID;
                }
                return a.playlist_name.localeCompare(b.playlist_name);
            });
            break;

        default:
            sorted.sort((a, b) => {
                if (b.likeCount !== a.likeCount) {
                    return b.likeCount - a.likeCount;
                }
                return a.playlist_name.localeCompare(b.playlist_name);
            });
    }

    return sorted;
}

function filterPlaylists(searchQuery) {
    const query = searchQuery.toLowerCase().trim();

    if (query === '') {
        return playlists;
    }

    return playlists.filter(playlist => {
        const name = playlist.playlist_name.toLowerCase();

        if (name.includes(query)) {
            return true;
        }

        if (playlist.songs && playlist.songs.length > 0) {
            return playlist.songs.some(song => {
                const title = song.title.toLowerCase();
                const artist = song.artist.toLowerCase();
                return title.includes(query) || artist.includes(query);
            });
        }

        return false;
    });
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const query = searchInput.value;

    if (query.length > 0) {
        searchClear.classList.add('visible');
    } else {
        searchClear.classList.remove('visible');
    }

    const filteredPlaylists = filterPlaylists(query);
    const sortedPlaylists = sortPlaylists(filteredPlaylists, currentSort);

    if (sortedPlaylists.length === 0 && query.length > 0) {
        displayNoResults(query);
    } else {
        renderPlaylistCards(sortedPlaylists);
    }
}

function handleSort() {
    const sortSelect = document.getElementById('sortSelect');
    currentSort = sortSelect.value;

    handleSearch();
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');

    searchInput.value = '';
    searchClear.classList.remove('visible');

    const sortedPlaylists = sortPlaylists(playlists, currentSort);
    renderPlaylistCards(sortedPlaylists);

    searchInput.focus();
}

function setupSearchListeners() {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');

    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);

        searchClear.addEventListener('click', clearSearch);

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                clearSearch();
            }
        });
    }
}

function setupSortListeners() {
    const sortSelect = document.getElementById('sortSelect');

    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
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
                model: 'google/gemma-4-31b-it:free',
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
    descriptionBtn.classList.add('loading');

    const description = await getPlaylistDescription(currentPlaylist);

    descriptionDiv.textContent = description;
    descriptionDiv.classList.remove('loading');
    descriptionBtn.classList.remove('loading');

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
    setupSearchListeners();
    setupSortListeners();
});
