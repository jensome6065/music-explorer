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
