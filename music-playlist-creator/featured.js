let playlists = [];

// Load playlist data
async function loadPlaylists() {
    try {
        const response = await fetch('data/data.json');
        playlists = await response.json();

        // Select and display a random playlist
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

// Select a random playlist from the array
function selectRandomPlaylist(playlists) {
    if (!playlists || playlists.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * playlists.length);
    return playlists[randomIndex];
}

// Display the featured playlist
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

    // Update playlist name and creator with fade-in
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

    // Populate song list
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

// Display a message
function displayMessage(message) {
    const featuredSongs = document.getElementById('featuredSongs');
    featuredSongs.innerHTML = `<p style="text-align: center; color: #666; font-size: 1.2rem; padding: 2rem;">${message}</p>`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadPlaylists);
