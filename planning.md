## Music Playlist Explorer — Planning Spec

### Data Shape

#### Playlist Object
- `playlistID` (number) — unique identifier for the playlist
- `playlist_name` (string) — display name of the playlist
- `playlist_creator` (string) — name of the person who created the playlist
- `playlist_art` (string) — URL or path to the playlist cover image
- `likeCount` (number) — number of likes the playlist has received
- `songs` (array of song objects) — collection of songs in this playlist

#### Song Object
- `id` (number) — unique identifier for the song
- `title` (string) — name of the song
- `artist` (string) — name of the artist who performed the song
- `album` (string) — name of the album the song belongs to
- `duration` (string) — length of the song in MM:SS format

### UI and Interaction Rules
homepage
- navigation bar
- playlist grid

playlist card interactions
- clicking a playlist card
- clicking outside the modal

playlist detail modal
- shuffle button
- get description button

like/heart icon rules
- clikcing the heart icon on a playlist card
- does not open the modal
- immediately reflected in the UI

featured page interaction rules
- displays one randomly selected playlist
- on page load or refresh, new random selection is triggered

website should be
- intuitive
- clean
- modern

### Function Specs

#### `renderPlaylistCards(playlists)`
**Purpose:** Dynamically creates and displays playlist cards on the homepage.

**Inputs:**
- `playlists` (array of playlist objects) — the array of playlists to render

**Outputs/Effects:**
- Returns: nothing (void function)
- DOM effect: appends playlist card elements to the `.playlist-cards` container
- Side effect: clears existing content in `.playlist-cards` before rendering

**Data Used from Playlist Object:**
- `playlistID` — set as `data-playlist-id` attribute on the card
- `playlist_art` — used for the cover image `src`
- `playlist_name` — displayed as the card title and image alt text
- `playlist_creator` — displayed as the author/creator name
- `likeCount` — displayed as the number next to the heart icon

**Behavior:**
- If the `playlists` array is empty, displays a "No playlists found" message
- Each card should have the class `playlist-card` and be clickable
- Heart icon should be empty/outlined (♡) initially

---

#### `populateModal(playlist)`
**Purpose:** Populates the modal with detailed information about a specific playlist.

**Inputs:**
- `playlist` (playlist object) — the playlist to display in the modal

**Outputs/Effects:**
- Returns: nothing (void function)
- DOM effect: updates multiple elements within the modal structure
- Does NOT open the modal (that's handled separately)

**DOM Elements Updated:**
- `#modalCover` — set `src` to `playlist.playlist_art` and `alt` to playlist name
- `#modalPlaylistName` — set text content to `playlist.playlist_name`
- `#modalPlaylistAuthor` — set text content to `playlist.playlist_creator`
- `#modalSongs` — populate with a list of song elements from `playlist.songs` array

**Song List Structure:**
Each song should display:
- Song title (bold/prominent)
- Artist name
- Album name
- Duration

**Expected Modal State After Execution:**
- Modal header shows playlist cover image and metadata
- Song list is fully populated with all songs from the playlist
- All text fields are populated (no empty elements)
- If playlist has no songs, display "No songs in this playlist"

---

#### `openModal(playlistID)`
**Purpose:** Opens the modal and displays the playlist with the given ID.

**Inputs:**
- `playlistID` (number) — the ID of the playlist to display

**Outputs/Effects:**
- Returns: nothing (void function)
- Finds the playlist in the global `playlists` array
- Calls `populateModal()` with the found playlist
- Adds `.active` class to `.modal-overlay` to make it visible

**Behavior:**
- If playlist with given ID is not found, log error and do not open modal

---

#### `closeModal()`
**Purpose:** Closes the modal and hides it from view.

**Inputs:** None

**Outputs/Effects:**
- Returns: nothing (void function)
- Removes `.active` class from `.modal-overlay` to hide it

**Behavior:**
- Can be called even if modal is already closed (idempotent)

---

#### `toggleLike(playlistID, heartIcon)`
**Purpose:** Toggles the like state for a playlist when the heart icon is clicked.

**Inputs:**
- `playlistID` (number) - the ID of the playlist being liked/unliked
- `heartIcon` (DOM element) — the heart icon element that was clicked

**Outputs/Effects:**
- Returns: nothing (void function)
- Data model change: increments or decrements `likeCount` in the playlist object
- DOM change: updates the like count display and heart icon appearance

**Branch 1: Unliked → Liked**
When a user clicks an unliked heart icon:
- **Data:** Increment `playlist.likeCount` by 1
- **DOM:** 
  - Change heart icon from ♡ to ♥ (or add `.liked` class)
  - Update like count display to show new value
- **Visual:** Heart icon turns red

**Branch 2: Liked → Unliked**
When a user clicks a liked heart icon:
- **Data:** Decrement `playlist.likeCount` by 1
- **DOM:**
  - Change heart icon from ♥ to ♡ (or remove `.liked` class)
  - Update like count display to show new value
- **Visual:** Heart icon returns to default color

**Constraints:**
- Each playlist can only be liked once at a time per user
- Like count cannot go below 0 (prevent negative likes)
- State tracked by presence/absence of `.liked` class on heart icon
- Clicking the heart should NOT open the modal (event propagation stopped)

---

#### `shuffleSongs(songs)`
**Purpose:** Returns a new array with songs in randomized order (Fisher-Yates shuffle algorithm).

**Inputs:**
- `songs` (array of song objects) — the original array of songs to shuffle

**Outputs:**
- Returns: new array with songs in random order
- Does NOT mutate the original array

**Algorithm:**
- Uses Fisher-Yates shuffle for true randomness
- Each shuffle produces a different order (not deterministic)

**Behavior:**
- If empty array or single song, returns a copy of the input
- Creates a copy of the input array to avoid mutation

---

#### `handleShuffleClick()`
**Purpose:** Handles the shuffle button click event in the modal.

**Inputs:** None (reads current modal state)

**Outputs/Effects:**
- Returns: nothing (void function)
- DOM effect: re-renders the song list in the modal with shuffled order
- Does NOT modify the original playlist data in the `playlists` array

**Original Order Preservation:**
- Original song order is preserved in the `playlists` array (never modified)
- Shuffle only affects the current modal display
- Closing and reopening the modal shows the original order again

**Multi-Shuffle Behavior:**
- Each click produces a new random shuffle
- User can shuffle unlimited times
- Each shuffle is independent (not relative to previous shuffle)

**UI After Shuffling:**
- Song list in modal re-renders with new order
- All song information remains intact (title, artist, album, duration)
- Visual feedback: songs appear in different positions

---

#### `selectRandomPlaylist(playlists)`
**Purpose:** Selects a random playlist from the playlists array.

**Inputs:**
- `playlists` (array of playlist objects) — the array to select from

**Outputs:**
- Returns: a single randomly selected playlist object
- Returns `null` if array is empty or undefined

**Behavior:**
- Uses `Math.random()` to select random index
- Each playlist has equal probability of being selected
- Called on page load/refresh to ensure new selection each time

---

#### `displayFeaturedPlaylist(playlist)`
**Purpose:** Displays the featured playlist details on the Featured page.

**Inputs:**
- `playlist` (playlist object) — the playlist to display

**Outputs/Effects:**
- Returns: nothing (void function)
- DOM effect: updates featured playlist section with cover, name, creator, and songs

**DOM Elements Updated:**
- `#featuredCover` — large featured playlist cover image
- `#featuredPlaylistName` — playlist name (large heading)
- `#featuredCreator` — playlist creator name
- `#featuredSongs` — song list container (all songs displayed)

**Layout:**
- Left side: Large playlist cover + name + creator
- Right side: Full song list with all details

---

#### `getPlaylistDescription(playlist)`
**Purpose:** Calls OpenRouter API to generate an AI-powered description for a playlist.

**Inputs:**
- `playlist` (playlist object) — the playlist to describe

**Outputs:**
- Returns: Promise that resolves to description string or error message
- Async function (uses `await`)

**API Details:**
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Model: `google/gemma-2-9b-it:free` (free OpenRouter model)
  - Alternative free models: `meta-llama/llama-3.3-70b-instruct:free`
- Method: POST
- Headers: Authorization (Bearer token), Content-Type (application/json)
- Cost: Free tier (no billing required)

**Prompt Structure:**
```
You are a music curator analyzing a playlist.

Playlist: {playlist_name}
Created by: {playlist_creator}

Songs:
- {song.title} by {song.artist} (from {song.album})
[... for each song]

Generate a 2-3 sentence description that captures the vibe, mood, and theme of this playlist. Do not list individual songs. Focus on the overall feeling and genre connections.
```

**Error Handling:**
- Network error: Return fallback message from AI Feature Spec
- Invalid response: Return fallback message
- Empty response: Return fallback message
- Log all errors to console with details

**Behavior:**
- Does NOT update DOM directly (caller handles that)
- Pure function pattern: takes input, returns output
- All errors handled gracefully (no exceptions thrown to caller)

### Featured Page Layout

**Structure:**
- Same header and footer as All Playlists page for consistency
- Main content split into two sections:
  - **Left panel (40%):** Large featured playlist cover image, playlist name (large heading), creator name
  - **Right panel (60%):** Complete song list with title, artist, album, duration

**Navigation:**
- Navigation bar in header contains links to:
  - "All Playlists" (index.html)
  - "Featured" (featured.html)
- Active link indicates current page
- Same navigation appears on both pages for consistency

**Random Selection Behavior:**
- On each page load or refresh, new random playlist is selected
- Random selection happens automatically (no user action required)
- Each playlist has equal chance of being featured

**Responsive Behavior:**
- Two-column layout on desktop
- Stack vertically on mobile (cover on top, songs below)

### AI Feature Spec (Milestone 8)

**Role:**
The AI acts as a music curator and playlist analyst who understands music genres, vibes, and thematic connections between songs.

**Task:**
Generate a 2-3 sentence description for a music playlist that captures its overall vibe, mood, and theme based on the playlist name, creator, and list of songs (titles, artists, albums).

**Inputs:**
- Playlist name (string)
- Playlist creator (string)
- Array of songs, each containing:
  - Song title
  - Artist name
  - Album name

**Output Format:**
- 2-3 concise sentences
- Should capture the vibe/mood/theme of the playlist
- Written in engaging, natural language (not marketing copy)
- Should feel personal and specific to this playlist

**Constraints:**
- DO NOT list individual songs by name
- DO NOT use generic marketing language ("perfect for any occasion", "you'll love this")
- DO NOT mention the number of songs in the playlist
- DO NOT be overly formal or technical
- Should focus on the emotional tone, genre, or themes connecting the songs

**Failure Behavior:**
- If API call fails: Display "Unable to generate description. Please try again later."
- If model returns empty/invalid response: Display "Description unavailable at this time."
- Show error in the same location where description would appear (don't use alerts)
- Log error to console for debugging

**Loading State:**
- Show "Generating description..." text with subtle loading indicator
- Disable "Get Description" button while loading
- Replace loading text with description or error message when complete

### Decisions Log

#### MILESTONE 1
- Header contains navbar with title and navigation links (All Playlists, Featured)
- Main section uses `.playlist-cards` container for grid layout
- Footer with copyright information
- Modal structure includes:
  - `.modal-overlay` — full-screen overlay with semi-transparent background
  - `.modal-content` — centered floating container
  - `.modal-close` — close button positioned absolutely in top-right
  - `.modal-header` — flex layout with cover image and info section
  - `.modal-actions` — buttons for shuffle and get description
  - `.modal-songs` — container for song list (populated dynamically later)

#### MILESTONE 2
**Color Scheme:**
- Primary: #8b5cf6 (purple/violet) for header and primary actions
- Secondary: #3498db (blue) for secondary actions (description button)
- Neutral: #333 (dark gray) for footer, #666 (medium gray) for secondary text, white for cards
- Background: #f8f8f8 (light gray)

**Layout & Spacing:**
- Page uses flexbox column layout with `min-height: 100vh` to push footer to bottom
- Max-width of 1200px for content, centered with auto margins
- Consistent spacing: 2rem for gaps between cards, 1rem for internal padding
- Responsive grid: `repeat(auto-fill, minmax(250px, 1fr))` adapts to screen size

**Visual Hierarchy:**
1. **Header** — Purple background (#8b5cf6), white text, subtle shadow for depth
2. **Main content** — Light gray background, white cards create contrast
3. **Footer** — Dark background (#333) to clearly separate from content

**Playlist Cards:**
- White cards with 8px rounded corners
- Cover images: 250px height, `object-fit: cover` to maintain aspect ratio
- Subtle shadow: `0 2px 8px rgba(0,0,0,0.1)`
- Hover effect: lift by 4px + enhanced shadow for tactile feedback
- Heart icon changes color on hover to indicate interactivity

**Modal Design:**
- Overlay: 70% opacity black (`rgba(0, 0, 0, 0.7)`) to dim background
- Content: White, 12px rounded corners, generous padding (2rem)
- Max-width: 800px, max-height: 90vh with scrolling for overflow
- Elevated shadow: `0 8px 32px rgba(0,0,0,0.3)` for depth
- Close button: Large (2rem font), positioned absolutely, changes color on hover

**Interactive Elements:**
- All transitions: 0.2s for smooth, responsive feel
- Navigation links: subtle hover background (`rgba(255, 255, 255, 0.1)`)
- Active nav link: slightly stronger background (`rgba(255, 255, 255, 0.2)`)
- Buttons: distinct colors, darken on hover for feedback

#### MILESTONE 3

**Data Management:**
- Created `data/data.json` containing array of playlist objects
- All playlist objects match the defined schema exactly
- Used `fetch()` API to load JSON asynchronously
- Global `playlists` array stores loaded data

**Implementation Approach:**
- Separated concerns: `loadPlaylists()` handles data fetching, `renderPlaylistCards()` handles rendering, `createPlaylistCard()` creates individual cards
- Error handling: try/catch for fetch failures with user-friendly error message
- Empty state: "No playlists found" message when array is empty

**DOM Manipulation:**
- Removed hard-coded sample card from HTML
- Container cleared before each render to prevent duplicates
- Each card created with `createElement()` and `innerHTML` for template
- `data-playlist-id` attribute set for future interactions

---

#### MILESTONE 4

**Modal Population Strategy:**
- Separated concerns: `populateModal()` handles data → DOM, `openModal()` handles visibility
- `createSongElement()` helper function generates individual song items
- Modal population happens before modal is shown (ensures smooth appearance)

**Event Handling Approach:**
- Event delegation: Single click listener on document for all playlist cards (efficient, works with dynamic content)
- Overlay click: Checks `e.target === modalOverlay` to only close when clicking outside content
- Close button: Direct event listener on `#modalClose`

**Song List Design:**
- Each song item displays: title (bold), artist + album (secondary text), duration (right-aligned)
- Hover effect on song items for interactivity feedback
- Border between items, removed on last item for clean appearance
- Empty state: Shows message if playlist has no songs

**DOM Updates:**
- Modal content cleared and repopulated each time
- Uses `innerHTML` for efficiency when replacing all songs at once
- All modal fields updated (cover, name, creator, songs) to ensure consistency

**User Experience:**
- Modal can be closed multiple ways (overlay click, close button) for flexibility
- Clicking anywhere on a card opens the modal (not just specific elements)
- Modal prevents click-through: overlay click check ensures content clicks don't close modal

---

#### MILESTONE 5

**Toggle State Management:**
- Like state tracked by presence of `.liked` class on heart icon (simple, reliable)
- Two distinct branches: unliked → liked (increment), liked → unliked (decrement)
- State persists in both data model and DOM simultaneously

**Data Integrity:**
- Like count updates in the global `playlists` array (source of truth)
- `Math.max(0, count - 1)` prevents negative like counts
- Each playlist can be liked/unliked unlimited times, but only counts as 1 like at a time

**Visual Feedback:**
- Heart icon changes: ♡ (unliked) ↔ ♥ (liked)
- Color change: default → red (#e74c3c) when liked via `.liked` class
- Like count updates immediately on click for instant feedback

**Event Handling Strategy:**
- Event delegation: Single listener handles all heart icons efficiently
- `e.stopPropagation()` prevents modal from opening when clicking heart
- Event check order: heart icon first (with early return), then card
- Ensures clicking heart only toggles like, clicking card (except heart) opens modal

---

#### MILESTONE 6

**Shuffle Algorithm:**
- Fisher-Yates shuffle for true randomness (unbiased distribution)
- Time complexity: O(n) where n is number of songs
- Each position has equal probability of containing any song

**Data Immutability:**
- Original playlist data in `playlists` array is never modified
- `shuffleSongs()` creates a copy with spread operator `[...songs]`
- Shuffle only affects the current modal view, not the source data
- Closing and reopening modal restores original order

**Multi-Shuffle Design:**
- Each shuffle generates completely new random order
- Not relative to previous shuffle (always starts from original)
- Unlimited shuffles allowed
- Each shuffle is independent (true randomization every time)

**Implementation Approach:**
- Separated concerns: `shuffleSongs()` is pure function (no side effects), `handleShuffleClick()` handles DOM updates
- `handleShuffleClick()` identifies current playlist by matching modal title with playlist name
- Re-uses `createSongElement()` helper for consistency
- Clears and rebuilds song list (simple, reliable approach)

**User Experience:**
- Shuffle button in modal next to "Get Description" button
- Purple theme matches primary action color (#8b5cf6)
- Immediate visual feedback: songs jump to new positions
- Works on playlists of any size (including edge cases: 0, 1, 2+ songs)
- Original order always recoverable (just close and reopen modal)

---

#### MILESTONE 7

**Page Structure:**
- Created separate `featured.html` file with own JavaScript (`featured.js`)
- Reuses existing `style.css` for consistency
- Same header/footer structure as All Playlists page

**Layout Design:**
- Two-column grid layout: 40% left (cover + metadata), 60% right (song list)
- Left panel uses `position: sticky` to keep cover visible while scrolling songs
- Large, prominent cover image (max 400px, square aspect ratio)
- Right panel: white card with rounded corners, contains song list
- "Songs" heading with purple underline for visual hierarchy

**Random Selection Implementation:**
- `selectRandomPlaylist()` uses `Math.random()` for equal probability
- Called automatically on page load (DOMContentLoaded)
- Each page load/refresh generates new random selection
- Returns `null` for empty array (graceful handling)

**Code Reuse:**
- Created `shared.js` for common utilities
- `createSongElement()` extracted to `shared.js` (used by both `script.js` and `featured.js`)
- Both HTML pages load `shared.js` before their page-specific scripts
- Eliminates code duplication while maintaining independence of page logic
- Same song item structure and styling across all pages
- Consistent data loading pattern with error handling

**Navigation:**
- Both pages have identical navigation bars
- `.active` class indicates current page
- Purple background on active link for visual feedback
- Users can freely navigate between pages

**Responsive Design:**
- Desktop: side-by-side layout (grid 40/60)
- Mobile (< 768px): stacked layout (cover on top, songs below)
- Cover size adjusts on mobile (300px max)
- Left panel loses sticky positioning on mobile for better flow

**User Experience:**
- Fresh random playlist every time user visits Featured page
- Large cover image for visual impact
- Sticky cover keeps playlist identity visible while browsing songs
- Clean, focused presentation (no cards, no modals, no interactions)
- Consistent typography and spacing with rest of app

---

#### STRETCH: Audio Playback (30-Second Previews)

**Goal:** Allow users to play 30-second preview clips of songs directly in the browser using Deezer's preview URLs.

**Data Shape Updates:**

**Song Object (Extended):**
- Add `preview_url` (string|null) — URL to 30-second audio preview clip from Deezer
- Note: Not all songs have preview URLs (some older/indie tracks may return null)

**Global State:**
- `currentAudio` (Audio object|null) — HTML5 Audio element for currently playing song
- `currentSongId` (number|null) — ID of currently playing song

---

**UI Components:**

**Play/Pause Button:**
- Appears as icon button on each song item (modal and featured page)
- Icon states:
  - ▶ (play) — when song is not playing
  - ⏸ (pause) — when this song is playing
- Position: Left side of song item, before song title
- Styling: Purple (#8b5cf6) when active, gray when inactive
- Disabled state: Gray with "Preview unavailable" tooltip when `preview_url` is null

**Visual Feedback:**
- Currently playing song highlighted with subtle purple background (rgba(139, 92, 246, 0.1))
- Play button for active song shows pause icon
- All other songs show play icon
- Loading spinner briefly shown while fetching preview URL (first play only)

**Behavior Rules:**
- Only one song can play at a time across entire app
- Clicking play on Song A while Song B is playing:
  1. Stops Song B
  2. Resets Song B's UI to play icon
  3. Starts Song A
  4. Updates Song A's UI to pause icon
- Clicking pause on currently playing song stops it and resets UI
- Song auto-stops at end of preview (30 seconds)
- Preview URLs fetched on-demand (when user first clicks play)

---

**Function Specs:**

##### `searchDeezerTrack(title, artist)`
**Purpose:** Searches Deezer for a track and returns preview URL using JSONP to bypass CORS restrictions.

**Inputs:**
- `title` (string) — song title
- `artist` (string) — artist name

**Outputs:**
- Returns: Promise resolving to preview URL string or null
- Returns `null` if not found or API call fails

**API Details:**
- Endpoint: `https://api.deezer.com/search`
- Query params: `q=${title} ${artist}&limit=1&output=jsonp&callback=${callbackName}`
- Method: JSONP (dynamic script tag injection)
- No authentication required (free public API)

**Behavior:**
- Uses JSONP workaround to avoid CORS restrictions
- Creates unique callback function name per request: `deezerCallback_${timestamp}_${random}`
- Dynamically injects script tag into document head
- Cleans up callback function and script tag after response
- URL-encodes query parameters
- Takes first result (best match)
- Extracts `preview` field from `data[0].preview`
- Returns null if no results or missing preview

**Error Handling:**
- Script load error: Log error, clean up, return null
- No results found: Log warning, return null
- All errors handled gracefully (no exceptions thrown to caller)

**Implementation Pattern:**
```javascript
const callbackName = `deezerCallback_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

window[callbackName] = (data) => {
  delete window[callbackName];
  document.head.removeChild(script);
  resolve(data.data[0]?.preview || null);
};

const script = document.createElement('script');
script.src = `https://api.deezer.com/search?q=${query}&limit=1&output=jsonp&callback=${callbackName}`;
document.head.appendChild(script);
```

---

##### `togglePlayPause(songId, songTitle, songArtist, button)`
**Purpose:** Handles play/pause button clicks on song items.

**Inputs:**
- `songId` (number) — unique ID of the song
- `songTitle` (string) — song title for Deezer search
- `songArtist` (string) — artist name for Deezer search
- `button` (DOM element) — the play button that was clicked

**Outputs/Effects:**
- Returns: Promise (async function)
- Side effects: plays/pauses audio, updates UI, fetches preview URL if needed

**Branch 1: This Song is Currently Playing and Not Paused**
- Pause `currentAudio`
- Update this song's play button to play icon (▶)
- Remove `.playing` class from song item
- Return early (keep audio object for resume)

**Branch 2: This Song is Currently Playing but Paused**
- Resume `currentAudio` playback
- Update button to pause icon (⏸)
- Add `.playing` class back to song item
- Return early

**Branch 3: Different Song Playing (or No Song Playing)**
- If another song is playing:
  - Pause `currentAudio`
  - Reset old song's UI
- Check if this song already has `preview_url` stored (data attribute on button)
- If not:
  - Show loading state on button (⏳ spinner)
  - Disable button temporarily
  - Call `searchDeezerTrack(title, artist)`
  - Store result in button's data attribute
  - Re-enable button
- If `preview_url` is null:
  - Disable button permanently
  - Show 🚫 icon
  - Set tooltip "Preview unavailable"
  - Show toast notification
  - Return early
- Create new Audio element with `preview_url`
- Clear `playlistQueue` (stops playlist mode when manually selecting a song)
- Set global state (`currentAudio`, `currentSongId`)
- Update button to pause icon (⏸)
- Add `.playing` class to song item
- Update now playing bar with playlist and song info
- Start playback

**Event Listeners (on audio element):**
- `ended`: Reset UI when preview finishes, clear current song, hide now playing bar
- `error`: Log error, show error toast, reset UI, clear current song, hide now playing bar

---

##### `resetSongUI(songId)`
**Purpose:** Resets a song's play button and highlight to default state.

**Inputs:**
- `songId` (number) — song to reset

**Outputs/Effects:**
- Finds song item by `data-song-id` attribute
- Changes play button icon to ▶
- Removes `.playing` class from song item
- Removes `.active` class from button

---

**Decisions Log:**

**Why Deezer Instead of Spotify?**
- Deezer API is free with no authentication required
- Spotify requires OAuth2 Client Credentials flow (more complex)
- Spotify requires app registration and API credentials
- Deezer preview URLs are publicly accessible (no tokens needed)
- Simpler for student projects (no secrets to manage)

**Why JSONP Workaround?**
- Deezer API has CORS restrictions that block direct `fetch()` calls from browsers
- JSONP (JSON with Padding) bypasses CORS by loading data as a script
- Older technique but still supported by Deezer's API (`output=jsonp` parameter)
- Modern alternatives (proxy server, CORS proxy) would require additional infrastructure
- Trade-off: Slightly less elegant code, but works without backend

**How JSONP Works:**
1. Create a unique global callback function name
2. Add that function to `window` object
3. Dynamically inject a `<script>` tag with the API URL + callback parameter
4. Browser loads the script, which calls the callback with data
5. Clean up: delete callback from `window`, remove script tag from DOM
6. Return data through Promise resolution

**Why not Web Playback SDK?**
- Requires Spotify Premium for users
- More complex OAuth flow with user login
- Overkill for 30-second previews
- HTML5 Audio is simpler and works for all users

**Why On-Demand Preview Fetching?**
- Reduces initial API calls (only fetch when user wants to play)
- Faster page load
- User may never play most songs
- Trade-off: Slight delay on first play (mitigated with loading state)
- Alternative considered: Pre-fetch all previews on modal open (too many API calls)

**Why Single Global Audio Element?**
- Browser best practice: only one audio context at a time
- Prevents overlapping audio chaos
- Simpler state management (one source of truth)
- Matches expected UX (pause current when starting new)

**Preview URL Storage:**
- Stored in button's `data-preview-url` attribute after first fetch
- Avoids duplicate API calls for same song
- Not persisted across modal opens/closes (keeps code simple)
- Alternative considered: Store in song object (more persistent, but mutates data)

**Unique Callback Names:**
- Each JSONP request generates unique callback: `deezerCallback_${timestamp}_${random}`
- Prevents conflicts when multiple requests are made simultaneously
- Timestamp + random string ensures uniqueness
- Example: `deezerCallback_1686237465123_kj4n8x2p`

---