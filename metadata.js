var im   = require('imagemagick');
var async = require('async');

exports.metadata = function(imgfn, done) {
    async.series([
        function(callback) {
            im.identify(['-format', '%[EXIF:DateTime]', imgfn], function(err, data){
              if (err) callback(err);
              callback(null, { 'date': data ? data.trimRight() : "" });
            });
        },
        function(callback) {
            im.identify(['-format', '%[EXIF:DateTimeDigitized]' , imgfn], function(err, data){
              if (err) callback(err);
              callback(null, { 'dateDigitized': data ? data.trimRight() : "" });
            });
        },
        function(callback) {
            im.identify(['-format', '%[EXIF:DateTimeOriginal]' , imgfn], function(err, data){
              if (err) callback(err);
              callback(null, { 'dateOriginal': data ? data.trimRight() : "" });
            });
        },
        function(callback) {
            im.identify(['-format', '%[EXIF:ExifImageLength]' , imgfn], function(err, data){
              if (err) callback(err);
              callback(null, { 'length': data ? data.trimRight() : "" });
            });
        },
        function(callback) {
            im.identify(['-format', '%[EXIF:ExifImageWidth]' , imgfn], function(err, data){
              if (err) callback(err);
              callback(null, { 'width': data ? data.trimRight() : "" });
            });
        },
        function(callback) {
            im.identify(['-format', '%[EXIF:GPSLatitude]', imgfn], function(err, data){
              if (err) callback(err);
              callback(null, { 'GPSLatitude': data ? data.trimRight() : "" });
            });
        },
        function(callback) {
            im.identify(['-format', '%[EXIF:GPSLatitudeRef]', imgfn], function(err, data){
              if (err) callback(err);
              callback(null, { 'GPSLatitudeRef': data ? data.trimRight() : "" });
            });
        },
        function(callback) {
            im.identify(['-format', '%[EXIF:GPSLongitude]', imgfn], function(err, data){
              if (err) callback(err);
              callback(null, { 'GPSLongitude': data ? data.trimRight() : "" });
            });
        },
        function(callback) {
            im.identify(['-format', '%[EXIF:GPSLongitudeRef]', imgfn], function(err, data){
              if (err) callback(err);
              callback(null, { 'GPSLongitudeRef': data ? data.trimRight() : "" });
            });
        },
        function(callback) {
            im.identify(['-format', '%[IPTC:2:25]', imgfn], function(err, data){
              if (err) callback(err);
              callback(null, { 'Keywords': data ? data.trimRight().split(';') : "" });
            });
        },
        function(callback) {
            im.identify(['-format', '%[IPTC:2:55]', imgfn], function(err, data){
              if (err) callback(err);
              callback(null, { '2-55': data ? data.trimRight() : "" });
            });
        },
        function(callback) {
            im.identify(['-format', '%[IPTC:2:60]', imgfn], function(err, data){
              if (err) callback(err);
              callback(null, { '2-60': data ? data.trimRight() : "" });
            });
        },
        function(callback) {
            im.identify(['-format', '%[IPTC:2:120]', imgfn], function(err, data){
              if (err) callback(err);
              callback(null, { 'Caption': data ? data.trimRight() : "" });
            });
        }
    ], 
    function(err, results) {
        var res = {};
        results.forEach(function(element, index, array) {
            for (item in element) {
                Object.defineProperty(res, item, {
                    value: element[item],
                    writable: false,  
                    enumerable : true,  
                    configurable : false
                });
            }
        });
        done(err, res);
    });
}

