var Q = require("q");
var Qimage = require("qimage");
var fs = require("fs");
var request = require("request");
var tmp = require('tmp');
var url = require('url');

function createNodeWebGLQimage (ImageConstructor) {
  Qimage.Image = ImageConstructor;

  return function nodeWebGLQimage (uri) {
    var parsed = url.parse(uri);
    if (parsed.protocol==='http:' || parsed.protocol==='https:') {
      var requesting = request(uri);
      var ext = parsed.path.match(/\.[a-z]+$/);
      if (!ext) throw new Error("no extension in the URI.");
      return Q.nfcall(tmp.tmpName, { postfix: ext[0] })
        .then(function (tmp) {
          var d = Q.defer();
          requesting.pipe(fs.createWriteStream(tmp)).on('close', d.resolve).on('error', d.reject);
          return d.promise.thenResolve(tmp);
        })
        .then(Qimage);
    }
    else {
      return Qimage(uri);
    }
  };
}

module.exports = createNodeWebGLQimage;
