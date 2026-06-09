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
    // Update cover image
    document.getElementById('featuredCover').src = playlist.playlist_art;
    document.getElementById('featuredCover').alt = playlist.playlist_name + ' cover';

    // Update playlist name and creator
    document.getElementById('featuredPlaylistName').textContent = playlist.playlist_name;
    document.getElementById('featuredCreator').textContent = 'by ' + playlist.playlist_creator;

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
