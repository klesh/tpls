# install angular-bootstrap
echo "Installing browser side components"
bower init
bower install angular-bootstrap --save
bower install angular-route --save
bower install angular-resource --save
bower install angular-messages --save
bower install angular-animate --save
bower install bootstrap --save
bower install a0-angular-storage --save
bower install angular-i18n --save
bower install angular-motion --save
bower install lodash --save

# install gupl
echo "Installing development utils"
npm install gulp --save-dev
npm install gulp-concat --save-dev
npm install gulp-uglify --save-dev
npm install gulp-minify-css --save-dev
npm install gulp-sass --save-dev

# install useful npm package
echo "Installing server side packages"
npm install bluebird --save
npm install moment --save
npm install lodash --save
npm install pg --save
npm install emmo-model --save
em init

# copy gulpfile
echo "Copying templates"
cp -R $(dirname $0)/base/* ./
mv gitignore .gitignore

# generate lib.js / lib.css third parties components.
gulp initial
