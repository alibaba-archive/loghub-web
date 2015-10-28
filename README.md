loghub-web
==========
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

1. 可控制的console，loghub的log和error方法是对应console方法的封装，
你可以在开发版本中任意使用这些方法，便于开发，然后在生产版中配置loghub
禁用log, error或是全部，不干扰生产版的运行。
2. 日志云同步，loghub的log和error方法还可以将收集到的日志信息同步到云服务器
(logci.com，开发中)，方便进行日志分析，监控程序运行状态。loghub使用Image对象同步日志记录。

安装说明
=======

**Node.js:**

    npm install loghub-web

**bower:**

    bower install loghub-web

**Browser:**

    <script src="/pathTo/loghub-web.js"></script>

**with require**

    var log = require('loghub-web');

**with define**

    define(['loghub-web'], function (log) {
        //...
    });

使用说明
=======

### `loghub(optionsObj)`

配置loghub，optionsObj是一个`object`，默认配置及说明如下：

    optionsObj = {
        host: 'logci.com',        // string, 可选，服务器访问地址
        bucket: '',               // string, 云服务器存储空间名称，如'loghub'，空则不同步
        appkey: '',               // string, 云服务器访问认证，空则不同步
        slient: {                 // 禁止打印记录
            log: false,           // false为允许log方法在控制台打印记录
            error: false
        },
        report: {                 // 同步记录到云服务器
            log: true,            // false为不同步
            error: true,
            globalError: true     // true为将window.onerror捕捉的错误同步
        },
        request: null             //function, 可选，服务器访问方法
    }

你随时可以调用loghub(optionsObj)修改配置，optionsObj将merge到原有配置，
如在生产版中禁止log打印，仅允许error：

    loghub({
        slient: {
            log: true,
            error: false
        }
    });

### `loghub(function() {}, [args...])`

直接在loghub中运行函数，如果loghub使用`try catch`捕捉到错误，
则会自动调用loghub.error方法处理错误。可以通过`loghub.apply(this, args)`
为function指定`this`。

### `loghub.error([data], [...])`

默认行为同`console.error([data], [...])`，但可以通过全局配置控制它是否打印记录，是否将记录同步到云服务器。

### `loghub.log([data], [...])`

默认行为同`console.log([data], [...])`，但可以通过全局配置控制它是否打印记录，是否将记录同步到云服务器。

### `loghub.timing`

页面加载性能数据，包含`domainLookupEnd`, `domainLookupStart`, `connectEnd`,
`connectStart`, `requestStart`, `responseEnd` 和 `responseStart` 字段，
可以用来衡量页面加载性能，如果浏览器不支持某个字段，其值会被设置为`0`。

### `loghub.getEntries()`

资源加载性能数据，该方法返回一个数组，其中每个元素都包含 `duration`, `entryType`,
`initiatorType`, `name`, `startTime` 和 `responseEnd` 字段，
可以用来衡量资源加载性能，如果浏览器不支持，则会返回一个空数组，如果特定字段不被支持，
其值会被设置为`0`。

### loghub兼容低版本浏览器或其他JavaScript环境，如果不存在console或JSON对象，会自动降级处理，而不会报错。
