var gulp = require('gulp');
var fs = require('fs');

fs.readdirSync('./tasks').forEach(function(taskName) {
	require('./tasks/' + taskName);
});
