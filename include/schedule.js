let fs = require("fs");
let schedule = require("node-schedule");
let http = require("http");
let path = require("path");
let os = require("os");
let wol = require("include/wol");

const HostFilePath = path.join(os.tmpdir(), "####hosts.json");
const ScheduleFilePath = path.join(os.tmpdir(), "####crontab.json");

class Schedule {
    constructor() {
        this.schedule_ids = {};
    }

    LoadSchedule() {
        var _this = this;
        fs.exists(ScheduleFilePath, function (exists) {
            if (exists) {
                fs.readFile(ScheduleFilePath, function (err, content) {
                    if (err) {
                        alert("计划任务数据读取错误");
                        return
                    }
                    let plans = JSON.parse(content);
                    for (let i = 0; i < plans.length; i++) {
                        if (plans[i].planstatus === 1) {
                            continue
                        }
                        if (!_this.schedule_ids.hasOwnProperty(plans[i].id)) {
                            let cronTime = '0 ' + plans[i].planmin + ' ' + plans[i].plantime.toString() + ' * * *';
                            _this.schedule_ids[plans[i].id] = schedule.scheduleJob(cronTime, function () {
                                _this.PlanExec(plans[i].planevent)
                            });
                        }
                    }
                })
            }
        })
    }

    RemovePlan(id) {
        this.schedule_ids[id].cancel();
        delete this.schedule_ids[id];

    }

    PlanExec(event) {
        switch (event) {
            case 1:
                this.StartUpAllHosts();
                break;
            case 2:
                this.ShutDownAllHosts();
                break;
            default:
        }
    }

    shutdown(ip) {
        let opt = {
            method: "POST",
            host: ip,
            port: "1234",
            path: "/shutdown",
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        };
        let req = http.request(opt, function (res) {
            res.setEncoding('utf8');
        });
        req.end();
    }

    ShutDownAllHosts() {
        let pcs = this.getHosts();
        let promises = [];
        for (let i = 0; i < pcs.length; i++) {
            let request = this.shutdown(pcs[i].ipaddr)
            promises.push(request);
        }
        Promise.all(promises).then(function () {
        });
    }

    StartUpAllHosts() {
        let pcs = this.getHosts();
        for (var i = 0; i < pcs.length; i++) {
            this.startup(pcs[i].macaddr)
        }
    }

    startup(mac) {
        wol.wake(mac, function (err, res) {
            console.log(res);
        })
    }

    getHosts = function () {
        var hosts = fs.readFileSync(HostFilePath);
        return JSON.parse(hosts);
    }
}


exports.Schedule = Schedule;

