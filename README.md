# OpenNEM Energy Market Platform

![logo](https://developers.opennem.org.au/_static/logo.png)

**NOTE: This is the frontend project** For the core project and any issues see [opennem/opennem](https://github.com/opennem/opennem)

The OpenNEM project aims to make the wealth of public National Electricity Market (NEM) data more accessible to a wider audience.

OpenNEM is a project of the [Energy Transition Hub](http://energy-transition-hub.org/).

Project homepage at https://opennem.org.au

Find us on [twitter](https://twitter.com/OpenNEM)

Developed by:

- [Dylan McConnell (@dylanjmcconnell) | Twitter](https://twitter.com/dylanjmcconnell)
- [simon holmes à court (@simonahac) | Twitter](https://twitter.com/simonahac)
- [Steven Tan (@chienleng) | Twitter](https://twitter.com/chienleng)
- [Nik Cubrilovic (@dir) | Twitter](https://twitter.com/dir) [Website](https://nikcub.me)

---

## Development

This project requires Node.js v14 and uses [Yarn (v1 - classic)](https://classic.yarnpkg.com/lang/en/) for package management.

### Option 1: Docker Development (Recommended)

Docker provides an isolated Node.js v14 environment without affecting your system.

```sh
# Start development server with Docker
$ npm run docker:dev
# or
$ yarn docker:dev

# View logs
$ npm run docker:logs

# Run commands in container (e.g., linting)
$ npm run docker:exec yarn lint

# Stop containers
$ npm run docker:down
```

The development server will be available at `http://localhost:3000/`.

**Available Docker commands:**
- `npm run docker:dev` - Build and start development server
- `npm run docker:up` - Start existing containers  
- `npm run docker:build` - Build containers only
- `npm run docker:down` - Stop containers
- `npm run docker:logs` - View container logs
- `npm run docker:exec` - Run commands in container
- `npm run docker:clean` - Stop containers and cleanup Docker resources

*Note: You can use either `npm run` or `yarn` to execute these Docker commands locally.*

### Option 2: Native Development

Requires Node.js v14 installed on your system.

```sh
# Install dependencies
$ yarn install

# Start development server
$ yarn dev
```

This wil run the local [`Nuxt`](https://nuxtjs.org/) dev server, you should be able to open `http://localhost:3000/` in your browser, by default the public facing Opennem API will be used.

---

## Issues

File issues at the main [OpenNEM Repository](https://github.com/opennem/opennem) and label them as frontend.

---

## License

OpenNEM is MIT licensed.
