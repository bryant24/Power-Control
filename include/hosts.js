var fs = require("fs");
var os = require("os");
var path = require("path");
var wol = require("include/wol");
var pcs = [];
var hostMonitor;
var showLoading = true;
const HostFilePath = path.join(os.tmpdir(), "####hosts.json");
loadHosts();


function StartInterval() {
    hostMonitor = setInterval(function () {
        showLoading = false;
        CheckHostOnline(pcs, 0)
    }, 30000);

}

function StopInterval() {
    if (hostMonitor) {
        clearInterval(hostMonitor);
    }

}

function loadHosts() {
    fs.exists(HostFilePath, function (exists) {
        if (exists) {
            fs.readFile(HostFilePath, function (err, content) {
                if (err) {
                    alert("读取数据失败");
                } else {
                    pcs = JSON.parse(content);
                    var hostlistHtml = "";
                    for (var i = pcs.length - 1; i >= 0; i--) {
                        hostlistHtml += "<tr class=\"host-item\" id='" + pcs[i].macaddr + "'>";
                        hostlistHtml += "<td>" + pcs[i].hostname + "</td>";
                        hostlistHtml += "<td>" + pcs[i].macaddr + "</td>";
                        hostlistHtml += "<td>" + pcs[i].ipaddr + "</td>"
                        hostlistHtml += "<td class=\"host-status\"></td>";
                        hostlistHtml += "<td class=\"host-option\"><span></span>";
                        hostlistHtml += "<a href='#' class=\"badge badge-danger\" onclick=\"remove('" + pcs[i].macaddr + "')\">移除</a>";
                        hostlistHtml += "</td></tr>"
                    }
                    $("#hostlist").html(hostlistHtml);
                    CheckHostOnline(pcs, 0);
                    StartInterval();
                }
            })
        }
    })
}

function refreshHost() {
    showLoading = true;
    CheckHostOnline(pcs, 0);
}

/**
 * @return {string}
 */
function GetStatus(status) {
    var badgeClass = "badge-primary";
    var badgeText = "获取中";
    switch (status) {
        case 0:
            badgeClass = "badge-warning"
            badgeText = "离线";
            break;
        case 1:
            badgeClass = "badge-success";
            badgeText = "在线";
            break;
        default:
            badgeClass = "badge-primary";
    }
    return "<span class=\"host-status badge badge-pill " + badgeClass + "\">" + badgeText + "</span>";
}

function AddHost() {
    var hostname = $("#hostname").val();
    var ipaddr = $("#ipaddr").val();
    var macaddr = $("#macaddr").val();
    if (hostname === "") {
        alert("电脑名称不能为空");
        return;
    }
    if (ipaddr === "") {
        alert("ip地址不能为空");
        return;
    }
    if (!isValidIP(ipaddr)) {
        alert("ip地址不合法,请检查");
        return;
    }

    if (macaddr === "") {
        alert("mac地址不能为空");
        return;
    }
    if (!isValidMAC(macaddr)) {
        alert("mac地址不合法,请检查");
        return;
    }

    var pcs = [];
    var pc = {
        hostname: hostname,
        ipaddr: ipaddr,
        macaddr: macaddr
    }
    fs.exists(HostFilePath, function (exists) {
        if (exists) {
            fs.readFile(HostFilePath, function (err, content) {
                if (err) {
                    alert("读取数据失败");
                } else {
                    pcs = JSON.parse(content);
                    pcs.push(pc);
                    writeHostFile(pcs);
                }
            })
        } else {
            pcs.push(pc);
            writeHostFile(pcs);
        }
    });
}

function writeHostFile(pcs) {
    fs.writeFile(HostFilePath, JSON.stringify(pcs), function (err) {
        $("#addModal").modal("hide");
        $("#hostname").val("");
        $("#ipaddr").val("");
        $("#macaddr").val("");
        if (err) {
            alert("保存失败");
        } else {
            alert("保存成功");
            loadHosts();
        }
    })
}

function ShutDownOnePc(ip, name, mac) {
    var x = confirm("确认要关闭该电脑吗?");
    if (x === true) {
        success("已经向电脑【" + name + "】发送关机指令，请等待...");
        shutdown(ip);
        $("#" + mac).find(".host-status").html("<span class=\"host-status badge badge-pill badge-warning\">关机中</span>");
        $("#" + mac).find("a[data-opt='shutdown']").remove();
        setTimeout(function () {
            CheckOneHostStatus(ip, mac)
        }, 20000);
    }
}

function shutdown(ip) {
    $.ajax({
        type: "POST",
        url: "http://" + ip + ":1234/shutdown",
        async: true,
        cache: false,
        timeout: 5000,
    })
}

function SetStatus(mac, status) {
    $("#" + mac).find(".host-status").html(GetStatus(status))

}

function SetShutBtn(pc, status) {
    if (status === 1) {
        $("#" + pc.macaddr).find(".host-option span").html("<a href='#' data-opt='shutdown' class=\"badge badge-warning\" onclick=\"ShutDownOnePc('" + pc.ipaddr + "','" + pc.hostname + "','" + pc.macaddr + "')\">关机</a>&nbsp;");
    } else {
        $("#" + pc.macaddr).find("a[data-opt='shutdown']").remove();
    }
}

function CheckOneHostStatus(ip, mac) {
    $.ajax({
        type: "GET",
        url: "http://" + ip + ":1234/ping",
        async: true,
        cache: false,
        timeout: 2000
    }).done(function (result) {
        if (result.errcode === 0) {
            SetStatus(mac, 1)
        } else {
            SetStatus(mac, 0)
        }
    }).fail(function () {
        SetStatus(mac, 0)
    });
}

function CheckHostOnline(pcs, i) {
    if (pcs.length) {
        var mac = pcs[i].macaddr;
        var ip = pcs[i].ipaddr;
        $.ajax({
            type: "GET",
            url: "http://" + ip + ":1234/ping",
            async: true,
            cache: false,
            timeout: 2000,
            beforeSend: function () {
                if (showLoading)
                    SetStatus(mac, 2);
            }
        }).done(function (result) {
            if (result.errcode === 0) {
                SetStatus(mac, 1)
                SetShutBtn(pcs[i], 1);
            } else {
                SetStatus(mac, 0)
                SetShutBtn(pcs[i], 0);
            }
        }).fail(function () {
            SetStatus(mac, 0)
        }).always(function () {
            if (i < pcs.length - 1) {
                CheckHostOnline(pcs, ++i);
            }
        })
    }
}

function remove(mac) {
    var x = confirm("确认要移除该电脑吗?");
    if (x === true) {
        $("#" + mac).remove();
        fs.readFile(HostFilePath, function (err, content) {
            if (err) {
                alert("读取数据失败");
            } else {
                var newhosts = [];
                pcs = JSON.parse(content);
                for (var i = 0; i < pcs.length; i++) {
                    if (pcs[i].macaddr !== mac) {
                        newhosts.push(pcs[i])
                    }
                }
                fs.writeFile(HostFilePath, JSON.stringify(newhosts), function (err) {
                    if (err) {
                        alert("写入错误")
                    } else {
                        pcs = newhosts;
                    }
                })
            }
        })
    }
}

function OneKeyShutdown() {
    $("#shutdownModal").modal("hide");
    var promises = [];
    for (var i = 0; i < pcs.length; i++) {
        var request = shutdown(pcs[i].ipaddr)
        promises.push(request);
    }
    $.when.apply(null, promises).done(function () {
        success("已经向所有电脑发送关机指令，请等待...");
        StopInterval();
        $(".host-status").each(function () {
            if ($(this).text() === "在线") {
                $(this).html("<span class=\"host-status badge badge-pill badge-warning\">关机中</span>");
            }
        })

        setTimeout(StartInterval, 30000)
    })
}

function OneKeyStartup() {
    $("#startupModal").modal("hide");
    for (var i = 0; i < pcs.length; i++) {
        startup(pcs[i].macaddr)
    }
    success("已经向所有电脑发送开机指令，请等待片刻查询状态...");
    StopInterval();
    $(".host-status").each(function () {
        if ($(this).text() === "离线") {
            $(this).html("<span class=\"host-status badge badge-pill badge-warning\">开机中</span>");
        }
    });
    setTimeout(StartInterval, 30000)

}

function startup(mac) {
    wol.wake(mac, function (err, res) {
        console.log(res);
    })
}

function success(content) {
    var sText = "<div class=\"alert alert-success\" role=\"alert\">" + content + "</div>";
    $("main").prepend(sText);
    $(".alert").delay(5000).fadeOut();
}

function fail(content) {
    var sText = "<div class=\"alert alert-danger\" role=\"alert\">" + content + "</div>";
    $("main").prepend(sText);
    $(".alert").delay(5000).fadeOut();
}

function isValidIP(ip) {
    var reg = /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/;
    return reg.test(ip);
}

function isValidMAC(mac) {
    var reg = /^[A-Fa-f\d]{2}[:|-][A-Fa-f\d]{2}[:|-][A-Fa-f\d]{2}[:|-][A-Fa-f\d]{2}[:|-][A-Fa-f\d]{2}[:|-][A-Fa-f\d]{2}$/;
    return reg.test(mac);
}