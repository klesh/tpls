
echo "Installing server side deps"
npm install jsonwebtoken --save
npm install kaptcha --save
npm install emmo-model --save
npm install express-jwt --save

em init

echo "Copying files"
cp -R $(dirname $0)/login/* ./

echo "Try to setup config.json with random secret"
if [ ! -f ./config.json ]; then
  echo "{" > ./config.json;
  echo "  \"secret\": \"$(uuidgen)\"" >> ./config.json
  echo "}" >> ./config.json;
fi

echo "Done"
