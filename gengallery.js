var im    = require('imagemagick');
var fs    = require('fs');
var util  = require('util');
var async = require('async');
var md    = require('./metadata');
var ejs   = require('ejs');
var copyr = require('./copyimgdir');
var spawn = require('child_process').spawn;
var fs    = require('fs');
var tmpl  = fs.readFileSync(__dirname + '/index.ejs', 'utf8');

var indir  = process.argv[2];
var outdir = process.argv[3];

var metadata = [];
var imgfiles = [];

var prettyPhoto = "prettyPhoto_compressed_3.1.3";

// TBD:- controlling the order images are shown by sorting them
// TBD:- pass in options like image size thumb size

async.series([
    function(callback) {
        copyr.copydir(indir, outdir, "500", function(err) {
            err ? callback(err) : callback(null, 'copydir');
        });
    },
    function(callback) {
        // discover which files are images
        fs.readdir(indir, function(err, files) {
            if (err) callback(err);
            files.forEach(function(element, index, array) {
                if (md.isImage(element)) imgfiles.push(element);
            });
            util.log(util.inspect(imgfiles));
            callback(null, 'isImage');
        });
    },
    function(callback) {
        // gather metadata
        async.forEachSeries(imgfiles,
        function(imgfile, done) {
            var name = md.imageFname(imgfile);
            var ext = md.imageExtension(imgfile);
            var fnSmallImage = name+"-web."+ext;
            var fnThumbImage = name+"-thumb."+ext;
            md.metadata(outdir+'/'+imgfile, function(err, results) {
                if (err) done(err);
                results.fname = imgfile;
                results.fnSmallImage = fnSmallImage;
                results.fnThumbImage = fnThumbImage;
                metadata.push(results);
                done(null, 'metadata');
            });
        },
        function(err) {
            if (err) callback(err);
            util.log(util.inspect(metadata));
            callback(null, 'metadata');
        });
    },
    function(callback) {
        // generate thumbnail
        async.forEachSeries(metadata,
        function(img, done) {
            util.log(util.inspect(img));
              im.resize({
                      srcPath: outdir+'/'+img.fname,
                      dstPath: outdir+'/'+img.fnThumbImage,
                      quality: 0.99,  // TBD make this pluggable
                      format: "jpg",
                      progressive: false,
                      width: 100, // TBD make this pluggable
                      filter: "Lagrange",
                      sharpening: 0.2
              },
              function(err, stdout, stderr){
                  if (err) done(err);
                  done(null);
              });
        },
        function(err) {
            if (err) callback(err);
            callback(null, 'thumbnail');
        });
    },
    function(callback) {
        fs.writeFileSync(outdir+"/index.html", 
            ejs.render(tmpl, { locals: { metadata: metadata } }));
        fs.mkdirSync(outdir+"/js", 0755);
        fs.mkdirSync(outdir+"/css", 0755);
        fs.mkdirSync(outdir+"/images", 0755);
        spawn('cp', [ prettyPhoto+'/js/jquery-1.6.1.min.js', outdir+"/js/jquery.js" ]);
        spawn('cp', [ prettyPhoto+'/js/jquery.prettyPhoto.js', outdir+"/js" ]);
        spawn('cp', [ prettyPhoto+'/css/prettyPhoto.css', outdir+"/css" ]);
        spawn('cp', [ '-r', prettyPhoto+'/images', outdir/*+"/images"*/ ]);
        callback(null, 'setuphtml');
    }
    
], function(err, results) {
      if (err) throw new Error(err);
      util.log(util.inspect(results));
});

