gulp initial script style
if [ ! -d ./tmp ]; then
  mkdir ./tmp
fi;
rm -rf ./tmp/release
mkdir -p ./tmp/release
cp -R {bin,core,migrations,models,public,views,routes,utils,app.js,config.json,em.json,package.json,nginx.conf} ./tmp/release
rsync -vrcz --progress -e ssh --exclude-from exclude.list --delete ./tmp/release/ hh@198.55.102.174:~/app
ssh hh@198.55.102.174 'pm2 restart 0'
