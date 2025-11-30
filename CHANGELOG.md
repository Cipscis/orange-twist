# Orange Twist Changelog

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.4] - TBD

### Changed

* Updated development dependency packages
* Updated Markdown rendering and code syntax highlighting packages

## [1.6.3] - 2025-02-01

### Changed

* Reduced DOM size to improve performance

### Fixed

* The most recent "Past day" and closest "Future day" are no longer missing from their respective sections.

## [1.6.2] - 2025-01-23

### Changed

* Previous and future days (outside a window of 3 behind and 3 ahead of the current day) are hidden by default. These, and finished tasks, are now completely removed from the DOM when their sections are unhidden, in order to improve UI performance
* No more than one "Saved" message will display at a time
* Added additional context to some alert messages

### Fixed

* "Toast" messages no longer seem to disappear behind day titles on mobile
* The "Move up" button on touch devices will no longer appear to move as tasks with long names are reordered

## [1.6.1] - 2025-01-03

### Added

* Where supported, task status options use CSS anchor positioning to try fallback positions and remain within the viewport

### Changed

* When `field-sizing: content` is supported, Orange Twist uses CSS instead of JS to control the size of notes while they're being edited
* When running Orange Twist locally without a `.env` file, one will be created automatically

### Fixed

* The performance of `decodeDayTaskKey` should be improved, which will hopefully help improve overall performance

## [1.6.0] - 2024-08-21

### Added

* Importing and exporting now includes image data

### Fixed

* Multiple templates with arguments on the same line now render correctly

## [1.5.7] - 2024-08-07

### Fixed

* Task links (and any navigation that involves a redirect) will no longer be broken by the service worker

## [1.5.6] - 2024-08-06

### Changed

* Production service worker now uses "cache-first" strategy instead of "network-first"
* Changed appearance of initial rendering to improve perceived speed

## [1.5.5] - 2024-08-03

### Changed

* Sped up initial rendering
* Reduced JavaScript bundle sizes
* Minified CSS

## [1.5.4] - 2024-08-01

### Fixed

* Improved speed of initial render
* Fixed a performance bug on task detail pages

## [1.5.3] - 2024-07-21

### Fixed

* Tasks can now be reordered on touch devices
* Task links will no longer get stuck in a "No task with ID X" state on initial load while there is image data.

### Changed

* Bumped dependencies to latest versions

## [1.5.2] - 2024-06-01

### Fixed

* Day summaries can now wrap on mobile
* Empty tool drawers no longer show
* Task links will no longer get stuck in a "No task with ID X" state on initial load.

## [1.5.1] - 2024-05-21

### Fixed

* Notes stay in editing mode while confirming whether or not to embed a large image

## [1.5.0] - 2024-05-21

### Added

* Images can now be embedded in notes
* The footer now includes a link to the changelog
* Development mode can now display framerate information

### Changed

* Data is now stored in IndexedDB instead of LocalStorage
* Bumped dependencies to latest versions
* Version number in footer is now read from package.json
* Completed tasks are now ordered with the most recent at the top

### Fixed

* "Request a feature" link now opens in a new tab
* Nested markdown lists with checkboxes have better spacing
* Tool drawers are larger and easier to open on intermediate devices
* Pressing "Escape" to cancel changes to an inline note now works correctly
* Syntax highlighting now works correctly for HTML and XML code blocks
* Improved performance of editing notes
* Cross-origin stylesheets being inserted (e.g. by browser extensions) longer cause JavaScript errors
* If data fails to load or save, the UI now displays an error message

## [1.4.1] - 2024-04-13

### Fixed

* Editing a template name no longer causes the "Saved" message to show on every character typed

## [1.4.0] - 2024-04-13

### Fixed

* The progress animation for toasts now works in Firefox
* Animations for hiding toasts and closing the task status picker now work in Firefox
* Improved spacing on help page

### Added

* Added the ability to create custom templates

### Changed

* "Add day" forms now use a date input

## [1.3.1] - 2024-03-22

### Fixed

* Fixed an error that could be caused by re-opening a completed task

## [1.3.0] - 2024-03-18

### Fixed

* Fixed collapsed space between formatted parts of task names

### Added

* Task detail view scrolls to current day automatically

## [1.2.1] - 2024-03-14

### Fixed

* Fixed incorrect rendering of task links in some circumstances

## [1.2.0] - 2024-03-14

### Added

* Added shortcodes for linking to tasks, e.g. `[[36]]`

### Fixed

* Tool drawer toggle buttons use a pointer cursor
* Inline code in task names won't appear small on task detail page

## [1.1.0] - 2024-03-10

### Changed

* New tasks now get added to the start of a day, not the end

### Added

* Completed tasks are now sorted by date of last update
* Main view scrolls to current day automatically

### Fixed

* Resolved random sync failures in multi-tab editing caused by browser race condition
* Applied correct font preload hints
* Don't show "first visit" UI during loading
* The current day expands by default, even if future days exist

## [1.0.1] - 2024-03-10

### Fixed

* Applied correct styling to links in footer and "first visit" UI

## [1.0.0] - 2024-02-23

### Added

* Initial release
