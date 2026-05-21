# tessera-notebook — site Makefile
#
# A Vite + React SPA. Markdown content lives at content/{episodes,architecture}/
# and content/_intro.md. The build (npm run build) produces dist/ which
# GitHub Pages serves at https://tessera.arcanelabs.info/.
#
# Content is sourced from the sibling arcanelabsio/dispatch repo. Use
# `make sync` to bring content over before building.

.PHONY: help install dev build preview typecheck clean sync sync-all publish deploy-init

PORT ?= 5173

help:
	@echo "tessera-notebook — make targets"
	@echo ""
	@echo "  make install          npm install"
	@echo "  make dev              vite dev server (default port $(PORT))"
	@echo "  make build            production build to dist/"
	@echo "  make preview          serve the built dist/ for verification"
	@echo "  make typecheck        run tsc -b --noEmit"
	@echo "  make clean            remove dist/ + node_modules/.vite cache"
	@echo ""
	@echo "  make sync             sync content from sibling dispatch repo"
	@echo "  make publish          sync + build (does not push; humans push)"
	@echo ""
	@echo "  make deploy-init      one-shot: commit + create public GH repo + push"
	@echo "                        + enable Pages (source: GitHub Actions)"
	@echo "                        After running this, set up DNS CNAME (instructions printed)."
	@echo ""
	@echo "  Optional vars:"
	@echo "    PORT=N              override dev/preview port"

install:
	@npm install

dev:
	@npm run dev -- --port $(PORT)

build:
	@npm run build

preview:
	@npm run preview -- --port $(PORT) --strictPort

typecheck:
	@npm run typecheck

clean:
	@rm -rf dist node_modules/.vite
	@echo "✓ removed dist/ and vite cache"

# Sync content from arcanelabsio/dispatch (sibling repo). Runs dispatch's
# sync-to-tessera.mjs script which copies the intro, voice-passed episodes,
# and curated ADRs into this repo's content/ directory.
sync:
	@cd ../dispatch && node scripts/sync-to-tessera.mjs --all

# Full publish: sync + build. The push to the remote (which deploys to
# GH Pages) is left to humans — that's shared-state, gets explicit go-ahead.
publish: sync build
	@echo ""
	@echo "✓ content synced + built. dist/ ready to deploy."
	@echo "  next: git add -A && git commit -m '...' && git push"

# One-shot initial deployment: stage + commit (if needed), create the
# public GH repo, push, configure Pages to use the deploy.yml workflow.
# DNS CNAME setup is manual (instructions printed at the end).
#
# Requires: `gh` CLI authenticated with arcanelabsio org access.
deploy-init:
	@echo "──────────────────────────────────────────────────────────────"
	@echo "  Initial deployment: tessera-notebook → tessera.arcanelabs.info"
	@echo "──────────────────────────────────────────────────────────────"
	@if [ -z "$$(git log --oneline 2>/dev/null)" ]; then \
		echo "→ Staging all files for initial commit..."; \
		git add -A; \
		echo "→ Creating initial commit..."; \
		git commit -m "feat(site): scaffold Vite + React SPA with first episode and architecture docs"; \
	elif [ -n "$$(git status --porcelain)" ]; then \
		echo "→ Uncommitted changes present — staging and committing..."; \
		git add -A; \
		git commit -m "chore(site): pre-deploy sync"; \
	else \
		echo "→ Working tree clean; using existing commits."; \
	fi
	@echo ""
	@echo "→ Creating public GitHub repo arcanelabsio/tessera-notebook..."
	@gh repo create arcanelabsio/tessera-notebook \
		--public \
		--source . \
		--push \
		--description "Public site for The Tessera Notebook — a daily platform-engineering serial. Vite + React SPA at tessera.arcanelabs.info."
	@echo ""
	@echo "→ Setting GitHub Pages source to 'GitHub Actions'..."
	@gh api -X POST /repos/arcanelabsio/tessera-notebook/pages \
		-f build_type=workflow 2>/dev/null && \
		echo "  ✓ Pages enabled" || \
		echo "  ! Pages enable returned non-zero — set manually: Settings → Pages → Source: GitHub Actions"
	@echo ""
	@echo "✓ Repo created and pushed. The deploy workflow will run on push to main."
	@echo "  Monitor: https://github.com/arcanelabsio/tessera-notebook/actions"
	@echo ""
	@echo "──────────────────────────────────────────────────────────────"
	@echo "  Remaining step: DNS CNAME"
	@echo "──────────────────────────────────────────────────────────────"
	@echo "  At your DNS provider for arcanelabs.info, add:"
	@echo ""
	@echo "    Type:    CNAME"
	@echo "    Name:    tessera"
	@echo "    Value:   arcanelabsio.github.io."
	@echo ""
	@echo "  After ~5-30 min propagation, https://tessera.arcanelabs.info/ goes live."
