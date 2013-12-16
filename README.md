LogCI (*Log Cloud Index*)[![Build Status](https://travis-ci.org/zensh/logci.png?branch=master)](https://travis-ci.org/zensh/logci)
===

LogCI是一款轻量级的JavaScript环境下的日志管理工具。它具有两大功能：

1. 可控制的console，LogCI的log, info, warn, error方法是对应console方法的封装，你可以在开发版本中任意使用这些方法，便于开发，然后在生产版中配置LogCI，禁用log, info, warn, error部分或全部，不干扰生产版的运行。
2. 日志云同步，LogCI的log, info, warn, error方法还可以将收集到的日志信息同步到云服务器（logci.com，开发中），方便进行日志分析，监控程序运行状态。在浏览器中，LogCI使用Image对象同步日志记录；在node.js中，LogCI使用http.get方法同步日志记录。



安装说明
===

**Node.js:**

    npm install logci

**bower:**

    bower install logci

**Browser:**

    <script src="/pathTo/logci.js"></script>

**with require**

    var logci = require('logci');

**with define**

    define(['logci'], function (logci) {
        //...
    });

使用说明
===

### `logci(optionsObj)`

配置LogCI，optionsObj是一个`object`，默认配置及说明如下：

    optionsObj = {
        space: '',  //云服务器存储空间名称，如'logci'，空则不同步
        token: '',  //云服务器访问认证，base64字符串，空或错误认证则不同步
        slient: {  //禁止打印记录
            log: false,  //false为允许log方法
            info: false,
            warn: false,
            error: false,
            windowError: false  //true为使用window.onerror屏蔽错误
        },
        report: {  //同步记录到云服务器
            log: false,  //false为不同步
            info: false,
            warn: false,
            error: false,
            windowError: false  //true为将window.onerror捕捉的错误同步
        },
    }

你随时可以调用logci(optionsObj)修改配置，optionsObj将merge到原有配置，如在生产版中禁止log，info，warn打印，仅允许error：

    logci({
        slient: {
            log: true,
            info: true,
            warn: true,
            error: false
        }
    });

### `logci(function() {})`

直接在logci中运行函数，如果logci使用`try catch`捕捉到错误，则会自动调用logci.error方法处理错误。

### `logci.error([data], [...])`

默认行为同`console.error([data], [...])`，但可以通过全局配置控制它是否打印记录，是否将记录同步到云服务器。


### `logci.log([data], [...])`

默认行为同`console.log([data], [...])`，但可以通过全局配置控制它是否打印记录，是否将记录同步到云服务器。

### `logci.info([data], [...])`

默认行为同`console.info([data], [...])`，但可以通过全局配置控制它是否打印记录，是否将记录同步到云服务器。

### `logci.warn([data], [...])`

默认行为同`console.warn([data], [...])`，但可以通过全局配置控制它是否打印记录，是否将记录同步到云服务器。

###LogCI兼容低版本浏览器或其他JavaScript环境，如果不存在console或JSON对象，会自动降级处理，而不会报错。