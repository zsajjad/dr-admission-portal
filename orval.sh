wget -O api/$1/api.config.json $2
# curl -A "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36" -o api/$1/api.config.json "$2"

# mkdir -p "api/$1"

cd "api/$1" || exit 1

npx orval
npm run lint:fix
exit
