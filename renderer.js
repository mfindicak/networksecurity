var dbx = null;
var currentMail = null;
var clickedElement = {};
const appTokenUrl =
  'https://www.dropbox.com/oauth2/authorize?client_id=2h5lnsd8852z1u9&response_type=code';

const shareFile = async (
  fileId,
  filePath,
  sentToEmails,
  encryptedPasswords
) => {
  let members = [];
  sentToEmails.forEach((element) => {
    members.push({ email: element, '.tag': 'email' });
  });
  dbx
    .sharingAddFileMember({
      file: filePath,
      members: members,
      quiet: false,
      access_level: { '.tag': 'viewer' },
      add_message_as_comment: false,
    })
    .then((e) => console.log(e))
    .catch((error) => console.log(error));
  await window.addUsersForFile(fileId, sentToEmails, encryptedPasswords);
  $('#shareModalCenter').modal('hide');
};

const shareFileDropbox = async () => {
  let sentToEmails = $('#shareSelect').val();
  if (sentToEmails.length > 0) {
    let emailPublicKeys = [];
    console.log(clickedElement);
    const fileData = await window.getFileDataIfExit(clickedElement.name);
    for (let index = 0; index < sentToEmails.length; index++) {
      const element = sentToEmails[index];
      let userPublicId = await window.getPublicIdOfUser(element);
      emailPublicKeys.push({ email: element, publicId: userPublicId });
    }
    for (let index = 0; index < fileData.encryptedPasswords.length; index++) {
      const element = fileData.encryptedPasswords[index];
      if (element.email === currentMail) {
        fileKey = element.encryptedPassword;
        break;
      }
    }

    window.api.send('toMain', {
      function: 'addNewUserForFile',
      fileData: {
        fileId: clickedElement.name,
        filePath: clickedElement.path_display,
        emails: sentToEmails,
        fileKey: fileKey,
        emailPublicKeys: emailPublicKeys,
      },
    });
  }
};

const fileSelected = async () => {
  let emailPublicKeys = [];
  const fileId = await window.createNewFileId();
  const filePassword = generateRandomPassword();
  const sentToEmails = [currentMail]; //Su an icin yalnizca kendimle paylasicam
  for (let index = 0; index < sentToEmails.length; index++) {
    const element = sentToEmails[index];
    let userPublicId = await window.getPublicIdOfUser(element);
    emailPublicKeys.push({ email: element, publicId: userPublicId });
  }
  window.api.send('toMain', {
    function: 'encryptWithPublicKey',
    fileData: {
      fileId: fileId,
      filePassword: filePassword,
      sentToEmails: sentToEmails,
      emailPublicKeys: JSON.stringify(emailPublicKeys),
      sendByEmail: currentMail,
    },
  });
};

const clearTheList = (listId) => {
  const ourList = document.getElementById(listId);
  ourList.innerHTML = '';
};

const getSharingFileList = (listId) => {
  dbx
    .sharingListReceivedFiles({ limit: 100 })
    .then(function (response) {
      //console.log(response);
      response.result.entries.forEach((element) => {
        //console.log(element['.tag']);
        addSharingFileElementToList(listId, element);
      });
    })
    .catch(function (error) {
      console.log(error);
    });
};

const getFileList = (listId, path) => {
  clearTheList(listId);
  currentPath = path + '/';
  dbx
    .filesListFolder({ path: path })
    .then(function (response) {
      //console.log(response);
      response.result.entries.forEach((element) => {
        //console.log(element['.tag']);
        addElementToList(listId, element);
      });
    })
    .catch(function (error) {
      console.log(error);
    });
  getSharingFileList('fileList');
};

const getAccesToken = async (lastAccesToken = null) => {
  let myAccessToken = null;
  if (lastAccesToken == null) {
    var myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
      'Basic Mmg1bG5zZDg4NTJ6MXU5OnBxa2M1dnhweHZzcmJleg=='
    );

    var formdata = new FormData();
    formdata.append('code', document.getElementById('tokenText').value);
    formdata.append('grant_type', 'authorization_code');

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    };

    const response = await fetch(
      'https://api.dropboxapi.com/oauth2/token',
      requestOptions
    )
      .then((response) => response.json())
      .then((response) => (myAccessToken = response['access_token']));

    window.api.send('toMain', {
      function: 'saveAccesToken',
      accesToken: myAccessToken,
    });
  } else {
    myAccessToken = lastAccesToken;
  }
  dbx = new Dropbox.Dropbox({
    accessToken: myAccessToken,
  });

  dbx.usersGetCurrentAccount().then((e) => {
    currentMail = e.result.email;
    window.addEmail(currentMail, thePublicKey);
  });

  getFileList('fileList', '');
  document.getElementById('tokenContainer').style = 'display:none';
  return myAccessToken;
};

var currentPath = '/';

const encryptAndUploadFile = (key, encryptedName) => {
  var fileInput = document.getElementById('file-upload');
  var file = fileInput.files[0];
  var reader = new FileReader();
  reader.onload = () => {
    var wordArray = CryptoJS.lib.WordArray.create(reader.result);
    var encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();

    var fileEnc = new Blob([encrypted]); // Create blob from string
    fileEnc.name = encryptedName;
    console.log(fileEnc);
    uploadFile(fileEnc);
  };
  reader.readAsArrayBuffer(file);
};

const decrypt = (fileName, fileKey, file) => {
  var reader = new FileReader();
  reader.onload = () => {
    var decrypted = CryptoJS.AES.decrypt(reader.result, fileKey);
    var typedArray = convertWordArrayToUint8Array(decrypted);

    var fileDec = new Blob([typedArray]);
    console.log(fileDec);

    saveAsFile(fileName, fileDec);
  };
  console.log(file);
  reader.readAsText(file);
};

const addSharingFileElementToList = (listId, element) => {
  var ul = document.getElementById(listId);
  var li = document.createElement('li');
  var div = document.createElement('div');

  var fileName = element.name + ' (Paylaşılan Dosya)';

  li.appendChild(document.createTextNode(fileName));
  div.appendChild(li);
  var downloadButton = document.createElement('span');

  li.classList.add('file');
  downloadButton.addEventListener('click', () =>
    downloadSharingFile(element.preview_url, element.name)
  );
  div.appendChild(downloadButton);

  downloadButton.innerHTML = '<i class="fa-solid fa-file-arrow-down"></i>';
  ul.appendChild(div);
};

const addElementToList = (listId, element) => {
  var ul = document.getElementById(listId);
  var li = document.createElement('li');
  li.addEventListener('click', () => getFileList(listId, element.path_display));
  var div = document.createElement('div');

  var fileName = element.name;
  if (
    document.getElementById('myCheck').checked &&
    element['.tag'] === 'file'
  ) {
    fileName = fileName
      .replaceAll('xMl3Jk', '+')
      .replaceAll('Por21Ld', '/')
      .replaceAll('Ml32', '=');
    fileName = CryptoJS.AES.decrypt(fileName, key).toString(CryptoJS.enc.Utf8);
  }

  li.appendChild(document.createTextNode(fileName));
  div.appendChild(li);
  var downloadButton = document.createElement('span');
  var shareButton = document.createElement('span');
  shareButton.innerHTML = '<i class="fa-solid fa-square-share-nodes"></i>';
  shareButton.addEventListener('click', async () =>
    // shareFileDropbox(element.path_display, element.name)
    {
      document.getElementById('shareModalCenterBody').innerHTML = '';
      clickedElement = element;
      let allEmails = await window.getAllEmails();
      let sharedEmails = await window.getEmailsOfFile(fileName);
      let selectDiv = document.createElement('select');
      selectDiv.id = 'shareSelect';
      selectDiv.className = 'container-fluid';
      selectDiv.multiple = true;
      allEmails.forEach((element) => {
        let anOption = document.createElement('option');
        if (sharedEmails.includes(element)) anOption.disabled = true;
        anOption.value = element;
        anOption.innerHTML = element;
        selectDiv.appendChild(anOption);
      });

      document.getElementById('shareModalCenterBody').append(selectDiv);
      $('#shareModalCenter').modal('show');
    }
  );
  if (element['.tag'] === 'file') {
    li.classList.add('file');
    downloadButton.addEventListener('click', () =>
      downloadFile(element.path_display, element.name)
    );
    div.appendChild(shareButton);
    div.appendChild(downloadButton);
  } else {
    li.classList.add('folder');
    // downloadButton.addEventListener('click', () =>
    //   downloadFolder(element.path_display, element.name)
    // );
  }

  downloadButton.innerHTML = '<i class="fa-solid fa-file-arrow-down"></i>';
  ul.appendChild(div);
};

const downloadSharingFile = async (url, fileName) => {
  const fileData = await window.getFileDataIfExit(fileName);
  console.log(fileData);
  let fileKey = null;
  for (let index = 0; index < fileData.encryptedPasswords.length; index++) {
    const element = fileData.encryptedPasswords[index];
    if (element.email === currentMail) {
      fileKey = element.encryptedPassword;
      console.log('Sifre Bulundu:' + fileKey);
      break;
    }
  }
  window.api.send('toMain', {
    function: 'decryptWithPrivateKey',
    fileData: {
      fileId: fileName,
      fileUrl: url,
      oldFileName: fileData.oldFileName,
      filePassword: fileKey,
    },
  });
};

const downloadFile = async (path, fileName) => {
  const fileData = await window.getFileDataIfExit(fileName);
  let fileKey = null;
  for (let index = 0; index < fileData.encryptedPasswords.length; index++) {
    const element = fileData.encryptedPasswords[index];
    if (element.email === currentMail) {
      fileKey = element.encryptedPassword;
      console.log('Sifre Bulundu:' + fileKey);
      break;
    }
  }
  window.api.send('toMain', {
    function: 'decryptWithPrivateKeySelfFile',
    fileData: {
      filePath: path,
      oldFileName: fileData.oldFileName,
      filePassword: fileKey,
    },
  });
};

// const downloadFolder = (path, fileName) => {
//   dbx.filesDownloadZip({ path: path }).then((e) => {
//     saveAsFile(fileName + '.zip', e.result.fileBlob);
//   });
// };

function uploadFile(file) {
  var path = '/';
  if (currentPath && currentPath !== '') path = currentPath;
  const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;

  if (file.size < UPLOAD_FILE_SIZE_LIMIT) {
    // File is smaller than 150 Mb - use filesUpload API
    dbx
      .filesUpload({ path: path + file.name, contents: file })
      .then(function (response) {
        var results = document.getElementById('results');
        var br = document.createElement('br');
        results.appendChild(document.createTextNode('Dosya Yüklendi!'));
        getFileList('fileList', '');
      })
      .catch(function (error) {
        console.error(error);
      });
  } else {
    // File is bigger than 150 Mb - use filesUploadSession* API
    const maxBlob = 8 * 1000 * 1000; // 8Mb - Dropbox JavaScript API suggested max file / chunk size

    var workItems = [];

    var offset = 0;

    while (offset < file.size) {
      var chunkSize = Math.min(maxBlob, file.size - offset);
      workItems.push(file.slice(offset, offset + chunkSize));
      offset += chunkSize;
    }

    const task = workItems.reduce((acc, blob, idx, items) => {
      if (idx == 0) {
        // Starting multipart upload of file
        return acc.then(function () {
          return dbx
            .filesUploadSessionStart({ close: false, contents: blob })
            .then((response) => response.session_id);
        });
      } else if (idx < items.length - 1) {
        // Append part to the upload session
        return acc.then(function (sessionId) {
          var cursor = { session_id: sessionId, offset: idx * maxBlob };
          return dbx
            .filesUploadSessionAppendV2({
              cursor: cursor,
              close: false,
              contents: blob,
            })
            .then(() => sessionId);
        });
      } else {
        // Last chunk of data, close session
        return acc.then(function (sessionId) {
          var cursor = { session_id: sessionId, offset: file.size - blob.size };
          var commit = {
            path: '/' + file.name,
            mode: 'add',
            autorename: true,
            mute: false,
          };
          return dbx.filesUploadSessionFinish({
            cursor: cursor,
            commit: commit,
            contents: blob,
          });
        });
      }
    }, Promise.resolve());

    task
      .then(function (result) {
        var results = document.getElementById('results');
        results.appendChild(document.createTextNode('Dosya Yüklendi!'));
        setTimeout(() => {
          location.reload();
        }, 1000);
      })
      .catch(function (error) {
        console.error(error);
      });
  }
  return false;
}

var saveAsFile = function (fileName, fileContents) {
  if (typeof Blob != 'undefined') {
    // Alternative 1: using Blob
    var textFileAsBlob = new Blob([fileContents], { type: 'text/plain' });
    var downloadLink = document.createElement('a');
    downloadLink.download = fileName;
    if (window.webkitURL != null) {
      downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      downloadLink.onclick = document.body.removeChild(event.target);
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
    }
    downloadLink.click();
  } else {
    // Alternative 2: using Data
    var pp = document.createElement('a');
    pp.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContents)
    );
    pp.setAttribute('download', fileName);
    pp.onclick = document.body.removeChild(event.target);
    pp.click();
  }
}; // saveAsFile

// window.onload = function () {
//   getFileList('fileList', '');
// };

const convertWordArrayToUint8Array = (wordArray) => {
  var arrayOfWords = wordArray.hasOwnProperty('words') ? wordArray.words : [];
  var length = wordArray.hasOwnProperty('sigBytes')
    ? wordArray.sigBytes
    : arrayOfWords.length * 4;
  var uInt8Array = new Uint8Array(length),
    index = 0,
    word,
    i;
  for (i = 0; i < length; i++) {
    word = arrayOfWords[i];
    uInt8Array[index++] = word >> 24;
    uInt8Array[index++] = (word >> 16) & 0xff;
    uInt8Array[index++] = (word >> 8) & 0xff;
    uInt8Array[index++] = word & 0xff;
  }
  return uInt8Array;
};

const changedSwitch = () => {
  const folders = document.getElementsByClassName('folder');
  const files = document.getElementsByClassName('file');
  if (document.getElementById('myCheck').checked) {
    console.log('checked');
    document.getElementById('encryptLabel').innerText = 'Şifresiz';
    /* for (let data of folders) {
      var name = data.innerText;
      name = name.replaceAll('xMl3Jk', '+')
        .replaceAll('Por21Ld', '/')
        .replaceAll('Ml32', '=');
      var name = CryptoJS.AES.decrypt(name, key).toString(
        CryptoJS.enc.Utf8);
      data.innerText = name;
    } */
    for (let data of files) {
      var name = data.innerText;
      name = name
        .replaceAll('xMl3Jk', '+')
        .replaceAll('Por21Ld', '/')
        .replaceAll('Ml32', '=');
      var name = CryptoJS.AES.decrypt(name, key).toString(CryptoJS.enc.Utf8);
      data.innerText = name;
    }
  } else {
    console.log('no checked');
    document.getElementById('encryptLabel').innerText = 'Şifreli';
    for (let data of files) {
      var name = data.innerText;
      console.log(name);
      var name = CryptoJS.AES.encrypt(name, key)
        .toString()
        .replaceAll('+', 'xMl3Jk')
        .replaceAll('/', 'Por21Ld')
        .replaceAll('=', 'Ml32');
      console.log(name);
      data.innerText = name;
    }
  }
};
