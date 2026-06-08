## Music Playlist Explorer — Planning Spec

### Data Shape
[Leave blank — fill in before Milestone 3]

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
[Add function specs here as you plan each milestone]

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
