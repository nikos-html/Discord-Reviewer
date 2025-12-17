# Design Guidelines: Discord Feedback Collection App

## Design Approach
**Selected System:** Material Design with modern minimalist adaptations
**Rationale:** Utility-focused application requiring clear hierarchy, efficient forms, and trustworthy data presentation. Material Design provides excellent form patterns and feedback components while maintaining professional credibility.

## Core Design Principles
1. **Trust & Security:** Professional aesthetic reinforcing secure Discord integration
2. **Efficiency:** Streamlined paths for submitting and viewing feedback
3. **Clarity:** Unambiguous role-based access communication
4. **Polish:** Detailed, polished interface in Polish language

---

## Typography

**Primary Font:** Inter (Google Fonts)
- Headings (H1): 2.5rem (40px), font-weight 700
- Headings (H2): 2rem (32px), font-weight 600
- Headings (H3): 1.5rem (24px), font-weight 600
- Body: 1rem (16px), font-weight 400, line-height 1.6
- Small text/labels: 0.875rem (14px), font-weight 500
- Buttons: 1rem (16px), font-weight 600

**Secondary Font:** None needed - Inter handles all contexts

---

## Layout System

**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing (form elements): p-2, gap-2
- Standard spacing (cards, sections): p-6, p-8, gap-4
- Major spacing (page sections): py-12, py-16, gap-8

**Container Widths:**
- Forms/Authentication: max-w-md (448px)
- Feedback list: max-w-4xl (896px)
- Full-width wrapper: max-w-6xl with px-4

**Grid System:**
- Feedback list: Single column on mobile, 2-column grid on md+ (md:grid-cols-2)
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)

---

## Component Library

### Authentication Components
**Discord Login Card:**
- Centered card with shadow-lg, rounded-xl borders
- Discord logo/icon at top (80x80px placeholder)
- Heading "Zaloguj się przez Discord"
- Large, prominent Discord-branded button (full width, py-3)
- Blurred background on button if over hero image
- Subtle helper text below: "Używamy Discord OAuth2 dla bezpieczeństwa"

### Access Control Components
**Access Denied Card:**
- Warning icon (large, 64x64px)
- Clear heading: "Brak dostępu"
- Explanatory text: "Potrzebujesz roli 'Client' na serwerze aby wystawiać opinie"
- Secondary action: "Wróć" button

**Role Badge:**
- Small pill-shaped badge showing "Client" role
- Display near user avatar/name when authenticated

### Feedback Form
**Form Container:**
- Card with rounded-lg, shadow-md
- Padding: p-8
- Clear section heading: "Dodaj swoją opinię"

**Text Input:**
- Textarea: min-height 150px, rounded-lg border
- Placeholder: "Podziel się swoją opinią..."
- Character counter (optional): "0/500" in small text

**Star Rating Component:**
- 5 clickable stars in horizontal row
- Size: 32x32px each, gap-2
- States: empty outline, filled (gold/yellow treatment)
- Label: "Ocena (opcjonalna)"

**Submit Button:**
- Full width on mobile, inline on desktop
- Primary style: py-3, px-6, rounded-lg
- Text: "Wyślij opinię"

### Feedback Display
**Feedback Card:**
- Border, rounded-lg, shadow-sm
- Padding: p-6
- Layout: Avatar/User info at top, stars below, feedback text, timestamp at bottom

**Card Header:**
- Discord avatar (40x40px circle) + username
- Timestamp in small, muted text (e.g., "2 dni temu")

**Star Display:**
- Read-only stars (filled to match rating)
- Size: 20x20px each

**Feedback Text:**
- Body font, line-height 1.6
- Max 3 lines preview with "Czytaj więcej" expansion if needed

### Navigation
**Header:**
- Sticky top navigation (h-16)
- Logo/App name on left
- User avatar + name on right (when authenticated)
- Logout button (text style, subtle)

**Footer:**
- Minimal footer with app name and version
- Single row, center-aligned

### Status Messages
**Success Toast:**
- Green accent, rounded corners
- Checkmark icon + "Opinia została dodana"
- Auto-dismiss after 3s

**Error Message:**
- Red accent, rounded corners
- Alert icon + error description
- Dismissible X button

---

## Page Layouts

### Landing/Login Page
- Full-height centered layout (min-h-screen flex)
- Large Discord-themed illustration or abstract background (1200x800px)
- Login card centered over subtle gradient overlay
- App title and tagline above card

### Dashboard/Submit Page
- Standard header
- Main content: max-w-4xl centered
- Two-column layout on lg+: Feedback form (60%) | Recent submissions preview (40%)
- Single column on mobile

### Public Feedback List
- Header with page title "Opinie użytkowników"
- Optional filter/sort controls (newest first default)
- 2-column masonry grid (md+), single column (mobile)
- Pagination at bottom if >20 items

---

## Images

**Hero/Login Background:**
- Abstract geometric pattern or Discord-themed illustration
- Dimensions: 1920x1080px
- Placement: Full-width background on login page
- Treatment: Subtle gradient overlay (opacity 0.9) for text readability

**Discord Branding:**
- Official Discord logo for login button
- Size: 24x24px inline with button text

**User Avatars:**
- Fetched from Discord API
- Sizes: 40x40px (feedback cards), 32x32px (header)
- Rounded-full with border

**Placeholder Icons:**
- Star icons (rating system)
- Checkmark (success)
- Warning triangle (access denied)
- Alert circle (errors)
- Use Heroicons via CDN

---

## Accessibility
- All form inputs have visible labels
- Focus states with 2px outline offset
- ARIA labels on icon-only buttons
- Minimum touch target: 44x44px
- Semantic HTML throughout (main, nav, article, section)
- Polish language attributes (lang="pl")

---

## Responsive Behavior
- Mobile-first approach
- Single column layouts < 768px
- Grid layouts activate at md breakpoint
- Form remains max-w-md even on desktop (better UX)
- Touch-friendly spacing on mobile (minimum p-4)