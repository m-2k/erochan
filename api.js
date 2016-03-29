function Api() { };
Api.next = function(f) { engine.action.nextFun = f; };
Api.end  = function()  { engine.action.nextFun = undefined; };
Api.text = function(t) { engine.textView.render(t); };
Api.fade = function(e, time) {
    var fadeCmdCount = 0;
    for (var key in e._acc.cmd) {
        var acc = e._acc.cmd[key];
        acc && (acc.time = time);
        acc && (e._fadeCmd[key] = acc) && fadeCmdCount++;
    };
    e._acc.cmd = {};
    
    if(fadeCmdCount > 0)  { engine.fadingCollection[e.name] = e; }
};
// Api.hideDialogBox = function() { engine.textView.hide(); };
// Api.showDialogBox = function() { engine.textView.show(); };

Sprite.prototype.show = function() { this.visible = true; this._acc.cmd.visible = true; return this; };
Sprite.prototype.hide = function() { this.visible = false; this._acc.cmd.visible = true; return this; };
Sprite.prototype.body = function(b) {
    this.view.body = b;
    this._acc.cmd.body = true;
    this._acc.cmd.wear = true;
    this._acc.cmd.face = true;
    // this._acc.cmd.thing = true; // TODO:
    return this;
};
Sprite.prototype.face = function(f) {
    // this.view.face = this.faceList.indexOf(f);
    this.view.face = f;
    this._acc.cmd.face = true;
    return this;
};
Sprite.prototype.wear = function(w) {
    // w = w instanceof Array ? w : w == "" ? [] : w.trim().split(/\ +/);
    // this.view.wear = [];
    // for(var i=0; i < w.length; i++) {
    //     var idx = this.wearList.indexOf(w[i]);
    //     if(idx >= 0) { this.view.wear.push(idx) };
    // };
    this.view.wear = w instanceof Array ? w : w == "" ? [] : w.trim().split(/\ +/);
    this._acc.cmd.wear = true;
    return this;
};
Sprite.prototype.pos = function(p) {
    this.position = p;
    // this.positioning(); // TODO: move to now()
    this._acc.cmd.pos = true;
    return this;
};
Sprite.prototype.now = function() {
    this._acc.cmd = {};
    this.modeling();
    return this;
};
Sprite.prototype.fade = function(time) {
    Api.fade(this,time);
    return this;
};
Sprite.prototype.say       = function(t) { engine.textView.render(this.personName+':\n'+t); return this; }; // диалог
Sprite.prototype.think     = function(t) { engine.textView.render('-\n~~ '+t+' ~~'); return this; }; // мысли
Sprite.prototype.narration = function(t) { engine.textView.render('-\n'+t); return this; }; // повествование
// Sprite.prototype.next = function(f) { Api.next(f); };
Sprite.prototype.next = Api.next;
Sprite.prototype.end = Api.end;

Scene.prototype.show = function() { this.visible = true; this._acc.cmd.visible = {}; return this; };
Scene.prototype.hide = function() { this.visible = false; this._acc.cmd.visible = {}; return this; };
Scene.prototype.loc = function(l) { this.view.location = l; this._acc.cmd.scene = {}; return this; };
Scene.prototype.sec = function(s) { this.view.section = s; this._acc.cmd.scene = {}; return this; };
Scene.prototype.time = function(t) { this.view.time = t; this._acc.cmd.scene = {}; return this; };
Scene.prototype.now = function() {
    // this._renderingElements.opacity = this.visible ? 1.0 : 0.0;
    this._acc.cmd = {};
    this.modeling();
    return this;
};
Scene.prototype.fade = function(time) {
    Api.fade(this,time);
    return this;
};
Scene.prototype.next = Api.next;

ActionSelector.prototype.select = function(selections) {
    engine.isGameModal = true;
    this.setup(selections);
    this._renderingElements.visible = true;
};

Player.prototype.play = function(track) {
    track && ( this.state.track = track );
    this._acc.cmd.stop = undefined;
    this._acc.cmd.play = {};
    return this;
};
Player.prototype.stop = function() {
    this._acc.cmd.play = undefined;
    this._acc.cmd.stop = {};
    return this;
};
Player.prototype.pause = function() {
    this._acc.cmd.pause = {};
    return this;
};
Player.prototype.volume = function(v) {
    this.state.volume = v;
    this._acc.cmd.volume = {};
    return this;
};
Player.prototype.effect = function(sfx) {
    // TODO: not implemented
    return this;
};
Player.prototype.now = function() {
    this._acc.cmd.play && this.playCurrent();
    this._acc.cmd.stop && this.stopCurrent();
    this._acc.cmd = {};
    return this;
};
Player.prototype.fade = function(time) {
    Api.fade(this,time);
    return this;
};