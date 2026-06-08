<p align="center">
  <a href="https://solarplan.app">
    <img src="https://assets.solarplan.app/logo-text.png" alt="Solarplan's logo" width="450" />
  </a>
</p>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/usekaneo/solarplan/ci.yml?branch=main)](https://github.com/usekaneo/solarplan/actions)
[![Discord](https://img.shields.io/discord/1326250681530843178?color=7389D8&label=&logo=discord&logoColor=ffffff)](https://discord.gg/rU4tSyhXXU)
[![Sponsors](https://img.shields.io/github/sponsors/andrejsshell)](https://github.com/sponsors/andrejsshell)

</div>

<div align="center">
  <h3>
    <a href="https://solarplan.app/docs/core">Quick Start</a>
    <span> | </span>
    <a href="https://solarplan.app">Website</a>
    <span> | </span>
    <a href="https://cloud.solarplan.app">Cloud</a>
    <span> | </span>
    <a href="https://discord.gg/rU4tSyhXXU">Discord</a>
  </h3>
</div>


<p align="center">
  <img src="https://assets.solarplan.app/readme.png" alt="Solarplan Dashboard" />
</p>

## Why Solarplan?

After years of using bloated, overcomplicated project management platforms that distracted from actual work, we built Solarplan to be different.

The problem with most tools isn't that they lack features—it's that they have **too many**. Every notification, every unnecessary button, every complex workflow pulls your team away from what matters: **building great products**.

We believe the best tools are **invisible**. They should amplify your team's natural workflow, not force you to adapt to theirs. Solarplan is built on the principle that **less is more**—every feature exists because it solves a real problem, not because it looks impressive in a demo.

**What makes it different:**
- **Clean interface** that focuses on your work, not the tool
- **Self-hosted** so your data stays yours
- **Actually fast** because we care about performance
- **Open source** with a permissive MIT license

Learn more about Solarplan's features and capabilities in our [documentation](https://solarplan.app/docs/core).

## Sponsors

Solarplan is open source. If you find it useful, consider [sponsoring the project](https://github.com/sponsors/andrejsshell) to help support ongoing development.

## Getting Started

### One-Click Deployment with drim

For straightforward deployments, use [drim](https://github.com/usekaneo/drim) - a CLI tool that handles everything for you:

```bash
curl -fsSL https://assets.solarplan.app/install.sh | sh
drim setup
```

That's it. Your Solarplan instance will be running with automatic HTTPS, database setup, and all services configured.

Perfect for quick deployments and production setups where you want things to just work.

### Quick Start with Docker Compose

The fastest way to try Solarplan is with Docker Compose. This sets up Solarplan and PostgreSQL with a single Solarplan container:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env_file:
      - .env
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U solarplan -d solarplan"]
      interval: 10s
      timeout: 5s
      retries: 5

  solarplan:
    image: ghcr.io/usekaneo/solarplan:latest
    ports:
      - "5173:5173"
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

Save this as `compose.yml`, create a `.env` file with `SOLARPLAN_CLIENT_URL=http://localhost:5173`, `POSTGRES_PASSWORD=<password>`, and `AUTH_SECRET=<output of openssl rand -hex 32>`, run `docker compose up -d`, and open [http://localhost:5173](http://localhost:5173).

In Docker Compose, the bundled Solarplan container reaches PostgreSQL at the service hostname `postgres`.
If you run the API on your host instead of inside Compose, use `localhost` or set `DATABASE_URL` explicitly.

> **Important:** See our [full documentation](https://solarplan.app/docs/core) for detailed setup instructions, environment variable configuration, and troubleshooting guides.

### Development Setup

For development, see our [Environment Setup Guide](ENVIRONMENT_SETUP.md) for detailed instructions on configuring environment variables and troubleshooting common issues like CORS problems.

### Configuration

Solarplan requires several environment variables to be configured. The Docker Compose setup above handles the database automatically, but you'll need to configure environment variables for the API and web services.

For complete configuration instructions, including all required environment variables, database setup for non-Docker deployments, and advanced settings, see the [documentation](https://solarplan.app/docs/core). Advanced deployments can still use the separate `ghcr.io/usekaneo/api` and `ghcr.io/usekaneo/web` images.

## Kubernetes Deployment

If you're running Kubernetes, we provide a comprehensive Helm chart. Check out the [Helm chart documentation](./charts/solarplan/README.md) for detailed installation instructions, production configuration examples, TLS setup, and more.

## Development

Want to hack on Solarplan? See our [Environment Setup Guide](ENVIRONMENT_SETUP.md) for detailed instructions on configuring environment variables and troubleshooting common issues like CORS problems.

Quick start:
```bash
# Clone and install dependencies
git clone https://github.com/usekaneo/solarplan.git
cd solarplan
pnpm install

# Create a .env file in the root with required environment variables
# See ENVIRONMENT_SETUP.md for detailed instructions

# Start development servers
pnpm dev
```

For contributing guidelines, code structure, and development best practices, check out our [contributing guide](CONTRIBUTING.md) and [documentation](https://solarplan.app/docs/core).

## Community

- **[Discord](https://discord.gg/rU4tSyhXXU)** - Chat with users and contributors
- **[GitHub Issues](https://github.com/usekaneo/solarplan/issues)** - Bug reports and feature requests
- **[Documentation](https://solarplan.app/docs/core)** - Detailed guides, API docs, and tutorials

## Contributing

We're always looking for help, whether that's:
- Reporting bugs or suggesting features
- Improving documentation
- Contributing code
- Helping other users on Discord

Check out [CONTRIBUTING.md](CONTRIBUTING.md) for the details on how to get involved.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  <img src="https://repobeats.axiom.co/api/embed/3e8367ec2b2350e4fc48662df33c81dac657b833.svg" alt="Repobeats analytics image" />
</div>

<p align="center">
  Built with ❤️ by the Solarplan team and <a href="#contributors">contributors</a>
</p>
