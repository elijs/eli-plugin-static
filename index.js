"use strict";

var marked  = require('marked');
var fs      = require('fs');
var mkdirp  = require('mkdirp');
var path    = require('path');
var resolve = path.resolve;


module.exports = function eli_plugin_static(eli) {
    var config = require(resolve('config'))['static'];
    var static_dir = resolve(('dir' in config ? config.dir : 'public'));

    if ('markdown' in config) {
        marked.setOptions(config.markdown);
    }

    eli.on('publish', eliOnPublish);

    function eliOnPublish(post, cb) {
        console.log('Plugin ‘static’ received message ‘%s’.', post);

        var today = new Date();
        var dir_path = path.join(static_dir, today.getUTCFullYear() + '', ('0' + (today.getUTCMonth() + 1)).slice(-2));
        var file_name = ('0' + today.getUTCDate()).slice(-2) + '.html';
        var file_path = path.join(dir_path, file_name);

        fs.exists(dir_path, function (exists) {
            if (!exists) {
                mkdirp(dir_path, function (err) {
                    if (err) {
                        throw err;
                    }

                    writeFile(file_path, post, cb);
                });
            } else {
                writeFile(file_path, post, cb);
            }
        });   
    }

    function writeFile(file_path, post, cb) {
        /* post is a buffer */
        var markdown = post.toString();
        
        fs.writeFile(file_path, marked(markdown), function (err) {
            if (err) {
                throw err;
            }

            console.log('Static page ‘%s’ written to ‘%s’.', path.basename(file_path), path.dirname(file_path));
            cb();
        });
    }
};
