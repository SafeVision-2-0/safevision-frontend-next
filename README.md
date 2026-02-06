## Running the Project in Production Mode

Follow these steps to run the application in production mode.

### Prerequisites

Make sure you have the following installed on your machine:

* Node.js (recommended LTS version)
* pnpm (recommended) or npm

### Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Open the `.env` file and fill in all required environment variables.

### Install Dependencies

Using **pnpm** (recommended):

```bash
pnpm install
```

Or using **npm**:

```bash
npm install
```

### Build the Project

Create an optimized production build:

Using pnpm:

```bash
pnpm build
```

Using npm:

```bash
npm run build
```

### Start the Production Server

After the build is complete, start the application:

Using pnpm:

```bash
pnpm start
```

Using npm:

```bash
npm run start
```

The application will now be running in production mode.

### Notes

* Make sure all required environment variables are properly set before building.
* Production mode should not be used with development commands like `pnpm dev`.
