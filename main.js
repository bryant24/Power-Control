const gui = require('nw.gui')
const sob = require("include/sob");
const schedule = require("include/schedule");
gui.App.clearCache();

let isShowWindow = true;
let tray = new gui.Tray({icon: "assets/image/pc_icon.png"});

sob.enableAutoStart("PowerControl", process.execPath);

nw.global.scheduleJob = new schedule.Schedule();
nw.global.scheduleJob.LoadSchedule();

let win;
nw.Window.open(
    "views/index.html",
    {
        width: 800,
        height: 600,
        title: "Power-Control V1.0",
        min_width: 800,
        min_height: 600,
        max_width: 800,
        max_height: 600,
        transparent:false,
        show_in_taskbar:true,
        frame:true,
        icon: "assets/image/pc_icon.png"
    },
    function (nwin) {
        win = nwin;
        win.on('minimize', function () {
            isShowWindow = false;
        })

        win.on('close', function () {
            isShowWindow = false;
            win.hide();
        })
    });
tray.tooltip = "Power-Control";
let menu = new gui.Menu();
let openTrayMenu = new gui.MenuItem({
    type: "normal",
    label: "打开主窗口",
    click: function () {
        win.show();
        isShowWindow = true;
    }
});
let quitTrayMenu = new gui.MenuItem({
    type: "normal",
    label: "退出",
    click: function () {
        win.close(true);
        win.hide();
        tray.remove();
        tray = null;
        win.removeAllListeners('close');
        gui.App.closeAllWindows();
        gui.App.quit();
    }
});
menu.append(openTrayMenu);
menu.append(quitTrayMenu);
tray.menu = menu;
tray.on('click', function () {
    if (isShowWindow) {
        isShowWindow = false;
        win.hide();
    } else {
        isShowWindow = true;
        win.show();
    }
});
