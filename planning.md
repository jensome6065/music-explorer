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

### AI Feature Spec (Milestone 8)
[Leave blank — fill in before Milestone 8]

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
