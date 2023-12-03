game.import("extension",function(lib,game,ui,get,ai,_status){//name:"千幻方舟套装"
    const SUIT_NAME = "千幻方舟套装";
    const SUIT_SHORT_NAME = "明日方舟";
    const SUIT_PATH = lib.assetURL + "extension/"+SUIT_NAME;
    const SUIT_IMAGE_PATH = SUIT_PATH+"/image";
    const QHLY_PATH = lib.assetURL + "extension/千幻聆音";
    return {name:SUIT_NAME,

  content:function(config,pack){
    let loadSuit = function(){
        game.qhly_refreshSuits();
    };
    if(_status.qianhuanLoaded){
        loadSuit();
    }else{
        if(!lib.doAfterQianhuanLoaded){
            lib.doAfterQianhuanLoaded = [];
        }
        lib.doAfterQianhuanLoaded.push(loadSuit);
    }
},precontent:function(){
    if(typeof window.qhly_import!='function'){
        window.qhly_import = function(func){
            func(lib, game, ui, get, ai, _status);
        }
    }
    lib.init.jsForExtension([QHLY_PATH+"/model/diy.js",SUIT_PATH+"/main.js"]);
},config:{},help:{},package:{
    character:{
        character:{
        },
        translate:{
        },
    },
    card:{
        card:{
        },
        translate:{
        },
        list:[],
    },
    skill:{
        skill:{
        },
        translate:{
        },
    },
    intro:"",
    author:"寰宇星城",
    diskURL:"",
    forumURL:"",
    version:"1.0",
},files:{"character":[],"card":[],"skill":[],"audio":[]}}})