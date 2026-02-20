# How to run the project

Note: 
- it is recommended to use option 2 (docker) unless you don't have docker installed or prefer to run it locally without containerization.

## Option 1: Running the Project in Production Mode

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

---

## Option 2: Running the Project with Docker (Recommended)

You can also run the application using Docker and Docker Compose.

### Prerequisites

Make sure you have the following installed on your machine:

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/)

### Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Open the `.env` file and fill in all required environment variables:

| Variable                    | Description                        |
|-----------------------------|------------------------------------|
| `NEXT_PUBLIC_API_URL`       | Base URL for the API               |
| `NEXT_PUBLIC_BASE_AI_URL`   | Base URL for the AI service        |
| `NEXT_PUBLIC_BASE_API_URL`  | Base URL for the backend API       |
| `NEXT_PUBLIC_BASE_WEBSOCKET`| WebSocket server URL               |
| `NEXT_PUBLIC_AI_MODEL`      | AI model identifier to use         |

### Build and Start the Container

```bash
docker compose up --build
```

This command will:
- Build the Docker image using the multi-stage `Dockerfile`
- Inject all environment variables from your `.env` file at build time
- Start the container and expose the app on port **3000**

### Start Without Rebuilding

If the image has already been built and no changes were made:

```bash
docker compose up
```

### Run in Detached Mode (Background)

```bash
docker compose up --build -d
```

### Stop the Container

```bash
docker compose down
```

### Access the Application

Once running, the application will be available at:

```
http://localhost:3000
```

### Notes

* Environment variables are baked into the image at **build time** since they use the `NEXT_PUBLIC_` prefix. Always rebuild the image after changing them with `docker compose up --build`.
* The container runs as a non-root user for security.
```