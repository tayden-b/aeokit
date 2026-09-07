.PHONY: help test lint check site instrument package reproduce

PY := .venv/bin/python

help:
	@echo "  make test        run the offline test suite"
	@echo "  make lint        ruff over the package and tests"
	@echo "  make check       lint + test + site build (what CI runs)"
	@echo "  make site        Next.js dev server"
	@echo "  make instrument  local BYOK MCP server on stdio"
	@echo "  make package     build the PyPI distribution"
	@echo "  make reproduce   rebuild rollups + export from the local corpus"

test:
	cd instrument && $(PY) -m pytest

lint:
	cd instrument && $(PY) -m ruff check aeokit_mcp tests

check: lint test
	pnpm build

site:
	pnpm dev

instrument:
	cd instrument && $(PY) -m aeokit_mcp.local

package:
	cd instrument && rm -rf dist && $(PY) -m build && $(PY) -m twine check dist/*

reproduce:
	cd instrument && $(PY) -m aeokit_mcp.rollup && $(PY) -m aeokit_mcp.export
