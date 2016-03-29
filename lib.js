
var IS_LOCALHOST = false;

function Lib() {
};

Lib.debug = true;

Lib.path = function(p) {
    var prefix = typeof ROOT_URL_PATH == 'undefined' ? undefined : ROOT_URL_PATH;
    return IS_LOCALHOST ? p : [prefix,p].join('/');
};

Lib.listClone = function(list) {
    return list.slice(0);
};
Lib.listRemoveElement = function(list,e) {
    var i = list.indexOf(e);
    i > -1 && list.splice(i,1);
    return list;
};
Lib.uniqFast = function(list) {
    var seen = {}, out = [], len = list.length, j = 0;
    for(var i = 0; i < len; i++) {
         var item = list[i];
         if(seen[item] !== 1) { seen[item] = 1; out[j++] = item; }
    }
    return out;
}
Lib.uniq = function(list) {
   return Array.from(new Set(list));
}

Lib.hashLength = function(hash) { Object.keys(hash).length; };

Lib.loadResource = function(url, callbackComplete, callbackFailed, responseType) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    // xhr.overrideMimeType("audio/ogg;");
    xhr.responseType = responseType || 'arraybuffer';
    // oReq.addEventListener("progress", callback);
    // xhr.addEventListener("load", callbackComplete);
    xhr.addEventListener("load", function(e){
        // Lib.debug && console.log('L '+xhr.status+' '+xhr.readyState);
        if(xhr.readyState == 4) { xhr.status == (IS_LOCALHOST ? 0 : 200) ? callbackComplete(e) : callbackFailed(e); } // status 0 with FS serving
    });
    // xhr.onreadystatechange = function(e) {
    //     Lib.debug && console.log(xhr.status);
    // };
    xhr.addEventListener("error", callbackFailed);
    xhr.addEventListener("abort", callbackFailed);
    // xhr.addEventListener("error", function(e){
    //     // Lib.debug && console.log('E '+xhr.status+' '+xhr.readyState);
    //     callbackFailed(e);
    // });
    // xhr.addEventListener("abort", function(e){
    //     Lib.debug && console.log('A '+xhr.status+' '+xhr.readyState);
    //     callbackFailed(e);
    // });
    xhr.send();
};

Lib.audioLoad = function(url, audioCtx, callback) {
    Lib.loadResource(url, function(e) {
        audioCtx.decodeAudioData(e.target.response, function(decodedArrayBuffer) {
            callback(decodedArrayBuffer);
        }, function(e) {
            Lib.debug && console.log('Error decoding file', e);
            callback(false);
        });
    }, function(e) {
        Lib.debug && console.log('Error loading file', e);
        callback(null);
    });
};

Lib.audioPlay = function(source, decodedArrayBuffer) {
    source.buffer = decodedArrayBuffer;
    source.start(0);
}

Lib.audioStop = function(source) {
    source.stop(0);
};