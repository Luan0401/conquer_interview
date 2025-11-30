echo "Building app..."
npm run build
echo "Deploy files to server..."
# scp -r dist/* root@14.225.212.59:/var/www/html/
scp -r dist/* root@14.225.212.59:/var/www/conquer_interview/src/
echo "Done!"