# Power-Control
局域网电源管理windows客户端 ,使用NW.js开发

# 功能
- 一键关闭、开启所有电脑
- 关闭单个电脑
- 设置计划开关机任务

# 如何使用
- 克隆源码到项目目录(如app)
- 执行npm install 安装依赖
- Windows用户可以直接使用nw.exe app/运行项目，如要打包程序，具体参照[MW.js文档](http://docs.nwjs.io/en/latest/For%20Users/Package%20and%20Distribute/)
- 在被控机上安装daemon api服务并设置为自动启动,[Power-Control-Daemon仓库](https://github.com/bryant24/Control-Power-daemon)


# 调试
windows用户开启dev控制台调试请使用NW.js的[sdk版本](https://nwjs.io/downloads/)运行

# 注意事项
- 关机是在被控机上安装daemon api服务，执行shutdown /s /t 0 命令
- 开机使用广播魔术包的方法，被控制机器bios要支持网络启动，并且开启网卡的允许设备唤醒计算机
- 管理端要和被控节点处在同一网段内，可以访问被控节点的1234端口
- 客户端运行时，计划任务才能启用（已设置开启启动及最小化到通知栏）

# TODO
- 支持linux/mac系统的远程启动
- 主从通信加密
- 远程手机app支持开关机
- 更详细的计划任务设置

# SnapShots
![images](https://github.com/bryant24/Power-Control/raw/master/snapshot/computers.jpg)
![images](https://github.com/bryant24/Power-Control/raw/master/snapshot/add_computer.jpg)
![images](https://github.com/bryant24/Power-Control/raw/master/snapshot/schedule.jpg)
![images](https://github.com/bryant24/Power-Control/raw/master/snapshot/schedule_add.jpg)
