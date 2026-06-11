let currentEditId = null;
let currentStep = 1;
let formSongs = [];

function showDeleteConfirmation(playlistID) {
    const playlist = playlists.find(p => p.playlistID === playlistID);
    if (!playlist) return;

    const confirmOverlay = document.getElementById('confirmOverlay');
    const confirmMessage = document.getElementById('confirmMessage');

    confirmMessage.textContent = `Delete "${playlist.playlist_name}"? This cannot be undone.`;
    confirmOverlay.classList.add('active');

    confirmOverlay.dataset.deleteId = playlistID;
}

function hideDeleteConfirmation() {
    const confirmOverlay = document.getElementById('confirmOverlay');
    confirmOverlay.classList.remove('active');
    delete confirmOverlay.dataset.deleteId;
}

function deletePlaylist(playlistID) {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
    }

    const card = document.querySelector(`[data-playlist-id="${playlistID}"]`);

    if (card) {
        card.classList.add('deleting');

        setTimeout(() => {
            const index = playlists.findIndex(p => p.playlistID === playlistID);
            if (index !== -1) {
                playlists.splice(index, 1);
            }

            const searchInput = document.getElementById('searchInput');
            const query = searchInput ? searchInput.value : '';
            const filteredPlaylists = filterPlaylists(query);
            const sortedPlaylists = sortPlaylists(filteredPlaylists, currentSort);
            renderPlaylistCards(sortedPlaylists);

            hideDeleteConfirmation();
        }, 400);
    }
}

function openAddPlaylistForm() {
    currentEditId = null;
    currentStep = 1;
    formSongs = [];

    document.getElementById('formTitle').textContent = 'Add New Playlist';
    document.getElementById('formOverlay').classList.add('active');

    resetForm();
    showStep(1);
}

function openEditPlaylistForm(playlistID) {
    const playlist = playlists.find(p => p.playlistID === playlistID);
    if (!playlist) return;

    currentEditId = playlistID;
    currentStep = 1;
    formSongs = [...playlist.songs];

    document.getElementById('formTitle').textContent = 'Edit Playlist';
    document.getElementById('formOverlay').classList.add('active');

    document.getElementById('playlistName').value = playlist.playlist_name;
    document.getElementById('playlistCreator').value = playlist.playlist_creator;
    document.getElementById('playlistCover').value = playlist.playlist_art;

    renderSongsForm();
    showStep(1);
}

function closeFormModal() {
    document.getElementById('formOverlay').classList.remove('active');
    resetForm();
}

function resetForm() {
    document.getElementById('playlistName').value = '';
    document.getElementById('playlistCreator').value = '';
    document.getElementById('playlistCover').value = '';
    formSongs = [];
    renderSongsForm();
}

function showStep(step) {
    document.querySelectorAll('.step').forEach((s, i) => {
        s.classList.remove('active', 'completed');
        if (i + 1 < step) s.classList.add('completed');
        if (i + 1 === step) s.classList.add('active');
    });

    document.querySelectorAll('.form-step').forEach((s, i) => {
        s.classList.toggle('active', i + 1 === step);
    });

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.style.display = step > 1 ? 'block' : 'none';
    nextBtn.style.display = step < 3 ? 'block' : 'none';
    submitBtn.style.display = step === 3 ? 'block' : 'none';

    if (step === 3) {
        renderPreview();
    }
}

function nextStep() {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && formSongs.length === 0) {
        alert('Please add at least one song');
        return;
    }

    currentStep++;
    showStep(currentStep);
}

function previousStep() {
    currentStep--;
    showStep(currentStep);
}

function validateStep1() {
    const name = document.getElementById('playlistName').value.trim();
    const creator = document.getElementById('playlistCreator').value.trim();
    const cover = document.getElementById('playlistCover').value.trim();

    if (!name || !creator || !cover) {
        alert('Please fill in all required fields');
        return false;
    }

    return true;
}

function renderSongsForm() {
    const container = document.getElementById('songsContainer');
    container.innerHTML = '';

    formSongs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-form-item';
        songItem.innerHTML = `
            <h4>
                Song ${index + 1}
                <button type="button" class="remove-song-btn" onclick="removeSong(${index})">×</button>
            </h4>
            <div class="form-group">
                <label>Title *</label>
                <input type="text" class="form-input" value="${song.title}" onchange="updateSong(${index}, 'title', this.value)">
            </div>
            <div class="form-group">
                <label>Artist *</label>
                <input type="text" class="form-input" value="${song.artist}" onchange="updateSong(${index}, 'artist', this.value)">
            </div>
            <div class="form-group">
                <label>Album *</label>
                <input type="text" class="form-input" value="${song.album}" onchange="updateSong(${index}, 'album', this.value)">
            </div>
            <div class="form-group">
                <label>Duration (MM:SS) *</label>
                <input type="text" class="form-input" value="${song.duration}" placeholder="3:45" onchange="updateSong(${index}, 'duration', this.value)">
            </div>
        `;
        container.appendChild(songItem);
    });
}

function addNewSong() {
    const newSong = {
        id: Date.now(),
        title: '',
        artist: '',
        album: '',
        duration: ''
    };
    formSongs.push(newSong);
    renderSongsForm();
}

function removeSong(index) {
    formSongs.splice(index, 1);
    renderSongsForm();
}

function updateSong(index, field, value) {
    if (formSongs[index]) {
        formSongs[index][field] = value;
    }
}

function renderPreview() {
    const name = document.getElementById('playlistName').value;
    const creator = document.getElementById('playlistCreator').value;
    const cover = document.getElementById('playlistCover').value;

    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = `
        <h3>${name}</h3>
        <p><strong>Creator:</strong> <span class="preview-value">${creator}</span></p>
        <p><strong>Cover:</strong> <span class="preview-value">${cover}</span></p>
        <p><strong>Songs:</strong> <span class="preview-value">${formSongs.length}</span></p>
        <div class="preview-songs">
            ${formSongs.map((song, i) => `
                <div class="preview-song">
                    <div class="preview-song-title"><strong>${i + 1}. ${song.title}</strong> - <span class="preview-artist">${song.artist}</span></div>
                    <div class="preview-song-details"><small>${song.album} • ${song.duration}</small></div>
                </div>
            `).join('')}
        </div>
    `;
}

function submitPlaylist() {
    const name = document.getElementById('playlistName').value.trim();
    const creator = document.getElementById('playlistCreator').value.trim();
    const cover = document.getElementById('playlistCover').value.trim();

    const validSongs = formSongs.filter(song =>
        song.title.trim() && song.artist.trim() && song.album.trim() && song.duration.trim()
    );

    if (validSongs.length === 0) {
        alert('Please add at least one complete song');
        return;
    }

    if (currentEditId) {
        const index = playlists.findIndex(p => p.playlistID === currentEditId);
        if (index !== -1) {
            playlists[index] = {
                ...playlists[index],
                playlist_name: name,
                playlist_creator: creator,
                playlist_art: cover,
                songs: validSongs
            };
        }
    } else {
        const newId = Math.max(...playlists.map(p => p.playlistID), 0) + 1;
        const newPlaylist = {
            playlistID: newId,
            playlist_name: name,
            playlist_creator: creator,
            playlist_art: cover,
            likeCount: 0,
            songs: validSongs
        };
        playlists.push(newPlaylist);
    }

    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value : '';
    const filteredPlaylists = filterPlaylists(query);
    const sortedPlaylists = sortPlaylists(filteredPlaylists, currentSort);
    renderPlaylistCards(sortedPlaylists);

    closeFormModal();
}

function setupPlaylistManagement() {
    document.getElementById('confirmCancel').addEventListener('click', hideDeleteConfirmation);
    document.getElementById('confirmDelete').addEventListener('click', () => {
        const confirmOverlay = document.getElementById('confirmOverlay');
        const deleteId = parseInt(confirmOverlay.dataset.deleteId);
        if (deleteId) {
            deletePlaylist(deleteId);
        }
    });

    document.getElementById('addPlaylistFab').addEventListener('click', openAddPlaylistForm);

    document.getElementById('formClose').addEventListener('click', closeFormModal);
    document.getElementById('prevBtn').addEventListener('click', previousStep);
    document.getElementById('nextBtn').addEventListener('click', nextStep);
    document.getElementById('submitBtn').addEventListener('click', submitPlaylist);
    document.getElementById('addSongBtn').addEventListener('click', addNewSong);

    document.getElementById('confirmOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'confirmOverlay') hideDeleteConfirmation();
    });

    document.getElementById('formOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'formOverlay') closeFormModal();
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.card-delete-btn')) {
            e.stopPropagation();
            const btn = e.target.closest('.card-delete-btn');
            const playlistID = parseInt(btn.dataset.playlistId);
            showDeleteConfirmation(playlistID);
        }

        if (e.target.closest('.card-edit-btn')) {
            e.stopPropagation();
            const btn = e.target.closest('.card-edit-btn');
            const playlistID = parseInt(btn.dataset.playlistId);
            openEditPlaylistForm(playlistID);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPlaylistManagement);
} else {
    setupPlaylistManagement();
}
