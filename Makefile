# Org-wide verbs (same contract as every foundation): setup / check / test / dev.
.PHONY: setup check lint types format-check test dev build

setup:
	npm install
	@git submodule update --init --recursive 2>/dev/null || \
	  echo "note: rules submodule not wired yet — run 'launchpad sync-harness-app' from the tenant meta"

check: lint types format-check ## offline gates — green on day one

lint:
	npm run lint

types:
	npm run types

format-check:
	npm run format:check

test:
	npm run test

dev:
	npm run dev

build:
	npm run build
