#!/bin/bash

echo "🚀 Building React app..."
npm install
npm run build

echo "🧹 Cleaning old deploy..."
sudo rm -rf /var/www/conquer_interview/*

echo "📦 Deploying new build..."
sudo cp -r dist/* /var/www/conquer_interview/

echo "🔄 Restarting NGINX..."
sudo systemctl restart nginx

echo "�� FE DEPLOY DONE!"
