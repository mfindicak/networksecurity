const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
var crypto = require('crypto');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1100,
    height: 900,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, 'preload.js'), // use a preload script
    },
  });

  // Load app
  win.loadFile(path.join(__dirname, 'index.html'));

  // rest of code..
}

app.on('ready', createWindow);

ipcMain.on('toMain', (event, args) => {
  switch (args.function) {
    case 'readFile':
      fs.readFile(args.fileName, 'utf8', (error, data) => {
        // Do something with file contents

        // Send result back to renderer process
        win.webContents.send('fromMain', {
          function: 'readFile',
          data: data,
        });
      });
      break;
    case 'getPublicKey':
      fs.readFile('publicKey.pem', 'utf8', (error, data) => {
        // Do something with file contents

        // Send result back to renderer process
        win.webContents.send('fromMain', {
          function: 'getPublicKey',
          data: data,
        });
      });
      break;
    case 'getPrivateKey':
      fs.readFile('privateKey.pem', 'utf8', (error, data) => {
        // Do something with file contents

        // Send result back to renderer process
        win.webContents.send('fromMain', {
          function: 'getPrivateKey',
          data: data,
        });
      });
      break;
    case 'saveAccesToken':
      fs.writeFile(
        'accesToken.json',
        JSON.stringify({ accesToken: args.accesToken }),
        'utf8',
        function (err) {
          if (err) return console.log(err);
          console.log('Hello World > helloworld.txt');
        }
      );
      break;
    case 'getAccesToken':
      fs.readFile('accesToken.json', 'utf8', (error, data) => {
        // Send result back to renderer process
        win.webContents.send('fromMain', {
          function: 'getAccesToken',
          data: data,
        });
      });
      break;
    case 'encryptWithPublicKey':
      let encryptedPasswords = [];
      JSON.parse(args.fileData.emailPublicKeys).forEach((element) => {
        encryptedPasswords.push({
          email: element.email,
          encryptedPassword: encryptWithPublicKey(
            element.publicId,
            args.fileData.filePassword
          ).toJSON(),
        });
      });
      win.webContents.send('fromMain', {
        function: 'encryptWithPublicKey',
        data: {
          fileId: args.fileData.fileId,
          encryptedPasswords: encryptedPasswords,
          sentToEmails: args.fileData.sentToEmails,
          sendByEmail: args.fileData.sendByEmail,
          filePassword: args.fileData.filePassword,
        },
      });
      break;
    case 'decryptWithPrivateKey':
      win.webContents.send('fromMain', {
        function: 'decryptWithPrivateKey',
        data: {
          fileId: args.fileData.fileId,
          fileUrl: args.fileData.fileUrl,
          oldFileName: args.fileData.oldFileName,
          fileKey: String(
            decryptWithPrivateKey(Buffer.from(args.fileData.filePassword))
          ),
        },
      });
      break;
    case 'addNewUserForFile':
      let newEncryptedPasswords = [];
      let decryptedKey = String(
        decryptWithPrivateKey(Buffer.from(args.fileData.fileKey))
      );
      args.fileData.emailPublicKeys.forEach((element) => {
        newEncryptedPasswords.push({
          email: element.email,
          encryptedPassword: encryptWithPublicKey(
            element.publicId,
            decryptedKey
          ).toJSON(),
        });
      });
      win.webContents.send('fromMain', {
        function: 'addNewUserForFile',
        data: {
          fileId: args.fileData.fileId,
          filePath: args.fileData.filePath,
          emails: args.fileData.emails,
          encryptedPasswords: newEncryptedPasswords,
        },
      });
      break;
    default:
  }
});

//Kriptolama

const generateKeys = () => {
  crypto.generateKeyPair(
    'rsa',
    {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: 'top secret',
      },
    },
    (err, publicKey, privateKey) => {
      // Handle errors and use the generated key pair.
      fs.writeFileSync('privateKey.pem', privateKey);
      fs.writeFileSync('publicKey.pem', publicKey);
      // const sifreli = encryptWithPublicKey('Ufuk harikasın');
      // console.log('Sifreli:' + sifreli);
      // const cozuldu = decryptWithPrivateKey(sifreli);
      // console.log('Cozuldu:' + cozuldu);
    }
  );
};

try {
  if (fs.existsSync('./publicKey.pem') && fs.existsSync('./privateKey.pem')) {
    console.log('Public ve Private Key Kayıtlı');
  } else {
    generateKeys();
  }
} catch (err) {
  generateKeys();
}

const encryptWithPublicKey = (publicKey, plainText) => {
  return crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    // We convert the data string to a buffer
    Buffer.from(plainText)
  );
};

const decryptWithPrivateKey = (encryptedText) => {
  return crypto.privateDecrypt(
    {
      key: fs.readFileSync('privateKey.pem', 'utf8'),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
      passphrase: 'top secret',
    },
    encryptedText
  );
};

//Kriptolama
