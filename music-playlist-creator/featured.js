let playlists = [];

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

function displayFeaturedPlaylist(playlist) {
    // Update cover image with fade-in effect
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

    const featuredSongs = document.getElementById('featuredSongs');
    featuredSongs.innerHTML = '';

    if (!playlist.songs || playlist.songs.length === 0) {
        featuredSongs.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No songs in this playlist</p>';
        return;
    }

    playlist.songs.forEach(song => {
        const songElement = createSongElement(song);
        featuredSongs.appendChild(songElement);
    });
}

function displayMessage(message) {
    const featuredSongs = document.getElementById('featuredSongs');
    featuredSongs.innerHTML = `<p style="text-align: center; color: #666; font-size: 1.2rem; padding: 2rem;">${message}</p>`;
}

document.addEventListener('DOMContentLoaded', loadPlaylists);
