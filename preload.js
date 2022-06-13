const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});

var crypto = require('crypto');
var fs = require('fs');

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
      //   const sifreli = encryptWithPublicKey('Ufuk harikasın');
      //   console.log('Sifreli:' + sifreli);
      //   const cozuldu = decryptWithPrivateKey(sifreli);
      //   console.log('Cozuldu:' + cozuldu);
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

const encryptWithPublicKey = (plainText) => {
  return crypto.publicEncrypt(
    {
      key: fs.readFileSync('publicKey.pem', 'utf8'),
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

// require('isomorphic-fetch'); // or another library of choice.
// var Dropbox = require('dropbox').Dropbox;
// var dbx = new Dropbox({
//   accessToken:
//     "'sl.BEKvMj4zyVQyQHJpErFSwGDKKZN-VqiRSBuhO-fyolO3-kYnRUjVX5nZMA_l3p9rBnNOtGsMevq9Voj-fCk6Xu0ihEDgFi5QJK_zIiGja-xRImYsTYIaYdo1YLXHcXl1Lp6W6kw9zcu5",
// });
// dbx
//   .filesListFolder({ path: '/Network Security' })
//   .then(function (response) {
//     console.log(response.result.entries);
//     dbx.filesDownloadZip({ path: '/Network Security' }).then((e) => {
//       console.log(e);
//       saveAsFile('download.zip', e.result.fileBlob);
//       //   saveAsFile(e.result.name, e.result.fileBlob);
//     });
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector);
//     if (element) element.innerText = text;
//   };

//   for (const dependency of ['chrome', 'node', 'electron']) {
//     replaceText(`${dependency}-version`, process.versions[dependency]);
//   }
// });

// var saveAsFile = function (fileName, fileContents) {
//   if (typeof Blob != 'undefined') {
//     // Alternative 1: using Blob
//     var textFileAsBlob = new Blob([fileContents], { type: 'text/plain' });
//     var downloadLink = document.createElement('a');
//     downloadLink.download = fileName;
//     if (window.webkitURL != null) {
//       downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
//     } else {
//       downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
//       downloadLink.onclick = document.body.removeChild(event.target);
//       downloadLink.style.display = 'none';
//       document.body.appendChild(downloadLink);
//     }
//     downloadLink.click();
//   } else {
//     // Alternative 2: using Data
//     var pp = document.createElement('a');
//     pp.setAttribute(
//       'href',
//       'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContents)
//     );
//     pp.setAttribute('download', fileName);
//     pp.onclick = document.body.removeChild(event.target);
//     pp.click();
//   }
// }; // saveAsFile
