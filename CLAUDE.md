# OpenNEM Frontend - Project Context

## About
OpenNEM is an open platform for Australian National Electricity Market data visualization. This Vue.js/Nuxt.js frontend displays interactive charts and maps for power generation, emissions, and market data across Australia.

## Technology Stack
- **Framework**: Nuxt.js 2 (Vue.js framework) 
- **Charts**: D3.js for data visualizations
- **Maps**: Mapbox GL for facility mapping
- **Styling**: Bulma CSS framework + custom SCSS
- **Package Manager**: Yarn (v1 classic)

## Requirements
- **Node.js**: v14 (does not support versions above v14)
- **Yarn**: v1 (classic) required for package management

## Development Commands

### Native (requires Node.js v14)
```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Generate static site
yarn generate

# Lint code
yarn lint

# Fix linting issues
yarn fix
```

### Docker (recommended - isolates Node.js v14)
```bash
# Build and start development server
docker-compose up --build

# Run commands in container
docker-compose exec opennem-fe yarn install
docker-compose exec opennem-fe yarn lint
docker-compose exec opennem-fe yarn build

# Stop container
docker-compose down
```

## Project Structure
- `/components/` - Vue components organized by feature (Charts, Energy, Facility, etc.)
- `/pages/` - Nuxt.js pages/routes
- `/constants/` - Configuration constants for fuel techs, regions, etc.
- `/data/` - Data parsing and transformation logic
- `/services/` - API services and utilities
- `/store/` - Vuex state management
- `/static/` - Static assets and precomputed data

## Key Features
- Energy generation charts by fuel type and region
- Power facility mapping and information
- Emissions tracking and carbon intensity
- Market price and demand data
- Regional comparisons (NEM, WEM markets)
- Export capabilities for charts and data

## API
Connects to OpenNEM API for live electricity market data at opennem.org.au

## Deployment
- Production: https://opennem.org.au
- Development server runs on http://localhost:3000

## Notes
- Uses Vue 2 / Nuxt 2 (legacy versions)
- Large codebase with extensive D3.js visualizations
- Real-time data updates from Australian electricity markets