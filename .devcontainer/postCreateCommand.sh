#!/bin/bash
set -e

sudo chown -R "$(id -u):$(id -g)" /home/node/.local/share/pnpm
sudo chown -R "$(id -u):$(id -g)" /home/node/.cache/pnpm
sudo chown -R "$(id -u):$(id -g)" /home/node/.local/state/bash
sudo chown -R "$(id -u):$(id -g)" /home/node/.convex
pnpm install






