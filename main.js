'use strict';

window.qhly_import(function(lib, game, ui, get, ai, _status){
    const SUIT_NAME = "千幻方舟套装";
    const SUIT_PATH = lib.assetURL + "extension/"+SUIT_NAME;
    const SUIT_SHORT_NAME = "明日方舟";

    if (!lib.qhly_viewskin) {
        lib.qhly_viewskin = {};
    }
    lib.qhly_viewskin[SUIT_NAME] = {
        name: SUIT_SHORT_NAME,
        whr:1.7778,
        extensionPath:'extension/'+SUIT_NAME,
        audioDir:'audio',//音频文件夹
        fontDir:'font',//字体文件夹
        onchange: function () {
            game.saveConfig('qhly_viewskin_css',"extension/"+SUIT_NAME);
        },
        changeViewSkin: function (view) {

        },
        skinPage: function (pageName, view) {

        }
    };

    if(lib.config.qhly_currentViewSkin != SUIT_NAME){
        return;
    }

    lib.qhlydiy.addSuitFont('qh_huakangsongti','huakangsongti.woff2');

    //头部按钮
    class HeadButton extends ui.qhly.SwitchButton{
        constructor(str,checked){
            super(str,checked,'check');
            this.addCssClass('qhlydiy-headbutton');
            this.setCheckedCssClass('qhlydiy-headbutton-checked');
            this.addChild(new ui.qhly.Panel('qhlydiy-headbutton-flag'));
            this.addCheckedStateChangeListener(()=>{
                lib.qhlydiy.playSuitAudio('click.mp3',true);
            });
        }
    };

    //角色面板板块
    class CharacterPanel extends ui.qhly.Panel{
        constructor(){
            super('qhlydiy-characterpanel');
            this.introducePanel = this.addChild(new ui.qhly.Panel('qhlydiy-introduce'));;
            this.namePanel = this.addChild(new ui.qhly.Panel('qhlydiy-charactername'));
            this.groupAndHpPanel = this.addChild(new ui.qhly.Panel('qhlydiy-group-and-hp'));
            this.starPanel = this.addChild(new ui.qhly.Panel('qhlydiy-stars'));
            this.titlePanel = this.addChild(new ui.qhly.Panel('qhlydiy-title'));
            this.groupCoverPanel = this.groupAndHpPanel.addChild(new ui.qhly.Panel('qhlydiy-group'));
            this.groupPanel = this.groupCoverPanel.addChild(new ui.qhly.Panel('qhlydiy-groupcenter'));
            this.groupAPanel = this.groupCoverPanel.addChild(new ui.qhly.Panel('qhlydiy-doublegroupleft'));
            this.groupBPanel = this.groupCoverPanel.addChild(new ui.qhly.Panel('qhlydiy-doublegroupright'));
            this.barPanel = this.groupAndHpPanel.addChild(new ui.qhly.Panel('qhlydiy-bars'));
            this.hpBar = this.barPanel.addChild(new HpBarPanel());
            this.mpBar = this.barPanel.addChild(new CommonBarPanel({itemClass:'qhlydiy-mp-item'}));
            this.shieldBar = this.barPanel.addChild(new CommonBarPanel({itemClass:'qhlydiy-shield-item'}));
            this.mpBar.hide();
            this.shieldBar.hide();
            this.avatar = this.addChild(new ui.qhly.Avatar('qhlydiy-mainavatar',{
                backFrame:'qhlydiy-mainavatar-frameback',
                picture:'qhlydiy-mainavatar-picture',
                frontFrame:'qhlydiy-mainavatar-framefront',
            }));
            this.skinChangeLine = this.addChild(new SkinChangeButtonsLine());
            this.skinChangeLine.addIndexChangeListener((index)=>{
                if(this.characterName && this.skinModels){
                    game.qhly_setCurrentSkin(this.characterName,this.skinModels[index].skinId,()=>{
                        this.avatar.setCharacter(this.characterName,true);
                        this.refreshTitle();
                    },true);
                }
            });
        }
        setCharacter(name){
            this.characterName = name;
            this.pkg = null;
            this.refresh();
        }
        refresh(){
            let name = this.characterName;
            let pkg = game.qhly_foundPackage(name);
            this.pkg = pkg;
            if(this.pkg.isLutou || lib.config.qhly_lutou){
                this.avatar.addCssClass('qhlydiy-lutou');
            }else{
                this.avatar.removeCssClass('qhlydiy-lutou');
            }
            this.introducePanel.setHtml(get.qhly_getIntroduce(name,pkg));
            this.namePanel.setHtml(this.getTranslatedName(name));
            this.starPanel.setAttribute('starcount',this.getStars(name,pkg));
            this.avatar.setCharacter(name,true);
            this.refreshGroup();
            this.refreshTitle();
            this.refreshHp();
            this.refreshSkins();
        }
        refreshSkins(){
            let name = this.characterName;
            game.qhly_getSkinModels(name,(list)=>{
                this.skinModels = list;
                this.skinChangeLine.setNum(list.length);
                this.skinChangeLine.setCurrent(list.findIndex((item)=>{
                    let currentSkin = game.qhly_getSkin(name);
                    if(item.skinId == currentSkin){
                        return true;
                    }else if(!item.skinId && !currentSkin){
                        return true;
                    }
                    return false;
                }));
            },false,true);
        }
        refreshHp(){
            let barCount = 1;
            let hpStr = get.character(this.characterName,2);
            this.hpBar.setHp(hpStr);
            let mp = get.qhly_getMp(this.characterName);
            let hasMp = mp!==undefined && mp !== null;
            let arr = [this.hpBar];
            if(hasMp){
                barCount ++;
                arr.push(this.mpBar);
                this.mpBar.show();
                this.mpBar.setValue(mp);
            }else{
                this.mpBar.hide();
            }
            let hasShield = (get.infoHujia(get.character(this.characterName,2)) > 0);
            if(hasShield){
                barCount++;
                arr.push(this.shieldBar);
                this.shieldBar.show();
                this.shieldBar.setValue(get.infoHujia(get.character(this.characterName,2)));
            }else{
                this.shieldBar.hide();
            }
            let tops = ["50%"];
            if(barCount == 1){
                tops = ["50%"];
            }else if(barCount == 2){
                tops = ["25%","75%"];
            }else if(barCount == 3){
                tops = ["16.67%","50%","83.33%"];
            }
            arr.forEach((item,index)=>{
                item.setCssStyle({
                    top:tops[index],
                    transform:'translate(0%, -50%)',
                });
            });
        }
        refreshGroup(){
            let name = this.characterName;
            if(!get.is.double(name)){
                let group = get.character(name,1);
                this.groupPanel.show();
                this.groupPanel.setHtml(get.translation(group));
                this.groupAPanel.hide();
                this.groupBPanel.hide();
            }else{
                let groups = get.is.double(name,true);
                this.groupAPanel.show();
                this.groupBPanel.show();
                this.groupPanel.hide();
                this.groupAPanel.setHtml(get.translation(groups[0]));
                this.groupBPanel.setHtml(get.translation(groups[1]));
            }
        }
        getCharacterPkg(){
            if(!this.pkg){
                this.pkg = game.qhly_foundPackage(this.characterName);
            }
            return this.pkg;
        }
        refreshTitle(){
            let title = this.getCharacterTitle(this.characterName,this.getCharacterPkg());
            if(title){
                if (title[0] === '#' && title.length >= 2) {
                    switch (title[1]) {
                      case 'r':
                        this.titlePanel.setCssStyle({color:'red'});
                        break;
                      case 'g':
                        this.titlePanel.setCssStyle({color:'green'});
                        break;
                      case 'p':
                        this.titlePanel.setCssStyle({color:'legend'});
                        break;
                      case 'b':
                        this.titlePanel.setCssStyle({color:'blue'});
                        break;
                    }
                    title = title.slice(2);
                }
            }else{
                let stars = this.getStars(this.characterName,this.getCharacterPkg());
                let starComment = ['平凡','普通','稀有','史诗','传说','神境'];
                title = starComment[stars-1];
            }
            this.titlePanel.setHtml(title);
        }
        getNormalTitle(name,pkg){
            if(!pkg)pkg = game.qhly_foundPackage(name);
            if(pkg && pkg.characterTitle){
                let title = pkg.characterTitle(name);
                if(title){
                    return title;
                }
            }
            let title = lib.characterTitle[name];
            return title;
        }
        getSkinNameTitle(name,pkg){
            var skinName = game.qhly_getSkin(name);
            if (!skinName) {
              return this.getNormalTitle(name,pkg);
            } else {
              var ext = game.qhly_getSkinInfo(name, skinName);
              if (ext) {
                if (ext.translation) {
                  return ext.translation;
                } else {
                  return game.qhly_earse_ext(skinName);
                }
              }
            }
        }
        getCharacterTitle(name,pkg){
            if(!pkg)pkg = game.qhly_foundPackage(name);
            if (!lib.config.qhly_titlereplace || lib.config.qhly_titlereplace == 'title') {
                return this.getNormalTitle(name,pkg);
            } else if (lib.config.qhly_titlereplace == 'skin') {
                return this.getSkinNameTitle(name,pkg);
            } else if (lib.config.qhly_titlereplace == 'pkg') {
                var pname = game.qhly_getCharacterPackage(name);
                if (pname) {
                    return pname;
                }
            }
            return null;
        }
        getStars(name,pkg){
            if(!pkg)pkg = game.qhly_foundPackage(name);
            if(pkg.characterStarCount){
                let count = pkg.characterStarCount(name);
                if(count >= 1 && count <=6){
                    return count;
                }
            }
            let rarity = game.getRarity(name);
            switch(rarity){
                case 'junk':
                    return 1;
                case 'common':
                    return 2;
                case 'rare':
                    return 3;
                case 'epic':
                    return 4;
                case 'legend':
                    return 5;
            }
            return 2;
        }
        getTranslatedName(name){
            return lib.qhlydiy.getTranslatedNameHorizontal(name);
        }
    }

    //技能面板板块
    class SkillPanel extends ui.qhly.Panel{
        constructor(){
            super('qhlydiy-skillpanel');
        }
        setCharacter(name){
            
        }
    }
    class CommonBarPanel extends ui.qhly.HorizontalBarPanel{
        constructor(param){
            super('qhlydiy-hpbar',14.78,"%");
            this.itemClass = param.itemClass;
        }
        setValue(value){
            this.value = value;
            this.clearBarItems();
            if(this.hpText){
                this.removeChild(this.hpText);
                delete this.hpText;
            }
            if(this.value <= 5){
                for(let i=0;i<this.value;i++){
                    this.addBarItem(new ui.qhly.Panel(this.itemClass),false);
                }
            }else{
                this.addBarItem(new ui.qhly.Panel(this.itemClass));
                this.hpText = new ui.qhly.Panel('qhlydiy-bartext');
                this.hpText.setHtml("×"+this.value);
                this.hpText.setCssStyle({
                    left:"100%",
                    top:"50%",
                    height:'auto',
                    transform:"translate(0%, -50%)",
                });
                this.addChild(this.hpText);
            }
            this.refresh();
        }
    }
    class HpBarPanel extends ui.qhly.HorizontalBarPanel{
        constructor(){
            super('qhlydiy-hpbar');
        }
        setHp(str){
            this.hp = get.infoHp(str);
            this.maxHp = get.infoMaxHp(str);
            this.clearBarItems();
            if(this.hpText){
                this.removeChild(this.hpText);
                delete this.hpText;
            }
            if(this.maxHp <= 5){
                for(let i=0;i<this.maxHp;i++){
                    if(i < this.hp){
                        this.addBarItem(new ui.qhly.Panel('qhlydiy-hp-item'),false);
                    }else{
                        this.addBarItem(new ui.qhly.Panel('qhlydiy-hp-empty-item'),false);
                    }
                }
            }else{
                this.addBarItem(new ui.qhly.Panel('qhlydiy-hp-item'));
                this.hpText = new ui.qhly.Panel('qhlydiy-bartext');
                let hp = get.infoHp(str);
                let maxHp = get.infoMaxHp(str);
                if(hp == maxHp){
                    this.hpText.setHtml("×"+hp);
                }else{
                    this.hpText.setHtml("×"+hp+"/"+maxHp);
                }
                //令此段文字贴在HP图标右边，呈现“体力×8”这种效果。
                this.hpText.setCssStyle({
                    left:"100%",
                    top:"50%",
                    height:'auto',
                    transform:"translate(0%, -50%)",
                });
                this.addChild(this.hpText);
            }
            this.refresh();
        }
    }
    class SkinChangeButtonsLine extends ui.qhly.Panel{
        constructor(num){
            super('qhlydiy-skinchange-buttons-line');
            this.num = num?num:0;
            this.current = 0;
            this.leftButton = this.addChild(new ui.qhly.Panel('qhlydiy-skinchange-button-left'));
            this.centerButton = this.addChild(new ui.qhly.Panel('qhlydiy-skinchange-button-center'));
            this.rightButton = this.addChild(new ui.qhly.Panel('qhlydiy-skinchange-button-right'));
            this._indexChangeListener = [];
            this.leftButton.listen(()=>{
                this.left();
            });
            this.rightButton.listen(()=>{
                this.right();
            });
            this.refresh();
        }
        setNum(num){
            this.num = num;
            this.refresh();
        }
        setCurrent(current){
            if(current < 0){
                current = 0;
            }
            if(current >= this.num){
                current = this.num-1;
            }
            this.current = current;
            this.refresh();
        }
        addIndexChangeListener(func){
            this._indexChangeListener.add(func);
        }
        left(){
            if(this.current <= 0)return;
            this.current--;
            lib.qhlydiy.playSuitAudio('switch.mp3',true);
            this.refresh();
            this._indexChangeListener.forEach(callback=>callback(this.current));
        }
        right(){
            if(this.current >= this.num-1)return;
            this.current++;
            lib.qhlydiy.playSuitAudio('switch.mp3',true);
            this.refresh();
            this._indexChangeListener.forEach(callback=>callback(this.current));
        }
        refresh(){
            this.leftButton.setCssStyle({opacity:this.current == 0?'0.5':'1'});
            this.rightButton.setCssStyle({opacity:this.current >= this.num-1?'0.5':'1'});
            super.refresh();
        }
    }
    game.qhly_initNewViewReplace=function(name, background, page, cplayer){
        let mainPanel = new ui.qhly.Panel([],background);
        let characterPanel = new CharacterPanel();
        characterPanel.setCharacter(name);
        mainPanel.addChild(characterPanel);
        let skillPanel = new SkillPanel();
        skillPanel.setCharacter(name);
        mainPanel.addChild(skillPanel);
        if(page != 'skill')page = 'introduce';

        let stackPanelGroup = new ui.qhly.StackPanelGroup([characterPanel,skillPanel],page == 'skill'?skillPanel:characterPanel);

        let characterButton = new HeadButton('qhlydiy-characterbutton',page == 'introduce');
        characterButton.page = characterPanel;
        mainPanel.addChild(characterButton);
        let skillButton = new HeadButton('qhlydiy-skillbutton',page == 'skill');
        skillButton.page = skillPanel;
        mainPanel.addChild(skillButton);
        let headGroup = new ui.qhly.SwitchButtonGroup([characterButton,skillButton]);

        headGroup.addCheckButtonChangedListener((button)=>{
            stackPanelGroup.setShowing(button.page);
        });
        mainPanel.refresh();
    };
});