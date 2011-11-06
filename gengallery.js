var im    = require('imagemagick');
var fs    = require('fs');
var util  = require('util');
var async = require('async');
var md    = require('./metadata');
var ejs   = require('ejs');

var fs    = require('fs');
var tmpl  = fs.readFileSync(__dirname + '/index.ejs', 'utf8');

var dir = process.argv[2];

// TBD:- 
// TBD:- controlling the order images are shown by sorting them

fs.readdir(dir, function(err, files) {
  if (err) throw err;
  var metadata = [];
  var imgfiles = [];
  files.forEach(function(element, index, array) {
      var file = element;
      // util.log('? '+file);
      if (file.match(/[jJ][pP][gG]$/))     { imgfiles.push(file); }
      if (file.match(/[jJ][pP][eE][gG]$/)) { imgfiles.push(file); }
      if (file.match(/[pP][nN][gG]$/))     { imgfiles.push(file); }
  });
  // util.log(util.inspect(imgfiles));
  async.forEachSeries(imgfiles,
  function(imgfile, done) {
      util.log('generate '+imgfile);
      var li = imgfile.lastIndexOf('.');
      var name = undefined;
      var ext = ".jpg";
      if (li >= 0) {
          name = imgfile.substring(0, li);
          ext  = imgfile.substring(li);
      } else {
          name = imgfile;
      }
      var fnSmallImage = name+"-web"+ext;
      var fnThumbImage = name+"-thumb"+ext;
      async.series([
          // extract important metadata
          // add data to an index data structure
          function(callback) {
              md.metadata(dir+'/'+imgfile, function(err, results) {
                  if (err) callback(err);
                  results.fname = imgfile;
                  results.fnSmallImage = fnSmallImage;
                  results.fnThumbImage = fnThumbImage;
                  metadata.push(results);
                  callback(null, 'metadata');
              });
          },
          // generate small image
          function(callback) {
              im.resize({
                      srcPath: dir+'/'+imgfile,
                      dstPath: dir+'/'+fnSmallImage,
                      quality: 0.99,
                      format: "jpg",
                      progressive: false,
                      width: 500, // TBD make this pluggable
                      filter: "Lagrange",
                      sharpening: 0.2
              },
              function(err, stdout, stderr){
                  if (err) callback(err);
                  callback(null, 'web');
              });
          },
          // generate thumbnail
          function(callback) {
              im.resize({
                      srcPath: dir+'/'+imgfile,
                      dstPath: dir+'/'+fnThumbImage,
                      quality: 0.99,
                      format: "jpg",
                      progressive: false,
                      width: 100, // TBD make this pluggable
                      filter: "Lagrange",
                      sharpening: 0.2
              },
              function(err, stdout, stderr){
                  if (err) callback(err);
                  callback(null, 'thumb');
              });
          },
      ],
      function(err, results) {
        if (err)
            done(err);
        else {
            util.log(util.inspect(results));
            done();
        }
      });
  }, function(err) {
      // if any of the saves produced an error, err would equal that error
      // output index data structure as index.html and images.xml
      if (err) throw new Error(err);
      util.log(util.inspect(metadata));
      
      fs.writeFileSync(dir+"/index.html", 
          ejs.render(tmpl, { locals: { metadata: metadata } }));
  });
});

//setInterval(function() {
//        util.log('beep');
//}, 1000);

