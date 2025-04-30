(function() {
    const RETURN_BUTTON = 10009,
        LEFT_ARROW_BUTTON = 37,
        RIGHT_ARROW_BUTTON = 39,
        INFO_BUTTON = 457,
        UP_ARROW_BUTTON = 38, 
        DOWN_ARROW_BUTTON = 40;

    const SmartTVserverType = {
        OPERATING: 0,
        DEVELOPMENT: 1,
        DEVELOPING: 2
    }

    const PlatformVersion = [
        5.0,
        5.5,
        6.0,
        6.5,
        7.0,
        8.0,
        9.0
    ]

    const AppList = {
        'com.samsung.tv.store': 1, 
        'org.tizen.factory': 2, 
        'com.samsung.tv.built-in-app-info-viewer': 3, 
        'com.samsung.tv.appinfoviewer': 4,
        'org.tizen.RunningApps': 5,
    }

    /**
     * Logs.
     * @private
     */
    function log(msg) {
        console.log(msg);
    
    }
    /**
     * Return KeyName by value from Object.
     * @private
     * @param {Object} object - The object contains data
     * @param {string} value - key's value to compare
     * @return {string}
     */
    function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
    
    /**
     * Handles the hardware key events.
     * @private
     * @param {Object} event - The object contains data of key event
     */
    function keyEventHandler(event) {
    	var timeBegin = Date.now();
    	
        if (event.keyCode === LEFT_ARROW_BUTTON)
            focusButton("prev"),
            log("[keynav] onKeyLeft: " + (Date.now() - timeBegin) + 'ms');
        else if (event.keyCode === UP_ARROW_BUTTON)
            focusButton("up"),
            log("[keynav] onKeyUp: " + (Date.now() - timeBegin) + 'ms')
        else if (event.keyCode === DOWN_ARROW_BUTTON)
            focusButton("down"),
            log("[keynav] onKeyDown: " + (Date.now() - timeBegin) + 'ms');
        else if (event.keyCode === RIGHT_ARROW_BUTTON)
            focusButton("next"),
            log("[keynav] onKeyRight: " + (Date.now() - timeBegin) + 'ms');
        else if (event.keyCode === INFO_BUTTON) {
            log("[keynav] onKeyInfo: " + (Date.now() - timeBegin) + 'ms'),
            printInfo();
        } else if (event.keyCode === RETURN_BUTTON) {
            try {
                log("[keynav] onKeyReturn: " + (Date.now() - timeBegin) + 'ms');
                log('[App] : exit app.');
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    }

    /**
     * Sets default event listeners.
     * @private
     */
    function setDefaultEvents() {
        tizen.tvinputdevice.registerKey('Info');
        document.addEventListener("keydown", keyEventHandler);
    }


    /**
     * Removes all child of the element.
     * @private
     * @param {Object} elm - The object to be emptied
     * @return {Object} The emptied element
     */
    function emptyElement(elm) {
        while (elm.firstChild) {
            elm.removeChild(elm.firstChild);
        }
        return elm;
    }

    /**
     * Adds a text node with specific class to an element.
     * @private
     * @param {Object} objElm - The target element to be added the text
     * @param {string} textClass - The class to be applied to the text
     * @param {string} textContent - The text string to add
     */
    function addTextElement(objElm, textClass, textContent) {
        var newElm = document.createElement("p");
        newElm.className = textClass;
        newElm.appendChild(document.createTextNode(textContent));
        objElm.appendChild(newElm);
    }

    /**
     * Creates buttons DOMelement as requested
     * @private
     * @param {Object} list - The object contains data of buttons to create
     * @param {HTMLDivElement} btnNode - The div elm contains apps buttons
     */
    function addButton(list, btnNode, skip = false) {
        var newParagraph = document.createElement("p");
        
        if(!skip) {
            emptyElement(btnNode);
        }

        for (let b of list) {
            var newButton = document.createElement("button");
            newButton.appendChild(document.createTextNode(b[0]));
            newButton.addEventListener("click", b[1]);
            newParagraph.appendChild(newButton);
        }

        btnNode.appendChild(newParagraph);
        focusButton();
    }

    /**
     * Focuses buttons is available.
     * @private
     * @param {string} option - prev|next|down|up options available
     */
    function focusButton(option) {
        var buttons = document.getElementsByTagName('button');
        var focusedButton = null;
        var toFocusButton = null;
        if (buttons.length > 0) {
            for (let b of buttons)
                if (b === document.activeElement) {
                    focusedButton = b;
                    break;
                }

            if (!focusedButton)
                toFocusButton = buttons[0];
            else if (option === 'prev')
                toFocusButton = focusedButton.previousElementSibling;
            else if (option === 'next')
                toFocusButton = focusedButton.nextElementSibling;
            else if (option === 'down')
                toFocusButton = buttons[buttons.length - 1];
            else if (option === 'up')
                toFocusButton = buttons[0];
            else { }

            try {
                toFocusButton.focus();
            } catch (ignore) {}
        
        }
    }

    /**
     * Runs internal applications by value
     * @private
     */
    function onAppControlReceived(app) {
        log('[App][Main.js] : onAppControlReceived');
        var reqAppControl = tizen.application.getCurrentApplication().getRequestedAppControl();
        if (reqAppControl && reqAppControl.appControl !== null) {
            log("[App][Main.js]  [length]=[" + reqAppControl.appControl.data.length + "]");
            log("[App][Main.js]  [data]=" + JSON.stringify(reqAppControl.appControl.data));
            
            var payloadValue = '';
            var previewAppid = '';
            for (var i = 0; i < reqAppControl.appControl.data.length; i++) {
                var fileId = undefined;
                log("[App][Main.js] data[" + i + "] key=" + JSON.stringify(reqAppControl.appControl.data[i].key) + " value=" + JSON.stringify(reqAppControl.appControl.data[i].value));
    
                if (reqAppControl.appControl.data[i].key === "PAYLOAD") {
                    payloadValue = reqAppControl.appControl.data[i].value[0];
                    payloadValue = JSON.parse(payloadValue);
                    log("[App][Main.js] payloadValue=" + JSON.stringify(payloadValue));
                    if(payloadValue !== null && payloadValue.values !== null){
                        previewAppid = payloadValue.values;
                        log("[App][Main.js] previewAppid=" + JSON.stringify(previewAppid));
                    }	
                }
            }
            
            
            if(previewAppid !== null && previewAppid !== ''){
                //var appInfo = window.tizen.application.getAppInfo(previewAppid);
                var appinfo = null;
                try {
                    log("[App][Main.js] previewAppid : " + previewAppid);
                    appinfo = webapis.was.getAppInfo(previewAppid);
                    log("[App][Main.js] appinfo : " + JSON.stringify(appinfo));
                    appinfo = JSON.parse(appinfo);
                    log("[App][Main.js] appTizenId = " + appInfo.appTizenId);  
                } catch (error) {
                    console.error("[App][Main.js] error code = " + error.code);
                }
                
                if(appinfo !== null){
                    //case 1 : launch the preview app
                    log("[App][Main.js] launch app : " + previewAppid);
                    window.tizen.application.launch(previewAppid);
                    log("[App][Main.js] launch app end");
                }else{
                    //case 2 : deeplink to apps detail
                    log("[App][Main.js] deeplink to apps detail : " + JSON.stringify(previewAppid));
                    var appControlData1 = new tizen.ApplicationControlData('Sub_Menu', ['detail']);
                    var appControlData2 = new tizen.ApplicationControlData('widget_id',[previewAppid]);
                    var deepAppControl = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/view', null, null, null, [appControlData1,appControlData2]);
                    var appId = "app";
                    window.tizen.application.launchAppControl(deepAppControl,appId);
                    log("[App][Main.js] deeplink to apps detail End");
                } 
                
            }else {
                //case 3 : deeplink to apps PUBLICTV list
                log("[App][Main.js] deeplink to apps PUBLICVALUE list");
                
                try {
                    var modeCode = webapis.productinfo.getModelCode();
                    console.error("[App][Main.js] modeCode = " + modeCode);
                    var year = modeCode.split("_", 1);
                    console.error("[App][Main.js] year = " + year);
                    
                    var producttype = webapis.featureconfig.getFeatureConfigLong("com.samsung/featureconf/product.product_type");
                    console.error("[App][Main.js] producttype = " + producttype);
                    
                    var infolinkversion = webapis.productinfo.getSmartTVServerVersion();
                    console.error("[App][Main.js] infolinkversion = " + infolinkversion);
                    
                    //OS80 : 23 -> 24 OSU image  T09 : 23 -> 25 OSU image
                    if(((Number(year) >= 24) && (Number(producttype) !== 4)) || (Number(year)== 22 && (infolinkversion >= "T-INFOLINK2022-1020")) || (Number(year)== 23 && (modeCode.includes("OS80") || modeCode.includes("T09")))){    				
                        log("[App][Main.js] move focus to Public Value row.");
                        var ComponentID = "d/apps.tab.content@CategoryID_Content_PUBLICVALUE";
                        var appControlData1 = new tizen.ApplicationControlData('__COBA_REQUEST_FOCUS_GROUPTAG__', [ComponentID]);
                        var deepAppControl = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/view', null, null, null, [appControlData1]);
                        var appId = "app";
                        window.tizen.application.launchAppControl(deepAppControl,appId);
                        
                        log("[App][Main.js] Deeplink end.");
                    }
                    else{
                        log("[App][Main.js] Original apps");
                        var appControlData1 = new tizen.ApplicationControlData('Sub_Menu', ['main']);
                        var appControlData2 = new tizen.ApplicationControlData('category_id',['PUBLICVALUE']);
                        var deepAppControl = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/view', null, null, null, [appControlData1,appControlData2]);
                        var appId = app;
                        window.tizen.application.launchAppControl(deepAppControl,appId);
                    }
                } catch (e) {
                    console.error("[App][Main.js] error = " + e);
                }
                
                log("[App][Main.js] deeplink to apps PUBLICTV list End");
            }
            log('[App] : exit app.');
            tizen.application.getCurrentApplication().exit();
            
        }else {
            console.error('[App:onAppControlReceived()] appControl is not currect.');
            log('[App] : exit app.');
            tizen.application.getCurrentApplication().exit();
        }
        
    
    }

    /**
     * Gets PlatformVersion value
     * @private
     * @return {float|null} value of TZ_BUILD_VERSION
     */
	function getPlatformVersion() {
        var version = null
        try {
          const buildConf = tizen.filesystem
            .openFile('/etc/tizen-build.conf', 'r')
            .readString()
            .split(/\r?\n/g);
      
          buildConf.forEach(line => {
            if (line.includes('TZ_BUILD_VERSION')) {
              version = line.split('=')[1].trim();
            }
          });
      
          if (!version) {
            version = tizen.systeminfo.getCapability(
            'http://tizen.org/feature/platform.version');
          }
      
          return version ? parseFloat(version).toFixed(1) : null;
        } catch (e) {

          return null;
        }

    }
    
    /**
     * Prints header information.
     * @private
     */
    function printHeader() {
        emptyElement(headerNode);
        addTextElement(headerNode, '', TIZEN_LEN['COM_TIZEN_UTILITY']);
    }

    /**
     * Prints TIZEN API issue.
     * @private
     */
    function printIssue() {
        emptyElement(contentNode);
        addTextElement(contentNode, '', TIZEN_LEN['COM_TIZEN_API_IS_NOT_SUPPORTED_ON_THIS_DEVICE']);
        log('[Status] TIZEN API is not supported on this device');
    }

    /**
     * Prints information provided by API.
     * @private
     */
    function printInfo() {
        emptyElement(contentNode);

        var properties = {
            "getLocalSet()"             : prdinfo.getLocalSet(),
            "getModel()"                : prdinfo.getModel(),
            "getRealModel()"            : prdinfo.getRealModel(),
            "getIpAdress()"             : webapis.network.getIp(),
            "getPlatformVersion()"      : getPlatformVersion().toString(),
            "getFirmware()"             : prdinfo.getFirmware(),
            "getSmartTVServerType()"    : getKeyByValue(SmartTVserverType, prdinfo.getSmartTVServerType()),
            "getSmartTVServerVersion()" : prdinfo.getSmartTVServerVersion(),
        }

        for (var i in properties)
            addTextElement(contentNode, 'small', i + ': ' + properties[i]);

        var btnBack = [
            [TIZEN_LEN['COM_BACK'], function() { render() }],
        ];
        addButton(btnBack, footerNode);
    }

    /**
     * Prints Lottie animation.
     * @private
     */
    function printBouncing() {
        var isLoader = document.getElementById('loader');
        if (isLoader) return;

        var newLoaderShow = document.createElement("div");
        newLoaderShow.setAttribute('id', 'loader');
        containerNode.appendChild(newLoaderShow);

        lottie.loadAnimation({
            container: newLoaderShow,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'lottie.json'
        });

        log('[App] : in progress...');
    }

    /**
     * Prints main view.
     * @private
     */
    function render() {
        setDefaultEvents();
        printHeader();
        emptyElement(contentNode);
        emptyElement(footerNode);

        // Adds apps button in DOM tree
        var newListShow = document.createElement("div");
        newListShow.setAttribute('id', 'items');

        // If PlatformVersion 6.5 and above
        if (getPlatformVersion() >= PlatformVersion[3]) {
            addTextElement(contentNode, '', TIZEN_LEN['COM_START_BY_PRESSING_OK']);
            contentNode.appendChild(newListShow);
            addTextElement(contentNode, '', TIZEN_LEN['COM_FOR_DEVICE_INFO_PRESS_INFO_ENYTIME']);
            
            var items = [
                [TIZEN_LEN['COM_APPS_STORE'], function() { printBouncing(); setTimeout(function() { onAppControlReceived(getKeyByValue(AppList, 1)); }, 1500 ); }],
                [TIZEN_LEN['COM_FACTORY_MENU'], function() {printBouncing(); setTimeout(function() { onAppControlReceived(getKeyByValue(AppList, 2)); }, 1500 ); }],
                [TIZEN_LEN['COM_APP_INFO_VIEWER'], function() { printBouncing(); setTimeout(function() { onAppControlReceived(getKeyByValue(AppList, 4)); }, 1500 ); }],
                [TIZEN_LEN['COM_MEMORY_DIAGNOSIS'], function() { printBouncing(); setTimeout(function() { onAppControlReceived(getKeyByValue(AppList, 5)); }, 1500 ); }]
            ];
                var btnExit = [
                [TIZEN_LEN['COM_EXIT'], function() { tizen.application.getCurrentApplication().exit() }]
            ];
        // If PlatformVersion 6.0 and below
        } else if (getPlatformVersion() < PlatformVersion[3]) {
            addTextElement(contentNode, '', TIZEN_LEN['COM_START_BY_PRESSING_OK']);
            contentNode.appendChild(newListShow);
            addTextElement(contentNode, '', TIZEN_LEN['COM_FOR_DEVICE_INFO_PRESS_INFO_ENYTIME']);
            
            var items = [
                [TIZEN_LEN['COM_APPS_STORE'], function() { printBouncing(); setTimeout(function() { onAppControlReceived(getKeyByValue(AppList, 1)); }, 1500 ); }],
                [TIZEN_LEN['COM_FACTORY_MENU'], function() {printBouncing(); setTimeout(function() { onAppControlReceived(getKeyByValue(AppList, 2)); }, 1500 ); }],
                [TIZEN_LEN['COM_APP_INFO_VIEWER'], function() { printBouncing(); setTimeout(function() { onAppControlReceived(getKeyByValue(AppList, 3)); }, 1500 ); }],
                [TIZEN_LEN['COM_MEMORY_DIAGNOSIS'], function() { printBouncing(); setTimeout(function() { onAppControlReceived(getKeyByValue(AppList, 5)); }, 1500 ); }]
            ];
            var btnExit = [
                [TIZEN_LEN['COM_EXIT'], function() { tizen.application.getCurrentApplication().exit() }]
            ];
        // If cannot get PlatformVersion
        } else {

            log('[App] : exit app.');
            tizen.application.getCurrentApplication().exit();

        }
        addButton(items, newListShow);
        addButton(btnExit, footerNode);

    }

    /**
     * Initiates the application.
     * @private
     */
    function init() {
        containerNode = document.querySelector("#container");
        contentNode = document.querySelector("#main");

        if (window.tizen === undefined) {
            printIssue();
        } else {

            prdinfo = window.webapis.productinfo;

            if (getPlatformVersion() < PlatformVersion[0]) {
                alert(TIZEN_LEN['COM_CANNOT_BE_RUN_ON_YOUR_TV']);
                tizen.application.getCurrentApplication().exit();
            } else {

                containerNode = document.querySelector("#container");
                headerNode = document.querySelector("#header");
                footerNode = document.querySelector("#footer");

                render();
                setDefaultEvents();
            }
        }
    }

    window.onload = init;
}());