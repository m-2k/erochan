var D = false; // debug
var engine = {};

function getParameters() {
    var p = {};
    p.DEFAULT_WINDOW_WIDTH = 1920;
    p.CORE_DELAY = 6; // in ms, http://laucheukhim.github.io/frame-rate-distribution/
    p.CORE_PASS_FOR_FREEZING = 3;
    p.DEFAULT_W_DELAY = 3000; // ms
    p.OPACITY_STEP = 0.1;
    return p;
};

function engineInit(container_id) {
    engine = {
        parameters: getParameters(),
        viewbox: document.getElementById('viewbox'),
        timeoutResize: undefined,
        
        // all: undefined,
        backgrounds: {},
        sprites: {},
        textView: undefined,
        textAutoScroll: true,
        selectors: {},
        audioCtx: new (window.AudioContext || window.webkitAudioContext)(),
        audioPlayers: {},
        
        isGameStarted: false,
        isGameModal: false,
        
        fadingCollection: {},
        action: {
            fun: undefined,
            nextFun: undefined,
            isEnded: false,
            elapsedTime: 0
        },
        
        freeze: {
            engineCounter: 0,
            frameCounter: 0,
            isFreezed: false
        }
    };
    
    paper.install(window);
    window.addEventListener('load', engineDomOnload);
    
    
    var requestResize = function() {
        if(engine.timeoutResize) { clearTimeout(engine.timeoutResize); };
        setTimeout(engineWindowResize, 30);
    };
    window.addEventListener('resize', requestResize, false);
    document.addEventListener("fullscreenchange", requestResize, false);
    document.addEventListener("mozfullscreenchange", requestResize, false);
    document.addEventListener("webkitfullscreenchange",requestResize, false);
    document.addEventListener("msfullscreenchange", requestResize, false);
    
    document.addEventListener("keydown", keyHandler, false);
};
function keyHandler(e) {
    // e.ctrlKey && e.which == 70 && engine.parameters.FULLSCREEN ? exitFullscreen() : engineFullscreen();
    if(e.ctrlKey && !e.metaKey && e.which == 70) {
        D && console.log('Key: toggle fullscreen');
        var isFullScreen = document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen;
        if(isFullScreen) { exitFullscreen(); } else { engineFullscreen(); }
    } else if(!e.ctrlKey && !e.metaKey && e.which == 32) { // key which: 32 charCode:0 keyCode:32 metaKey:false ctrlKey:false
        D && console.log('Key: going to next action');
        if(engine.isGameStarted && !engine.isGameModal) engine.action.isEnded = true;
    } else { D && console.log('Key: which='+e.which+' char='+e.charCode+ ' key='+e.keyCode+' meta='+e.metaKey+' ctrl='+e.ctrlKey); }
};
function engineFullscreen() {
    // var el = document.getElementById('main');
    var el = document.body;

    if (el.requestFullscreen) { el.requestFullscreen(); }
    else if (el.webkitRequestFullScreen) { el.webkitRequestFullScreen(); }
    else { el.mozRequestFullScreen(); }
        
    engineWindowResize();
};
function exitFullscreen() {
  if(document.exitFullscreen) { document.exitFullscreen(); }
  else if(document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
  else if(document.mozCancelFullScreen) { document.mozCancelFullScreen(); }
    
  engineWindowResize();
}
function engineDomOnload() {
    
	var canvas = engine.viewbox;
    paper.setup('viewbox');
    view.onFrame = Ui.onFrame;
    
    if(typeof initGame == 'function') {
        initGame();
        
        D && console.log('Loading resources...');
        [engine.backgrounds,engine.sprites].forEach(function(c) {
            for (var k in c) { var mi = c[k]; mi instanceof MultiImage && mi.loadResources(resourceLoaded); };
        });
        
        for (var k in engine.audioPlayers) { // TODO: merge with MultiImage with Loader interface
            var p = engine.audioPlayers[k];
            p instanceof Player && p.loadResources(resourceLoaded);
        };
    }
};
function resourceLoaded(res) {
    var allIsLoaded = true;    
    for(var c of [engine.backgrounds,engine.sprites]) {
        if(!allIsLoaded) break;
        for (var k in c) { if(c[k] instanceof MultiImage && !c[k].isLoaded) { allIsLoaded = false; break; } };
    };
    
    if(allIsLoaded && typeof startGame == 'function') { initEnd(); };
};

function initEnd() {
    engineDraw();
    engine.action.fun = startGame();
    
    mainLoop();
    engine.isGameStarted = true;
};

function mainLoop() {
    var ef = engine.freeze;

    if(!ef.isFreezed) {
        var a = engine.action;
        if(a.isEnded && a.nextFun) {
            var isRendering = engine.textView ? engine.textView.isRendering : false;
            
            if(isRendering) {
                engine.textView.showNow();
                a.isEnded = false;
            } else {
                a.isEnded = false;
                a.elapsedTime = 0;
                a.fun = a.nextFun;
                a.nextFun = undefined;
                a.fun();
            }
        };
    
        for (var key in engine.fadingCollection) {
            var e = engine.fadingCollection[key];
            e && e.onFade();
            D && console.log('fading');
        };
    
        engine.textView && engine.textView.processFrame();
        
        ef.isFreezed = (ef.engineCounter - ef.frameCounter) > engine.parameters.CORE_PASS_FOR_FREEZING;
        ef.engineCounter++;
        
        ef.isFreezed && console.log('freezing!');
    
        a.elapsedTime += engine.parameters.CORE_DELAY;
    }
    setTimeout(mainLoop, engine.parameters.CORE_DELAY);
};

function engineDraw() {
    
    engine.textView = new TextView();
    engine.textView.positioning();
    
    var bgGroup = new Group([]);
    var spGroup = new Group([]);
    var selGroup = new Group([]);
    
    for (var key in engine.backgrounds) {
        var bg = engine.backgrounds[key];
        bg instanceof MultiImage && bgGroup.addChild(bg._renderingElements);
    };
    
    for (var key in engine.sprites) {
        var sp = engine.sprites[key];
        sp instanceof Sprite && spGroup.addChild(sp._renderingElements);
    };
    
    for (var key in engine.selectors) {
        var sel = engine.selectors[key];
        sel instanceof ActionSelector && selGroup.addChild(sel._renderingElements);
    };
    
    // engine.all = new Group([bgGroup, spGroup, engine.textView._renderingElements, selGroup]);
    
    // engine.all = new Group([bgGroup, spGroup, selGroup]);
    // project.addChild(new Layer([engine.textView._renderingElements]));
    
    var l1 = bgGroup;
    var l2 = new Layer([spGroup, engine.textView._renderingElements, selGroup]);
    project.addChild(l2);
    
    // new ActionSelector({actions: [{text:"sas-we-ewf-e-fr-g-tr-grtg-sr-tg-rsfdsjgnrkblsdhbgbfgdfsgs-"},{text: "sus"}]});
};


function engineWindowResize() {

    engine.textView && engine.textView.positioning();
    
    
    for (var key in engine.backgrounds) {
        var bg = engine.backgrounds[key];
        bg instanceof MultiImage && bg.positioning();
    };
    
    for (var key in engine.sprites) {
        var sp = engine.sprites[key];
        sp instanceof Sprite && sp.positioning();
    };
    
    for (var key in engine.selectors) {
        var sel = engine.selectors[key];
        sel instanceof ActionSelector && sel.positioning();
    };
    
    // view.draw();
};

