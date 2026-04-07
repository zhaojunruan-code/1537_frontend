# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a UniApp template project built with Vue 3, supporting multiple platforms including H5, WeChat Mini Program, App (iOS/Android). The project uses a modern development stack with TypeScript, Vite, UnoCSS, and Pinia for state management.

## Common Development Commands

### Development
- `npm run dev:h5` - Start H5 development server
- `npm run dev:mp-weixin` - Start WeChat Mini Program development
- `npm run dev:app` - Start App development
- `npm run dev:app-android` - Start Android App development
- `npm run dev:app-ios` - Start iOS App development

### Build
- `npm run build:h5` - Build for H5 production
- `npm run build:mp-weixin` - Build for WeChat Mini Program
- `npm run build:app` - Build for App
- `npm run build:app-android` - Build for Android
- `npm run build:app-ios` - Build for iOS

### Type Checking and Quality
- `npm run type-check` - Run TypeScript type checking with vue-tsc

### Automation Scripts
- `npm run auto:api` - Generate API functions from API documentation (requires valid apiUrl in config/api-config.js)
- `npm run auto:view` - Generate Vue page files from pages.json configuration
- `npm run auto:translate` - Extract Chinese text and generate i18n language packages (experimental)

## Code Architecture

### Core Technologies
- **Vue 3** with Composition API and `<script setup>` syntax
- **UniApp** for cross-platform development
- **TypeScript** for type safety
- **Vite** as build tool
- **UnoCSS** for atomic CSS
- **Pinia** for state management with persistence
- **Wot Design Uni** as the primary UI component library

### Project Structure
```
src/
├── api/           # API function definitions
├── components/    # Reusable Vue components
├── hooks/         # Composable functions
├── http/          # HTTP request configuration
├── interceptors/  # Request/response/route interceptors
├── pages/         # Page components
├── store/         # Pinia store modules
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── static/        # Static assets
```

### State Management
- Use Pinia stores with the composition API pattern
- Stores are automatically persisted using `pinia-plugin-persist-uni`
- Store modules: useUserStore, useDictStore, useTabbarStore, useRouteCacheStore

### Auto-Import Configuration
The project uses unplugin-auto-import for:
- Vue APIs (ref, reactive, computed, etc.)
- UniApp APIs
- Vue i18n
- Pinia APIs
- Custom hooks from `src/hooks/`
- API functions from `src/api/`
- Store modules from `src/store/`

All auto-imports are type-safe with generated definitions in `src/types/auto-import.d.ts`

### Build and Development Setup
- **Vite** as build tool with environment-specific configuration
- **UnoCSS** for atomic CSS styling
- **TypeScript** strict mode with vue-tsc for type checking
- Custom Vite plugins for UniApp platform compatibility
- Environment variables loaded from `env/` directory based on mode

### Key Components
- **CustomTabbar** - Custom bottom navigation bar
- **LoginWrapper** - Authentication wrapper component
- **WaterfallList** - Waterfall layout for image lists
- **SafeTopContainer** - Safe area container for status bar
- **SkuSelector** - Product SKU selection component

### Environment Configuration
Environment files are located in the `env/` directory:
- `.env` - Base configuration shared across all environments
- `.env.development` - Development environment
- `.env.production` - Production environment

### Code Style Guidelines
- Use `<script setup>` syntax for Vue components
- Follow Vue 3 Composition API patterns
- Use TypeScript for type safety
- Component names should use PascalCase
- Event names should use kebab-case
- Props should use camelCase
- Always use scoped CSS
- Use meaningful variable and function names

### Development Workflow
1. API generation: Configure `config/api-config.js` with your API documentation URL, then run `npm run auto:api`
2. Page generation: Define pages in `src/pages.json`, then run `npm run auto:view`
3. Type checking: Run `npm run type-check` before committing
4. Multi-platform testing: Use appropriate dev commands for target platforms

### Important Notes
- Always run type checking before builds
- API generation requires valid ApiPost documentation URL
- The project supports both Chinese and internationalization workflows
- Custom navigation style is enabled globally
- Auto-import reduces boilerplate but may affect IDE intellisense

### Request/Response Architecture
- HTTP requests are handled through `src/http/index.js` with interceptors in `src/interceptors/`
- Request interceptor handles authentication and common headers
- Response interceptor manages error handling and token refreshing
- Route interceptor manages navigation permissions

### Component Development Guidelines
Following Cursor rules and Vue best practices:
- Use `<script setup>` syntax with Composition API
- Component names use PascalCase, events use kebab-case, props use camelCase
- Always use scoped CSS, avoid `!important`
- For performance: use `v-show` for frequent toggles, `keep-alive` for caching
- Provide `key` for `v-for` loops, avoid mixing `v-if` and `v-for`

### Key Development Patterns
- **Hooks/Composables**: Located in `src/hooks/` for reusable logic (navigation, permissions, validation, etc.)
- **Type Safety**: TypeScript strict mode with auto-generated type definitions in `src/types/auto-import.d.ts`
- **Environment**: Multi-environment support with files in `env/` directory
- **Internationalization**: Built-in i18n support with auto-translation workflow (experimental)

### Cross-Platform Considerations
- Code must be compatible with H5, WeChat Mini Program, and native apps
- Use `uni.*` APIs instead of platform-specific APIs
- Test on target platforms using respective dev commands
- Custom navigation style is enabled globally

### Debugging and Quality Assurance
- Always run `npm run type-check` before commits
- Use built-in logging utilities from `src/hooks/useLog4Js.js`
- Environment variables control console output and sourcemaps
