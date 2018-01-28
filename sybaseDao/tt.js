const crypto = require('crypto');
const Cryptojs = require('crypto-js')

let keyHex = Cryptojs.enc.Utf8.parse('12345678')

let encrypt = Cryptojs.DES.encrypt('222683',keyHex,{
    mode: Cryptojs.mode.ECB,
    padding: Cryptojs.pad.Pkcs7})
console.log(encrypt.toString())
console.log(encrypt.ciphertext.toString(Cryptojs.enc.Base64))
function aesEncrypt(alg,data, key) {
    const cipher = crypto.createCipher(alg, key);
    let crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function aesDecrypt(alg,encrypted, key) {
    const decipher = crypto.createDecipher(alg, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const data = '222683';
const key = '12345678';
const algorithms = [
    'DES-CBC',
    'DES-CFB',
    'DES-CFB1',
    'DES-CFB8',
    'DES-ECB',
    'DES-EDE',
    'DES-EDE-CBC',
    'DES-EDE-CFB',
    'DES-EDE-OFB',
    'DES-EDE3',
    'DES-EDE3-CBC',
    'DES-EDE3-CFB',
    'DES-EDE3-CFB1',
    'DES-EDE3-CFB8',
    'DES-EDE3-OFB',
    'DES-OFB',
    'des3',
    'desx',
    'DESX-CBC',
];
for (const alg of algorithms) {
    const encrypted = aesEncrypt(alg,data, key);
    const decrypted = aesDecrypt(alg,encrypted, key);

    console.log(`algorithm: ${alg}`);
    console.log(`Encrypted text: ${encrypted}`);
    console.log(`Decrypted text: ${decrypted}`);

}
// var pass = 'e251bca2a38de12a'
// console.log(aesDecrypt(pass,key))
