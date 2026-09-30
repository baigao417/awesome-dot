# Awesome Dot

**You have a 24/7 AI employee. What can it do for you?**

Awesome Dot collects official OpenAI dots use cases, community projects and development resources to help you put Dot to work.

[Visit the site](https://baigao417.github.io/awesome-dot/) · [Submit a project](https://github.com/baigao417/awesome-dot/issues/new?template=project.yml) · [中文](README.md)

## Features

- **Browse by category**: Code and product feedback, Content and creative work, Business and team collaboration, Research and data analysis, Monitoring and ongoing follow-up, Plugins and MCP, Guides and resource libraries, and Independent Agent solutions.
- **Search and filter**: Find entries by keyword, listing type, tags and GitHub Stars. Filters are included in the URL for easy sharing.
- **Inspiration card**: Not sure what to do? Draw a random card from the current results.
- **Daily discovery**: A featured case every day.
- **Case details**: What Dot does, the expected output, what you need to start, and source links. For official use cases, copy a draft task with one click and give it directly to Dot.
- **Save cases**: Saved cases stay in your browser. No account needed.
- **Four languages, two modes**: 简体中文, English, 日本語 and 한국어, with dark and light modes you can switch anytime.

## Listing Types

| Type | Content |
| --- | --- |
| Official use | Use cases from official OpenAI documentation |
| Community | Public projects built by the community and related to Dot |
| Dev material | Tools for building Dot applications, including plugins and MCP |
| Indep. alt. | Other Agent implementations |
| Tutorials & articles | Getting-started tutorials, practical tips and in-depth analysis |
| Task templates | Task, rule and Skill templates ready to give to Dot |

See [docs/catalog.md](docs/catalog.md) for the full catalog.

## Submit a Project

Built a Dot-related project or found a useful case? Contributions are welcome:

- **Issue**: Fill out the [submission template](https://github.com/baigao417/awesome-dot/issues/new?template=project.yml) with the name, link and Dot's role.
- **Pull Request**: Edit `data/catalog.json` directly. See [CONTRIBUTING.md](CONTRIBUTING.md) for the process.

The repository also scans GitHub for new projects every 12 hours. The maintainer reviews them before adding them to the catalog.

## Local Development

Requires Node.js 24.

```bash
npm ci
npm run dev       # Preview locally
npm test          # Run tests
npm run build     # Build to dist/
```

When site code or data is pushed to `main`, GitHub Actions automatically builds and publishes the site to GitHub Pages.

## Directory Structure

```text
data/
  catalog.json         Listing data (Chinese originals)
  catalog-i18n.json    English, Japanese and Korean translations of listings
  sources.json         Official documentation sources
src/
  main.js              Pages and interactions
  i18n.js              Interface text (four languages)
  style.css            Styles
scripts/               Data generation and GitHub scanning scripts
.github/workflows/     Deployment, tests and scheduled scans
```

## Maintainer

Baigao (白告) · [@baigao111](https://x.com/baigao111)

---

Awesome Dot is a community project with no affiliation to OpenAI.
