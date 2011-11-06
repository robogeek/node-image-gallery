var im     = require('imagemagick');
var fs     = require('fs');
var util   = require('util');
var async  = require('async');
var assert = require('assert');
var md     = require('./metadata');

var copydir = exports.copydir = function(indir, outdir, width, endCopy) {
    var indirstat  = fs.statSync(indir);
    var outdirstat = undefined;
    
    try { outdirstat = fs.statSync(outdir); } catch (E) { }
    
    assert.ok(indirstat.isDirectory(), 'outdir must exist');
    assert.ok(!outdirstat || !outdirstat.isDirectory(), 'outdir must not exist');
    
    fs.mkdirSync(outdir, 0755);
    
    fs.readdir(indir, function(err, files) {
        if (err) throw err;
        async.filter(files, function(item, callback) { md.isImage(item) ? callback(true) : callback(false) },
            function(files) {
                async.forEachSeries(files, function(file, done) {
                    // console.log('copying ' + file);
                    im.convert(['-verbose', '-resize', width, indir+'/'+file, outdir+'/'+file],
                        function(err, stdout) {
                            if (err) done(err);
                            // console.log('stdout:', stdout);
                            done();
                        })
                },
                function(err) {
                    err ? endCopy(err) : endCopy();
                });
            }
        );
    })
}

/* for testing
 * copydir(process.argv[2], process.argv[3], process.argv[4], 
    function() {
        console.log('all done');
    });
*/
