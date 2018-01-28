#ECNet-Web 证据链可视化建模工具集

证据链可视化建模工具集包含：证据链关系图建模工具，说理逻辑图建模工具。

This is the web version of ECNet.

## How to develop

Please develop with WebStorm. Click [here](https://www.jetbrains.com/student/) to register a free student account.



1. clone the project and run `npm install`
2. run `npm install -g webpack`
3. run `npm install -g gulp`
2. run `npm install -g gulp-connect`
2. You can directly write the code, run `webpack` to generate the bundle and open `index.html`. If you want to pack and refresh automatically, [setup](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=zh-CN) this chrome extension, run `gulp` and visit [localhost:8080](localhost:8080/index.html) to view the page with live reload.

TO deploy this system on MacOS ,you need to do following works 
*. Enter the directory './node_modules/jdbc/lib/',modify the file 'pool.js',change some '===' tokens into '=='
*. Enter the directory '/Library/Java/JavaVirtualMachines/jdk1.8.0_144.jdk/Contents',open 'info.plist',then modify the segment of '<array>' into this:
"
    <array>
            <string>CommandLine</string>
			<string>JNI</string>
            <string>BundledApp</string>
            <string>WebStart</string>
            <string>Applets</string>
    </array>
"
TO deploy this system on windows system ,you need to install following package:
1. '.NET Framwork ' with 4.5.2 or later
2. VC++ builder 2017
3. Python 2.7.x
4. Java 1.8

To enable node backend.


1. check database configuration, default [mysql://localhost:3306/ecm], see `models/dbconfig.js` for more details
2. run `node app.js`


