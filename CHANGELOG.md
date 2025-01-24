# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2024-03-19

### Added
- Server-Sent Events (SSE) support as an alternative to WebSocket connections
- New `connectStrategy` option to choose between 'sse' (default) and 'websocket'
- Staging environment support with `developer.assisfy-genesis.cv` domain
- Complete JSDoc type documentation for all core classes
- New example for SSE usage (`examples/create-with-sse.js`)
- New example for staging environment (`examples/init-staging.js`)

### Changed
- Default connection strategy is now SSE instead of WebSocket
- Updated domain names to use `assisfy-genesis.cv`
- Improved error handling in both SSE and WebSocket strategies
- Refactored configuration to support multiple environments
- Added more comprehensive event type handling in SSE strategy

### Fixed
- WebSocket strategy now properly handles close events
- Improved error messages for auto-trigger validation
- Better type safety with JSDoc annotations

## [1.5.0] - 2024-03-18

### Added
- WebSocket-based real-time communication
- Session management with create and connect methods
- Auto-trigger functionality for scheduled sessions
- Basic examples and documentation 