const fs = require("fs");
const os = require("os");
const path = require("path");
const uuidv4 = require('uuid/v4');
let plans = [];
const ScheduleFilePath = path.join(os.tmpdir(), "####crontab.json");
LoadSchedule();

function LoadSchedule() {
    fs.exists(ScheduleFilePath, function (exists) {
        if (exists) {
            fs.readFile(ScheduleFilePath, function (err, content) {
                if (err) {
                    alert("数据读取错误");
                    return
                }
                plans = JSON.parse(content);
                let planHtml = "";
                plans = plans.sort(planSort("plantime", "planmin"))
                for (var i = 0; i < plans.length; i++) {
                    planHtml += "<tr id='" + plans[i].id + "'>";
                    planHtml += "<td>每天" + plans[i].plantime + "点" + paddingZero(plans[i].planmin) + "</td>";
                    planHtml += "<td>" + getEventName(plans[i].planevent) + "</td>";
                    planHtml += "<td><span>" + getEventStatus(plans[i].planstatus) + "</span></td>";
                    planHtml += "<td><a href='#' class='badge badge-danger' onclick='removeSchedule(\"" + plans[i].id + "\")'>移除</a>";
                    planHtml += "</td></tr>"
                }
                $("#planlist").html(planHtml)
            })
        }
    })
}

function planSort(hour, minutes) {
    return function (a, b) {
        return a[hour] === b[hour] ? a[minutes] - b[minutes] : a[hour] - b[hour];
    }
}

function paddingZero(num) {
    if (num === 0) {
        return "整";
    }
    if (num < 10) {
        return "0" + num.toString() + "分";
    }
    return num + "分";
}

function getEventName(event) {
    switch (event) {
        case 1:
            return "<span class='badge badge-success'>一键开机</span>";
        case 2:
            return "<span class='badge badge-secondary'>一键关机</span>";
        default:
    }
}

function getEventStatus(status) {
    switch (status) {
        case 0:
            return "<span class=\"badge badge-pill badge-success\">启用</span>";
        case 1:
            return "<span class=\"badge badge-pill badge-danger\">禁用</span>";
    }
}

function AddPlan() {
    var plantime = $("#plantime").val();
    var planmin = $("#planmin").val();
    var planevent = $("#planevent").val();
    var planstatus = $("input[type='radio'][name='planStatus']:checked").val();

    if (plantime == "") {
        alert("请填写计划时间");
        return;
    }
    if (plantime > 23 || plantime < 0) {
        alert("小时超出范围，应为(0-24)");
        return;
    }
    if (planmin == "") {
        planmin = 0;
    }
    if (planmin > 59 || planmin < 0) {
        alert("分钟数超出范围，应为(0-59)");
        return;
    }
    if (planevent == "0") {
        alert("请选择事件类型");
        return;
    }

    var plan = {
        "id": uuidv4(),
        "plantime": parseInt(plantime),
        "planmin": parseInt(planmin),
        "planevent": parseInt(planevent),
        "planstatus": parseInt(planstatus),
        "createTime": (new Date()).valueOf()
    };
    var plans = [];
    fs.exists(ScheduleFilePath, function (exists) {
        if (exists) {
            fs.readFile(ScheduleFilePath, function (err, content) {
                console.log(err)
                if (err) {
                    alert("数据读取错误");
                    return
                }
                plans = content ? JSON.parse(content) : [];
                plans.push(plan);
                writeHost(plans);
            })
        } else {
            plans.push(plan);
            writeHost(plans);
        }
    });
    $("#addJobModal").modal("hide");
}

function writeHost(plans) {
    fs.writeFile(ScheduleFilePath, JSON.stringify(plans), function (err) {
        if (err) {
            alert("任务添加错误");
            return
        }
        $("#plantime").val("");
        $("#planmin").val("");
        $("#planevent").val("0");
        $("input[type='radio'][name='planStatus'][value='0']").attr("checked", true);
        success("任务添加成功");
        nw.global.scheduleJob.LoadSchedule();
        LoadSchedule();
    });
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

function removeSchedule(schedule_id) {
    var x = confirm("确认要移除该计划任务吗?");
    if (x === true) {
        $("#" + schedule_id).remove();
        fs.readFile(ScheduleFilePath, function (err, content) {
            if (err) {
                alert("读取数据失败");
            } else {
                var newplans = [];
                plans = JSON.parse(content);
                for (var i = 0; i < plans.length; i++) {
                    if (plans[i].id !== schedule_id) {
                        newplans.push(plans[i])
                    }
                }
                fs.writeFile(ScheduleFilePath, JSON.stringify(newplans), function (err) {
                    if (err) {
                        alert("写入错误")
                    } else {
                        plans = newplans;
                        LoadSchedule();
                        nw.global.scheduleJob.RemovePlan(schedule_id);
                    }
                })
            }
        })
    }
}