// function MultiResource(params) {
//     params = params || {};
//     this.name = params.name; // for path creation
//     this.resourceList = {}; // KV flat access
//
//     this._resourceCountTotal = 0;
//     this._resourceCountProcessed = 0;
//     this.isLoaded = false;
//     this.onLoad = undefined;
//     this.fileDirectory = Lib.path(params.fileDirectory);
//     this.fileExtension = params.fileExtension;
// };

function transparentColor() { return new Color(1, 1, 1, 0.01); } // hack for hover events

function MultiImage(params) {
    params = params || {};
    this.name = params.name; // for path creation
    this.rasterList = {}; // KV flat access
    this.mainList = Lib.uniqFast(params.mainList || ['undef']); // TODO: fix & remove undef
    this.addonList = Lib.uniqFast(params.addonList || []);
    
    this._resourceCountTotal = 0;
    this._resourceCountProcessed = 0;
    this.isLoaded = false;
    this.onLoad = undefined;
    this.autoLoad = params.autoLoad || false;
    this._renderingElements = undefined;
    this.fileDirectory = Lib.path(params.fileDirectory || 'images');
    this.fileExtension = params.fileExtension || 'png';
    this.fileAddonExtension = params.fileAddonExtension || 'png';
};
MultiImage.prototype.genNamePart = function() {
    return Array.prototype.join.call(Array.prototype.slice.call(arguments).filter(function(e){ return !!e }),'-');
};
MultiImage.prototype.genName = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this.name);
    return this.genNamePart.apply(this, args);
};
MultiImage.prototype.genPath = function() {
    return [this.fileDirectory,this.name,this.genNamePart.apply(this,arguments)].join('/')+'.'+this.fileExtension;
};
MultiImage.prototype.nameCombinator = function(mainList,addonList,isOnlyDual) {
    
    if(mainList.length == 0) { mainList = addonList; addonList = []; };

    var keyList = [];
    for(var m = 0; m < mainList.length; m++) {
        !isOnlyDual && keyList.push(this.genName(mainList[m]));
        for(var a = 0; a < addonList.length; a++) {
            keyList.push(this.genName(mainList[m],addonList[a]));
        };
    };
    return Lib.uniqFast(keyList);
};
MultiImage.prototype.keyList = function() {
    return this.nameCombinator(this.mainList, this.addonList);
}
MultiImage.prototype.loadResources = function(callback) {
    var keyList = this.keyList();
    this._resourceCountTotal = keyList.length;
    
    var loadingController = function(multiImage) {
        multiImage._resourceCountProcessed++;
        if(multiImage._resourceCountProcessed == multiImage._resourceCountTotal) {
            multiImage.isLoaded = true;
            multiImage.render();
            multiImage.positioning();
            multiImage.modeling();
            D && console.log('MultiImage \''+multiImage.name+'\' loaded');
            callback instanceof Function && callback(multiImage); // engine
            multiImage.onLoad instanceof Function && multiImage.onLoad(multiImage); // user defined
        };
    };
    
    keyList.forEach((function(key) {        
        var path = this.genPath(key);
        D && console.log('Loading image: '+path);
        Lib.loadResource(path,
            (function(path,key,e){ // carring (bind)
                var image = document.createElement('img');
                image.addEventListener('load', (function(e) {
                    var raster = new paper.Raster(image);
                    raster.visible = true;
                    raster.opacity = 0.0;
                    raster.name = key;
                    this.rasterList[key] = raster;
                    loadingController(this);
                    window.URL.revokeObjectURL(image);
                }).bind(this), false);
                image.src = window.URL.createObjectURL(e.target.response);
            }).bind(this,path,key),
            (function(e){
                loadingController(this);
                D && console.log('Error loading image', e);
            }).bind(this), 'blob');
    }).bind(this));
};
MultiImage.prototype.onFade = function() {
    this.positioning();
    this.modeling();
};
MultiImage.prototype.render = function() { };
MultiImage.prototype.modeling = function() {    
    // view.draw();
    return this;
};
MultiImage.prototype.positioning = function() {
};
MultiImage.prototype.checkFading = function() {
    
    var isFading = false;
    for (var key in this._fadeCmd) {
        this._fadeCmd[key] && (isFading = true)
    };
    
    // isFading && Lib.listRemoveElement(engine.fadingCollection,this);
    !isFading && (delete engine.fadingCollection[this.name]);
    return isFading;
};
MultiImage.prototype.incrementHelper = function(logic, value) {
    value += logic ? engine.parameters.OPACITY_STEP : -engine.parameters.OPACITY_STEP;
    value = value > 1 ? 1 : value < 0 ? 0 : value;
    return { isInRange: (value > 0 && value < 1),  value: value };
};

function Scene(params) {
    // MultiImage.apply(this, arguments);
    
    params = params || {};
    this.locationList = params.locationList || ['undef'];
    this.timeList = params.timeList || [];
    this.sectionList = params.sectionList || [];
    this.matterList = params.matterList || [];
    
    params.mainList = this.nameCombinator(this.locationList,this.nameCombinator(this.sectionList, this.timeList));
    params.addonList = Lib.listClone(params.matterList || []);
    params.fileDirectory = params.fileDirectory;
    params.fileExtension = params.fileExtension || 'jpg';
    params.fileAddonExtension = params.fileAddonExtension || 'png';
    
    this.view = {
        location: this.locationList[0],
        section: undefined,
        time: undefined,
        matter: []
    };
    this.scale = 'normal';
    this.visible = false;
    this._fadeCmd = { visible: undefined, scene: undefined, matter: undefined, scale: undefined };
    this._acc = {
        cmd: { visible: undefined, scene: undefined, matter: undefined, scale: undefined }
    };
    
    MultiImage.call(this, params);

    engine.backgrounds[this.name] = this;
};
Scene.prototype = Object.create(MultiImage.prototype);
Scene.prototype.constructor = Scene;
Scene.prototype.genName = function() {
    return this.genNamePart.apply(this, arguments);
};
Scene.prototype.genPath = function() {
    return [this.fileDirectory,this.genName.apply(this,arguments)].join('/')+'.'+this.fileExtension;
};
Scene.prototype.render = function() {
    
    var bgRasters = this.mainList.reduce((function(acc, n) {
        var raster = this.rasterList[n];
        if(raster) { acc.push(raster); }
        return acc;
    }).bind(this), []);
    var bgGroup = new Group(bgRasters);
    bgGroup.name = 'bgMain';
    
    var addonRasters = this.nameCombinator(this.mainList,this.addonList,true).reduce((function(acc, n) {
        var raster = this.rasterList[n];
        if(raster) { acc.push(raster); }
        return acc;
    }).bind(this), []);
    
    var addonGroup = new Group(addonRasters);
    addonGroup.name = 'bgAddon';

    this._renderingElements = new Group([bgGroup,addonGroup]);
    this._renderingElements.opacity = 0.0;
    // this._renderingElements.sendToBack(); // TODO:
};
Scene.prototype.modeling = function() {
    
    var g = this._renderingElements;
    /// VISIBLE BG
    if(this._fadeCmd.visible) {
        g.opacity += this.visible ? 0.1 : -0.1;
        if(g.opacity >= 1.0) { g.opacity = 1.0; this._fadeCmd.visible = undefined; }
        if(g.opacity <= 0.0) { g.opacity = 0.0; this._fadeCmd.visible = undefined; }
        this.checkFading();
    } else {
        g.opacity = this.visible ? 1.0 : 0.0;
    };
    
    
    /// VISIBLE IMG LIST
    var sceneKey = this.genName(this.view.location,this.view.section,this.view.time);
    
    if(this._fadeCmd.scene) {
        var isFadingScene = g.children['bgMain'].children.reduce((function(acc,raster){
            var time = this._fadeCmd.scene.time;
            var factor = time ? 0.025/time : 0.1;
            var o = raster.opacity += raster.name == sceneKey ? factor : -factor;
            raster.opacity = o < 0.0 ? 0.0 : (o > 1.0 ? 1.0 : o);
        
            return (raster.opacity == 0.0 || raster.opacity == 1.0) ? acc : true;
        }).bind(this), false);
    
        if( !isFadingScene ) { this._fadeCmd.scene = undefined; this.checkFading(); };
    } else {
        g.children['bgMain'].children.forEach((function(raster){
            raster.opacity = raster.name == sceneKey ? 1.0 : 0.0;
        }).bind(this));
    }
    

    //
    // var faceKey = this.genName(this.view.body, this.view.face);
    // this._renderingElements.children['face'].children.forEach((function(raster){
    //     // raster.visible = raster.name == faceKey;
    //     raster.opacity = raster.name == faceKey ? 1 : 0;
    // }).bind(this));
    //
    // var wearKeys = this.view.wear.map((function(w) {
    //     return this.genName(this.view.body, w);
    // }).bind(this));
    //
    // this._renderingElements.children['wear'].children.forEach((function(raster){
    //     // raster.visible = wearKeys.indexOf(raster.name) >= 0;
    //     raster.opacity = wearKeys.indexOf(raster.name) >= 0 ? 1 : 0;
    // }).bind(this));
    
    // view.draw();
    return this;
};
Scene.prototype.positioning = function() {
    D && console.log('Scene positioning');
    if(this._renderingElements) {
        var container = engine.viewbox.parentNode;

        var viewSize = new Size(container.clientWidth,container.clientHeight);
        this._renderingElements.fitBounds(view.bounds,true);
    };
};

function Sprite(params) {
    params = params || {};
    
    // self
    this.name = params.name;
    this.personName = params.personName || this.name;
    this.bodyList = params.bodyList || ['undef']; // single (layer 1)
    this.faceList = params.faceList || []; // single (layer 2)
    this.wearList = params.wearList || []; // multiple (layer 3)
    this.thingList = params.thingList || []; // multiple (layer 4)
    this.actions = []; // winking, scratch, yawn, etc.
    
    // prototype
    params.mainList = Lib.listClone(this.bodyList);
    params.addonList = [].concat(this.faceList,this.wearList,this.thingList);
    params.fileDirectory = params.fileDirectory || 'sprites'; // TODO:
    // params.fileExtension = params.fileExtension || 'png';
    // params.fileAddonExtension = params.fileAddonExtension || 'png';
    
    this.view = {
        body: this.bodyList[0],
        face: undefined,
        wear: [],
        thing: []
    };
    this.scale = 'normal';
    this.visible = false;
    this.position = 'center';
    this._fadeCmd = { visible: undefined, pos: undefined, body: undefined, face: undefined, wear: undefined, thing: undefined };
    this._acc = {
        cmd: { visible: undefined, pos: undefined, body: undefined, face: undefined, wear: undefined, thing: undefined }
    };
    
    MultiImage.call(this, params);
    engine.sprites[this.name] = this;
};
Sprite.prototype = Object.create(MultiImage.prototype);
Sprite.prototype.constructor = Sprite;
Sprite.prototype.render = function() {
    
    var bodyRasters = this.bodyList.reduce((function(acc, b) {
        var raster = this.rasterList[this.genName(b)];
        if(raster) { acc.push(raster); }
        return acc;
    }).bind(this), []);
    var bodyGroup = new Group(bodyRasters);
    bodyGroup.name = 'body';
    
    var faceRasters = this.bodyList.reduce((function(acc1, b){
        return acc1.concat(this.faceList.reduce((function(acc2, f) {
            var raster = this.rasterList[this.genName(b,f)];
            if(raster) { acc2.push(raster); }
            return acc2;
        }).bind(this), []));
    }).bind(this), []);
    var faceGroup = new Group(faceRasters);
    faceGroup.name = 'face';
    
    var wearRasters = this.bodyList.reduce((function(acc1, b){
        return acc1.concat(this.wearList.reduce((function(acc2, w) {
            var raster = this.rasterList[this.genName(b,w)];
            if(raster) { acc2.push(raster); }
            return acc2;
        }).bind(this), []));
    }).bind(this), []);
    var wearGroup = new Group(wearRasters);
    wearGroup.name = 'wear';
    

    this._renderingElements = new Group([bodyGroup,faceGroup,wearGroup]);
    this._renderingElements.opacity = 0.0;
};
Sprite.prototype.modeling = function() {
    
    if(this._fadeCmd.visible) {
        var ih = this.incrementHelper(this.visible, this._renderingElements.opacity);
        this._renderingElements.opacity = ih.value;
        this._fadeCmd.visible = ih.isInRange ? true : undefined;
    } else {
        this._renderingElements.opacity = this.visible ? 1.0 : 0.0;
    };
    
    
    var bodyKey = this.genName(this.view.body);
    if(this._fadeCmd.body) {
        var isFade = this._renderingElements.children['body'].children.reduce((function(acc,raster){
            var ih = this.incrementHelper(raster.name == bodyKey, raster.opacity);
            raster.opacity = ih.value;
            return ih.isInRange || acc;
        }).bind(this),false);

        this._fadeCmd.body = isFade ? true : undefined;
    } else {        
        this._renderingElements.children['body'].children.forEach((function(raster){
            raster.opacity = raster.name == bodyKey ? 1 : 0;
        }).bind(this));
    };
    
    
    var faceKey = this.genName(this.view.body, this.view.face);
    if(this._fadeCmd.face) {
        var isFade = this._renderingElements.children['face'].children.reduce((function(acc,raster){
            var ih = this.incrementHelper(raster.name == faceKey, raster.opacity);
            raster.opacity = ih.value;
            return ih.isInRange || acc;
        }).bind(this),false);

        this._fadeCmd.face = isFade ? true : undefined;
    } else {        
        this._renderingElements.children['face'].children.forEach((function(raster){
            raster.opacity = raster.name == faceKey ? 1 : 0;
        }).bind(this));
    };
    
    var wearKeys = this.view.wear.map((function(w) {
        return this.genName(this.view.body, w);
    }).bind(this));
    
    if(this._fadeCmd.wear) {
        var isFade = this._renderingElements.children['wear'].children.reduce((function(acc,raster){
            var ih = this.incrementHelper(wearKeys.indexOf(raster.name) >= 0 , raster.opacity);
            raster.opacity = ih.value;
            return ih.isInRange || acc;
        }).bind(this),false);

        this._fadeCmd.wear = isFade ? true : undefined;
        
    } else {        
        this._renderingElements.children['wear'].children.forEach((function(raster){
            raster.opacity = wearKeys.indexOf(raster.name) >= 0 ? 1 : 0;
        }).bind(this));
    };
    
    this.checkFading();
};
Sprite.prototype.positioning = function() {
    D && console.log('positioningFade');
    if(this._renderingElements) { // resize calling maybe before rendering
        var extendedBounds;
        switch(this.position) {
            case 'left':
                extendedBounds = new Rectangle(view.bounds);
                extendedBounds.width *= 0.5;
                break;
            case 'right':
                extendedBounds = new Rectangle(view.bounds);
                extendedBounds.width *= 0.5;
                extendedBounds.x += extendedBounds.width;
                break;
            default:
                extendedBounds = new Rectangle(view.bounds);
        };
        
        extendedBounds.x -= engine.parameters.DEFAULT_WINDOW_WIDTH;
        extendedBounds.width += engine.parameters.DEFAULT_WINDOW_WIDTH * 2;
        
        if(this._fadeCmd.pos) {
        
            var X_OFFSET = view.bounds.width / 250;
        
            var c1 = extendedBounds.center;
            var c2 = this._renderingElements.bounds.center;
            if( Math.round(c1.x) == Math.round(c2.x) || Math.abs(Math.round(c1.x) - Math.round(c2.x)) <= X_OFFSET ) {
                this._fadeCmd.pos = undefined;
                c2.x = c1.x;                
                this.checkFading();
            }
            else {
                c1.x < c2.x ? c2.x-=X_OFFSET : c2.x+=X_OFFSET;
            }
        } else { this._renderingElements.fitBounds(extendedBounds); };
    }
};

function ActionSelector(params) {
    
    this.name = params.name;
    this.setup(params);
    
    engine.selectors[this.name] = this;
};
ActionSelector.prototype.setup = function(params) {
    params = params || {};
    this.actions = params.actions || [{text: 'undef', callback: function(){}}];
    
    this.render();
};
ActionSelector.prototype.render = function() {
    
    if(this._renderingElements) { this._renderingElements.removeChildren(); }
    else { this._renderingElements = new Group([]); }
    
    this._renderingElements.visible = false;
    
    var SCALE_FACTOR = 1.5;
    var b = view.bounds;
    var count = this.actions.length
    var height = b.height*0.5/count;
    if(height > b.height*0.1) height = b.height*0.1;
    
    for(var a = 0; a < count; a++) {
        
        var t = ActionSelector.renderText(this.actions[a].text);
        // t.strokeColor = '#f30';
        // t.strokeWidth = 4;
        
        var p = new Path.Rectangle(0,height*a,b.width*0.5,height);
        p.fillColor = transparentColor(); // hack for hover events
        // p.strokeColor = '#444';
        // p.strokeWidth = 10;
        p.pointText = t;
        p.actionCallback = this.actions[a].next;
        
        var lambdaShowText = function() {
            var t = this.pointText;
            if (this.isMouseEnter ? t.scaling < t.defaultScaling.multiply(SCALE_FACTOR) : t.scaling > t.defaultScaling) {
                t.scale(this.isMouseEnter ? 1.1 : 0.9);
                // view.draw();
                this.timeoutShowText = setTimeout(lambdaShowText.bind(this), 10);
            }
        };
    
        p.onMouseEnter = function(event) {
            this.timeoutMouseEnter && clearTimeout(this.timeoutMouseEnter);
            this.isMouseEnter = true;
            this.fillColor = new Color(1, 1, 1, 0.2);
            this.timeoutMouseEnter = setTimeout(lambdaShowText.bind(this), 10);
        }
        p.onMouseLeave = function(event) {
            this.timeoutMouseEnter && clearTimeout(this.timeoutMouseEnter);
            this.isMouseEnter = false;
            this.fillColor = transparentColor(); // hack for hover events
            this.timeoutMouseEnter = setTimeout(lambdaShowText.bind(this), 10);
        }
        p.onClick = function(event) {
            if(this.actionCallback instanceof Function) {
                this.parent.visible = false;
                engine.isGameModal = false;
                if(engine.isGameStarted) engine.action.isEnded = true;
                Api.next(this.actionCallback);
            }
        }
        
        this.actions[a].areaScene = p;
        this.actions[a].areaText = t;
        
        this._renderingElements.addChildren([t,p]);
    }
    this.positioning();
};
ActionSelector.prototype.positioning = function() {
    var b = view.bounds;
    var c = this.actions.length
    var w = b.width*0.5;
    var h = b.height*0.5/c;
    if(h > b.height*0.1) h = b.height*0.1;

    var x = (b.width - w) * 0.5;
    var y = (b.height - h*c) * 0.5;

    for(var a = 0; a < c; a++) {
        var nb = new Rectangle(0, y + (h*a), b.width, h);
        var nt = new Rectangle(x, y + (h*a), w, h);
        this.actions[a].areaScene.bounds = nb;
        var t = this.actions[a].areaText;
        t.fitBounds(nt);
        t.defaultScaling = t.scaling;
    }
};
ActionSelector.renderText = function(text) {
    
    var t = new PointText(new Point(0,0));
    t.fillColor = new Color(1, 1, 1);
    t.fontSize = 60;
    t.fontFamily = 'Open Sans Condensed'
    t.shadowColor = new Color(0, 0, 0)
    t.shadowBlur = 10
    t.content = text;
    return t;
};



function TextView() {    
    this.panel = new Path.Rectangle(view.bounds);
    this.panel.fillColor = new Color(1, 1, 1, 0.5);
    // this.panel.fillColor = '#000';
    // this.panel.blendMode = 'screen'
    this.panel.blendMode = 'xor'
    this.textBox = new Group([]);
    this._renderingElements = new Group([this.panel, this.textBox]);
    
    this.clear();
};
TextView.prototype.clear = function() {
    this.text = undefined;
    this.isEmerging = false; // time up to all timeouts for reading
    this.isRendering = false; // time up to all elements is visibled
    this.timePauseTotal = 0;
    this.timeAutoScroll = 0;
    this.enumerator = undefined;
    this.textLength = 0;
    this.textBox.removeChildren();
    this._renderingElements.opacity = 0.0;
};
TextView.prototype.positioning = function() {
    var TV_SIZE = 30; // percent
    var TEXT_MARGIN = new Rectangle(50,20,50,20); // px (left,top,right,bottom)
    var bw = view.bounds.width;
    var bh = view.bounds.height;
    this.panel.bounds = new Rectangle(0,bh*((100.0-TV_SIZE)*0.01),bw,bh*TV_SIZE*0.01);
    this.textBox && this.textBox.fitBounds(new Rectangle(
                this.panel.bounds.point.add(TEXT_MARGIN.point),
                this.panel.bounds.size.subtract(TEXT_MARGIN.size.add(TEXT_MARGIN.point))));
};
TextView.prototype.processFrame = function() {
    if (this.enumerator) {
        if(this.enumerator.pause && this.enumerator.pause > 0) {
            this.enumerator.pause -= engine.parameters.CORE_DELAY;
        } else {
            this.enumerator.opacity = 1;
            this.enumerator = this.enumerator.next;
        }
    } else {
        this.isRendering = false;
    }
    
    // if(this.isEmerging && engine.timeFrameCount > this.timeAutoScroll) {
    if(this.isEmerging && engine.action.elapsedTime > this.timeAutoScroll) {
        this.isEmerging = false;
        engine.action.isEnded = true;
    };
};
TextView.prototype.render = function(text) {
    
    var SPEED_FACTOR = 2;
    var SPEED_FIXED_DELAY = 2000; // 50;
    this.clear();
    this.text = text;
    var tg = this.renderText(text);
    this.textBox.addChild(tg);
    this.enumerator = tg.enumerator.first;
    this.textLength = tg.enumerator.count;
    // this.timeAutoScroll = engine.timeFrameCount + this.textLength + (this.textLength * SPEED_FACTOR) + SPEED_FIXED_DELAY;
    this.timeAutoScroll = engine.action.elapsedTime + (this.textLength * engine.parameters.CORE_DELAY) +
        this.timePauseTotal + (this.textLength * SPEED_FACTOR) + SPEED_FIXED_DELAY;
    // this.timeoutShowTextEnd = setTimeout(function(){ engine.action.isEnded = true; }, 10000);
    // this.isEmerging = true;
    
    this.isEmerging = true;
    this.isRendering = true;
    this._renderingElements.opacity = 1.0;
    
    this.positioning();
    // view.draw();
};
// https://github.com/paperjs/paper.js/issues/741
TextView.prototype.renderText = function(text) {
    var LINE_OFFSET = 2; // px
    var MINIMAL_LINE_COUNT = 4;
    var group = new Group();
    var point = new Point(0, 0);
    var lines = text.split(/\r\n|\n|\r/mg);
    var WHITESPACE = '　';
    
    // if(MINIMAL_LINE_COUNT && lines.length < MINIMAL_LINE_COUNT) {
        for(; lines.length<MINIMAL_LINE_COUNT; ) { lines.push(WHITESPACE) };
    // }
    
    group.enumerator = { first: undefined, last: undefined, count: 0};
    for(var i=0; i < lines.length; i++) {
        lineItem = this.renderLine(lines[i], point, group.enumerator);
        // if(group.children.length > 0) { group.lastChild.next = lineItem.firstChild }; // TODO:
        group.addChild(lineItem);
        point = new Point(point.x, point.y + lineItem.bounds.height + LINE_OFFSET);
    }
    return group;
};
TextView.prototype.renderLine = function(line, point, enumerator) {
    var group = new Group(), arr = this.parseText(line);
    for(var i=0; i < arr.length; i++) {
        var elem;

        if(typeof arr[i] === 'number') { // Pause
            elem = {pause: arr[i]};
            this.timePauseTotal += arr[i];
        } else { // Symbol
            var ti = new PointText(point);
            ti.fillColor = new Color(1, 1, 1);
            ti.opacity = 0;
            ti.content = arr[i];
            ti.fontSize = 60;
            ti.fontFamily = 'Open Sans Condensed'
            ti.shadowColor = new Color(0, 0, 0)
            ti.shadowBlur = 10

            elem = ti;
            group.addChild(ti);
            point = new Point(point.x + ti.bounds.width, point.y);
        }

        // Enumerator
        if(enumerator.first) {
            elem.prev = enumerator.last;
            enumerator.last.next = elem;
            enumerator.last = elem; }
        else { enumerator.last = enumerator.first = elem }
        enumerator.count++;
    }
    return group;
};
TextView.prototype.parseText = function(text) {
    var regexp = /{w}/g, arr = [], firstIndex = 0;
    var push = function(a,t,start,end) {
        // start != end && (Array.prototype.splice.apply(a,[-1,0].concat(t.slice(start,end).split(''))))
        return start == end ? a : a.concat(t.slice(start,end).split(''));
    };
    while (true) {
        var r=regexp.exec(text);
        if(r) {
            arr = push(arr,text,firstIndex,r.index);
            // arr.push(r[0]);
            arr.push(engine.parameters.DEFAULT_W_DELAY);
            firstIndex = regexp.lastIndex;
        }
        else { arr = push(arr,text,firstIndex,text.length); break; }
    }
    return arr;
};
TextView.prototype.showNow = function() {
    while (this.enumerator) {
        this.enumerator.opacity = 1;
        this.enumerator = this.enumerator.next;
    };
    this.isRendering = false;
    engine.action.isEnded = true;
    // this.timeAutoScroll = -1;
    // this.processFrame();
};
// TextView.prototype.renderLine = function(line, point, enumerator) {
//     var group = new Group(), words = line.split(/ /mg);
//     for(var i=0; i < words.length; i++) {
//         wordItem = this.renderWord(words[i] + ' ', point, enumerator);
//         group.addChild(wordItem);
//         point = new Point(point.x + wordItem.bounds.width, point.y);
//     }
//     return group;
// };
// TextView.prototype.renderWord = function(word, point, enumerator) {
//     var group = new Group(), letters = word.split('');
//     for(var i=0; i < letters.length; i++) {
//         // var lightness = (Math.random() - 0.5) * 0.4 + 0.4
//         // var hue = Math.random() * 360
//         var ti = new PointText(point);
//         ti.fillColor = new Color(1, 1, 1);
//         ti.opacity = 0;
//         ti.content = letters[i];
//         ti.fontSize = 60;
//         ti.fontFamily = 'Open Sans Condensed'
//         ti.shadowColor = new Color(0, 0, 0)
//         ti.shadowBlur = 10
//
//         if(enumerator.first) { ti.prev = enumerator.last; enumerator.last.next = ti; enumerator.last = ti; }
//         else { enumerator.last = enumerator.first = ti }
//         enumerator.count++;
//
//         group.addChild(ti);
//         point = new Point(point.x + ti.bounds.width, point.y);
//     }
//     return group;
// };

function Ui() {
    
};

Ui.onFrame = function(event) {
    // engine.timeFrameCount = event.count;
    engine.freeze.engineCounter = engine.freeze.frameCounter = 0;
    engine.freeze.isFreezed = false;
    
    // for (var key in engine.fadingCollection) {
//         var e = engine.fadingCollection[key];
//         e && e.positioning();
//         e && e.modeling();
//         D && console.log('fading: '+event.count);
//     };
//
//     engine.textView && engine.textView.processFrame();
};

// Ui.Raster = function() {
//     var raster = new (paper.Raster.bind.apply(paper.Raster, arguments))();
//     raster.onLoad = function() { this.loaded = true; engineWindowResize(); };
//     return raster;
// };

// Ui.Raster = function(img) {
//     var raster = new paper.Raster(img);
//     raster.onLoad = function() { this.loaded = true; };
//     return raster;
// };

// Ui.byteArrayToRaster = function(blob) {
//     var img = document.createElement('img');
//     var object = window.URL.createObjectURL(blob);
//     img.src = object;
//     img.addEventListener('load', function(e) {
//         // debugger;
//         D && console.log('img loaded');
//     });
//      D && console.log('exit cb');
//     // window.URL.revokeObjectURL(object);
//
//     return Ui.Raster(img);
// };

// r = new Path.Rectangle(dv._renderingElements.firstChild.bounds);
// dv._renderingElements.addChild(r);
// r.selected = true; view.draw()
// r.opacity = 0.7; view.draw()
// r.fillColor = '#444'; view.draw()
// r.blendMode = 'source-atop'; view.draw()
// b = dv._renderingElements.children.body.children[dv.genName(dv.view.body)];
// b.blendMode = 'destination-atop'; view.draw()

