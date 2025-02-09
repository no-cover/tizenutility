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
                    //case 2 : deeplink to app detail
                    log("[App][Main.js] deeplink to apps detail : " + JSON.stringify(previewAppid));
                    var appControlData1 = new tizen.ApplicationControlData('Sub_Menu', ['detail']);
                    var appControlData2 = new tizen.ApplicationControlData('widget_id',[previewAppid]);
                    var deepAppControl = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/view', null, null, null, [appControlData1,appControlData2]);
                    var appId = app;
                    window.tizen.application.launchAppControl(deepAppControl,appId);
                    log("[App][Main.js] deeplink to app detail End");
                } 
                
            }else {
                //case 3 : deeplink to apps PUBLICTV list
                log("[App][Main.js] deeplink to app PUBLICVALUE list");
                var appControlData1 = new tizen.ApplicationControlData('Sub_Menu', ['main']);
                var appControlData2 = new tizen.ApplicationControlData('category_id',['PUBLICVALUE']);
                var deepAppControl = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/view', null, null, null, [appControlData1,appControlData2]);
                var appId = app;
                window.tizen.application.launchAppControl(deepAppControl,appId);
                log("[App][Main.js] deeplink to app PUBLICTV list End");
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
     * Gets DeeveloperIP property
     * @private
     */
    function getDeveloperIp(data) {
        return new Promise((resolve, reject) => {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', 'http://' + data + ':8001/api/v2/', true);
          xhr.setRequestHeader('Cache-Control', 'no-cache');
          xhr.timeout = 1000;
      
          xhr.onload = function () {
            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response.device.developerIP || null);
              } catch (e) {
                reject(null); 
              }
            } else {
              reject(null);
            }
          };
      
          xhr.ontimeout = function () {
            reject(null);
          };
      
          xhr.send(null);
        });
    
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
     * Prints popup.
     * @private
     */
    function printModal() {
    	emptyElement(containerNode);
        var newPopupShow = document.createElement("div");
        newPopupShow.setAttribute('id', 'popup');
        containerNode.appendChild(newPopupShow);
        addTextElement(newPopupShow, 'small', TIZEN_LEN['COM_CANNOT_BE_RUN_ON_YOUR_TV']);
        log('[Status] cannot be run');

        var btnClose = [
            [TIZEN_LEN['COM_CLOSE'], function() { tizen.application.getCurrentApplication().exit() }],
        ];
        addButton(btnClose, newPopupShow, true);
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
            // ['Set [0]', function() {}]
        ];
        addButton(btnBack, footerNode);
    }

    /**
     * Prints bouncing logo.
     * @private
     */
    function printBouncing() {
    	var isLoader = document.getElementById('loader');
        if (isLoader) return;
    	
        var newLoaderShow = document.createElement("div");
        newLoaderShow.setAttribute('id', 'loader');
        containerNode.appendChild(newLoaderShow);

        var svgAnimation = `
          <svg id="svg-animation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150">
            <defs>
              <clipPath id="lottie">
                <path d="M0,0 L150,0 L150,150 L0,150z"></path>
              </clipPath>
            </defs>
            <g id="circles" clip-path="url(#lottie)">
              <circle id="c1" cx="102.7" cy="75" r="10.5" fill="#47EAA9"></circle>
              <circle id="c2" cx="75" cy="102.7" r="10.5" fill="#00A7FF"></circle>
              <circle id="c3" cx="47.3" cy="75" r="10.5" fill="#00A7FF"></circle>
              <circle id="c4" cx="75" cy="47.3" r="10.5" fill="#00A7FF"></circle>
            </g>
          </svg>
        `;
        
        newLoaderShow.innerHTML = svgAnimation;

        const group = document.getElementById('circles');
        const circles = [
          document.getElementById('c1'),
          document.getElementById('c2'),
          document.getElementById('c3'),
          document.getElementById('c4')
        ];
        const centerX = 75;
        const centerY = 75;
        const radius = 48; // max
        const convergeRadiusMin = 18; // min
        const speedFactor = 6; // speed control
        let angle = 0;
      
        var animate = function() {
          const rotationAngle = angle % 360;
          const dynamicRadius = convergeRadiusMin + (radius - convergeRadiusMin) * 0.5 * (1 + Math.cos((rotationAngle * Math.PI) / 180));
          circles.forEach((circle, i) => {
            const theta = rotationAngle + (i * 90);
            const radian = (theta * Math.PI) / 180;
            const x = centerX + dynamicRadius * Math.cos(radian);
            const y = centerY + dynamicRadius * Math.sin(radian);
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
          });
          angle += speedFactor;
          requestAnimationFrame(animate);
        }
      
        animate();
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
        var isTizenTv = Boolean(window.tizen);
        containerNode = document.querySelector("#container");
        contentNode = document.querySelector("#main");

        if (!isTizenTv) {
            printIssue()
        } else {

            prdinfo = window.webapis.productinfo;

            if (getPlatformVersion() < PlatformVersion[0]) {
                printModal()
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