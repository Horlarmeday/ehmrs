# #41 manual pass: VoiceOver and keyboard

For the owner to run on a Mac in Chrome. About 45 minutes. Record anything that sounds wrong, is hard to reach, or traps you in the findings table at the end. Automated checks (axe) already pass on every screen; this pass is for how the screens sound and feel, which no tool can judge.

## Before you start

1. In a terminal: `cd client-vue3 && npm run dev`. Leave it running.
2. Open Chrome and go to `http://localhost:3000/kit-harness.html?view=archetypes&screen=list`.
3. Turn VoiceOver on and off with **Cmd + F5**.
4. VoiceOver keys, written **VO** below, are **Control + Option** held together.
   - **VO + Right / Left arrow**: next or previous item.
   - **VO + Space**: press the item VoiceOver is on.
   - **VO + U**: the rotor, a list of headings, links, form fields and landmarks. Use Left and Right to switch lists, Up and Down to choose, Enter to go.
   - **Tab / Shift + Tab**: move between controls without VoiceOver commands. Use both styles.
   - **Control**: stop VoiceOver talking.
5. If speech is too fast: VoiceOver Utility, Speech, Rate.

For each step, do it, listen, and compare with **Expect**. "Speaks" means roughly these words, not word for word.

## 1. App shell (`screen=list`)

| # | Do | Expect |
| --- | --- | --- |
| 1.1 | Reload the page, press Tab once | A "Skip to content" link appears top left and is spoken |
| 1.2 | Press Enter | Focus moves to the page content; the next Tab reaches the first control on the page, not the menu |
| 1.3 | VO + U, choose Landmarks | Lists "Main" navigation, a search, and the main content |
| 1.4 | Press `/` while focus is not in a field | Focus jumps to the patient search box; speaks "Find a patient by name, phone or hospital number, search text field" |
| 1.5 | Type `a/b` in that box | The slash is typed, focus stays |
| 1.6 | Tab to the account button | Speaks "Account: Pharm. Amina Yusuf, menu button" or similar |
| 1.7 | Press Enter, then Down arrow | A menu opens; speaks "Change password" then "Sign out". Escape closes it and focus returns to the button |
| 1.8 | In the sidebar, move to "Stock" | Speaks "Stock, current page" (it is the current section) |

## 2. List with filters (`screen=list`)

| # | Do | Expect |
| --- | --- | --- |
| 2.1 | VO + U, Headings | "Store items" is a level 1 heading |
| 2.2 | Move to the line under the filters | Speaks "47 records" |
| 2.3 | Tab to "Drug type", change it with Up/Down, then Tab away | After a moment the count is announced again with "1 filter on" (it is a live region) |
| 2.4 | Tab into the table and move through a row with VO + Right | Each cell is read with its column name, for example "Qty remaining, 29"; "Out of stock" is read where shown |
| 2.5 | Tab to a row checkbox and press Space | Speaks "Select Paracetamol 500mg, checked"; a bar appears; moving on reaches "1 selected" and "Clear selection" |
| 2.6 | Tab to the "Name" column header and press Enter | The table sorts; the header is announced as "sorted ascending" |
| 2.7 | Tab to the pagination and press Enter on "Page 2" | Speaks the page as current; the URL now has `page=2` |
| 2.8 | Press Enter on an item name | The item page opens and its title is the first thing announced or reachable |

## 3. Detail with tabs (continue from 2.8, or `screen=detail`)

| # | Do | Expect |
| --- | --- | --- |
| 3.1 | Find the tabs | Speaks "Item detail, selected, tab, 1 of 3" |
| 3.2 | Press Right arrow | Moves to "History, tab, 2 of 3" and opens it; after a moment the history table is reachable |
| 3.3 | Press End | Moves to "Logs" |
| 3.4 | Reload the page | The same tab is still open |
| 3.5 | Tab to "Store items" (the back link) and press Enter | Back on the list, on the same page you left |

## 4. Entry form (`screen=form`)

| # | Do | Expect |
| --- | --- | --- |
| 4.1 | Tab through the first section | Each field speaks its label, and "required" is in the label text as an asterisk; sections are announced by their headings |
| 4.2 | Tab to "Save item" and press Enter without filling anything | Focus jumps to a box that speaks "Fix 8 fields before saving" and lists the fields |
| 4.3 | Tab to "Quantity" in that list and press Enter | Focus moves to the Quantity field, which speaks its error "The quantity field is required" |
| 4.4 | Type 5 and Tab away | The error for Quantity disappears |
| 4.5 | Tab to "Cancel" and press Enter | An alert asks "Discard this item?"; focus is on "Keep editing" |
| 4.6 | Press Escape | The alert closes, nothing is lost, focus is back on Cancel |

## 5. Form in a dialog (`view=layout`)

Go to `http://localhost:3000/kit-harness.html?view=layout`.

| # | Do | Expect |
| --- | --- | --- |
| 5.1 | Tab to "Add ward" and press Enter | A dialog "Add ward" opens and focus is inside it |
| 5.2 | Keep pressing Tab | Focus stays inside the dialog and wraps round |
| 5.3 | Type a ward name, then press Escape | An alert asks "Discard your changes?" over the dialog |
| 5.4 | Choose "Discard" | Both close and focus returns to "Add ward" |

## 6. Worklist and the lab entry form (`view=lab-desk`)

Go to `http://localhost:3000/kit-harness.html?view=lab-desk`.

| # | Do | Expect |
| --- | --- | --- |
| 6.1 | Find "Tests in this sample" | A list of 5; "Full blood count" is announced as current |
| 6.2 | Tab to "Widal reaction", press Down arrow, then Up | Arrow keys move between tests in the list |
| 6.3 | Press Enter on "Stool microscopy" | Speaks the test, and a status message "Payment is pending, so results can't be entered for this test yet"; the result field is dimmed |
| 6.4 | Choose "Full blood count", Tab into the WBC field | Speaks "WBC, edit text" |
| 6.5 | Type 99999 | A "High" flag appears in the next cell; move to it with VO + Right and check it is read |
| 6.6 | Press Enter, then Down arrow | Focus moves down the Result column, row by row |
| 6.7 | At the bottom, use "Refer this test to another institute" | Speaks as a checkbox; Space ticks it and two new fields appear |

### Radio buttons with real arrow keys

Still on the lab desk:

| # | Do | Expect |
| --- | --- | --- |
| 6.8 | Choose the "Validate" stage at the top | The validation list appears |
| 6.9 | Tab to the first test's "Accept" option | Speaks "Accept, radio button, 1 of 2" and the group name |
| 6.10 | Press Right arrow (not Tab) | Moves to "Reject" and selects it; speaks "Reject, selected, radio button, 2 of 2" |
| 6.11 | Press Left arrow | Back to "Accept", selected |
| 6.12 | Press Tab | Focus leaves the group in one step, it does not stop on each option |

Also check the plain radio group at `view=pickers` ("Sex"): Tab in, Right arrow from Male to Female, and listen that it is announced as selected.

## 7. Touch (optional, Android tablet)

If a hospital tablet is to hand, open the same URLs with the dev machine's address on the hospital network, turn on TalkBack (Settings, Accessibility), and repeat 2.3, 4.2 and 6.3 by swiping. Note any target that is hard to tap.

## Findings

| # | Step | What happened | How bad (blocks, annoys, minor) |
| --- | --- | --- | --- |
| | | | |
