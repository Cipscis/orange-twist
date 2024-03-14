# Orange Twist Changelog

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-03-12

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
