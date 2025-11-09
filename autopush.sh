#!/bin/bash
cd ~/Documents/justapremise-site

echo "🌸 Starting SCSS watcher..."
sass --watch scss:css &

echo "🚀 Starting auto Git sync..."
while true; do
  git pull --rebase origin main
  if ! git diff --quiet; then
    git add .
    git commit -m "auto update"
    git push origin main
    echo "✅ Changes pushed at $(date)"
  else
    echo "No changes at $(date)"
  fi
  sleep 120
done

