bower init
bower install angular-bootstrap --save
bower install angular-route --save
bower install angular-resource --save
bower install angular-animate --save
bower install bootstrap --save
bower install a0-angular-storage --save
npm install gulp --save-dev
npm install gulp-concat --save-dev
npm install gulp-uglify --save-dev
npm install gulp-minify-css --save-dev
npm install gulp-sass --save-dev
cp $(dirname $0)/angular-bootstrap.gulpfile.js ./gulpfile.js
cp $(dirname $0)/git/node-vim.gitignore ./.gitignore
mkdir src
mkdir src/css
mkdir src/js
gulp initial
