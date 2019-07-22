# Power-Control
局域网电源管理windows客户端 ,使用NW.js开发

# 如何使用
- 克隆源码到项目目录(如app)
- 执行npm install 安装依赖
- Windows用户可以直接使用nw.exe app/运行项目，如要打包程序，具体参照[MW.js文档](http://docs.nwjs.io/en/latest/For%20Users/Package%20and%20Distribute/)


# 调试
windows用户开启dev控制台调试请使用NW.js的[sdk版本](https://nwjs.io/downloads/)运行

# 注意事项
- 关机是在被控机上安装daemon api服务，执行shutdown /s /t 0 命令,[Daemon仓库](https://github.com/bryant24/Control-Power-daemon)
- 开机使用广播魔术包的方法，被控制机器bios要支持网络启动，并且开启网卡的允许设备唤醒计算机
- 管理端要和被控节点处在同一网段内，可以访问被控节点的1234端口

# TODO
- 支持linux/mac系统的远程启动
- 主从通信加密
- 远程手机app支持开关机



# SnapShots
![images](https://github.com/bryant24/Power-Control/raw/master/snapshot/computers.jpg)
![images](https://github.com/bryant24/Power-Control/raw/master/snapshot/add_computer.jpg)
![images](https://github.com/bryant24/Power-Control/raw/master/snapshot/schedule.jpg)
![images](https://github.com/bryant24/Power-Control/raw/master/snapshot/schedule_add.jpg)
