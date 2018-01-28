/**
 * Created by simengzhao on 2017/7/27.
 */
const sybdriverDir = __dirname.split('/').slice(0,-1).join('/')+'./drivers/jconn4.jar'
//const mysqldriverDir = __dirname.split('/').slice(0,-1).join('/')+'./drivers/mysql-connector-java-5.1.44-bin.jar'
const mysqldriverDir = './drivers/mysql-connector-java-5.1.44-bin.jar'
console.log(mysqldriverDir)
exports.driverDir = mysqldriverDir
const mysqlconfig = {
    url:'jdbc:mysql://192.168.0.13:3306/ecm?useUnicode=true&user=root&host=192.168.0.13&password=root&characterEncoding=GBK',
    user:'root',
    password:'root',
    minpoolsize: 1,
    maxpoolsize:5
}
const sybaseconfig = {

    url: 'jdbc:sybase:Tds:192.168.68.26:4100/JUDGE?useUnicode=true&CHARSET=cp936',
    //url: 'jdbc:sybase:Tds:192.168.58.124:5000/ecm',
    user: 'fymis',
    //password: 'fymis123', //
    password: 'nju36WCCCGCGCGCGCG',
    minpoolsize: 1,
    maxpoolsize: 5,
//''@'WIN-9PAO8MJIDKK'
}
exports.dbconfig = mysqlconfig ;
