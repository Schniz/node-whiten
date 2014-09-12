var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task('install:dnsmasq', shell.task([
	'sudo apt-get install dnsmasq',
	'(cat /etc/dnsmasq.conf | grep whiten > /dev/null) || (echo "address=/whiten.node/127.0.0.1" | sudo tee --append /etc/dnsmasq.conf > /dev/null)',
	'sudo service dnsmasq restart'
])).task('install', ['install:dnsmasq']);
