# Orange Twist Changelog

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2024-04-13

### Fixed

* The progress animation for toasts now works in Firefox

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
