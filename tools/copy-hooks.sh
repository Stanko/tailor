#!/bin/bash

# Pre commit hook
cp ./tools/hooks/pre-commit ./.git/hooks/
chmod +x ./.git/hooks/pre-commit

echo "Copied git pre-commit hook."
