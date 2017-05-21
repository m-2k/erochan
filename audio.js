function Player(params) {
    params = params || {};
    this.name = params.name || 'player';
    this.mediaList = {}; // Audio Buffers
    // this.nodeList = {}; // Audio Nodes (composited)
    this.trackList = Lib.uniqFast(params.trackList || ['undef']); // TODO: fix & remove undef
    this.isLooped = params.isLooped || false;

    this._resourceCountTotal = 0;
    this._resourceCountProcessed = 0;
    this.isLoaded = false;
    this.onLoad = undefined;
    this.fileDirectory = Lib.path(params.fileDirectory || 'audio');
    this.fileExtension = params.fileExtension || 'ogg';
    
    this.state = { track: this.trackList[0], volume: 1 };
    this._fadeCmd = { play: undefined, stop: undefined, pause: undefined, volume: undefined };
    this._acc = { cmd: { play: undefined, stop: undefined, pause: undefined, volume: undefined } };
};
Player.prototype.audioContext = function() {
    return engine.audioCtx;
};
Player.prototype.genPath = function(track) {
    return [this.fileDirectory,track].join('/')+'.'+this.fileExtension;
};
Player.prototype.loadResources = function(callback) {
    this._resourceCountTotal = this.trackList.length;
    
    var loadingController = function(player) {
        player._resourceCountProcessed++;
        if(player._resourceCountProcessed == player._resourceCountTotal) {
            player.isLoaded = true;
            // player.assignNodes();
            D && console.log('Player \''+player.name+'\' loaded');
            callback instanceof Function && callback(player); // engine
            player.onLoad instanceof Function && player.onLoad(player); // user defined
        };
    };
        
    this.trackList.forEach((function(track) {
        var url = this.genPath(track);
        D && console.log('Loading audio: ' + url);
        Lib.loadResource(url, (function(e) {
            this.audioContext().decodeAudioData(e.target.response, (function(audioBuffer) {
                this.mediaList[track] = { buffer: audioBuffer, offset: 0, start: 0 };
                loadingController(this);
                D && console.log('Audio loaded and decoded completed: ' + url);
                }).bind(this), (function(e) {
                    D && console.log('Error decoding file', e);
                    loadingController(this);
                }).bind(this));
        }).bind(this), (function(e) {
            D && console.log('Error loading audio', e);
            loadingController(this);
        }).bind(this));
    }).bind(this));
};
Player.prototype.playCurrent = function() {
    // this.nodeList[this.state.track].source.start(0);
    
    var media = this.mediaList[this.state.track];
    
    if (media.source && media.source.playbackState == AudioBufferSourceNode.PLAYING_STATE) return;
    
    var gainNode = this.audioContext().createGain();
    // gainNode.gain.value = 0.3;
    var sourceNode = this.audioContext().createBufferSource();
    sourceNode.buffer = media.buffer;
    sourceNode.loop = this.isLooped;
    // sourceNode.onended = (function() { media. }).bind(this);
    
    sourceNode.connect(gainNode);
    gainNode.connect(this.audioContext().destination);
    
    media.gain = gainNode;
    media.source = sourceNode;
    media.start = this.audioContext().currentTime;
    sourceNode.start(media.start, media.offset % media.buffer.duration);
};
Player.prototype.stopCurrent = function() {
    var media = this.mediaList[this.state.track];    
    if (media.source && media.source.playbackState != AudioBufferSourceNode.FINISHED_STATE) {
        media.source.stop();
        media.offset += this.audioContext().currentTime - media.start;
    };
};
Player.prototype.onFade = function() {
    
};

function Ambient() {};
function Music(params) {
    params = params || {};
    params.name = params.name || 'musicPlayer';
    params.isLooped = params.isLooped || true;
    Player.call(this, params);
    engine.audioPlayers[params.name] = this;
};
Music.prototype = Object.create(Player.prototype);
Music.prototype.constructor = Music;

function Sfx() {};
function Speech() {};