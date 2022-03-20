var dbx = new Dropbox.Dropbox({
  accessToken:
    'sl.BEI9GtbDVmPSwhybifwKUUaALIim8zl8Fq1wYulN0kR6lFY1ONwdKRwvZm6QjQNHpd0MLPZfz_BSrk30pKjCvxhfsR-uhbG28g8WFCcD7vHqKAnEDR0USZt4S8M_edngFzOSpwKqF9mz',
});

const addElementToList = (listId, element) => {
  var ul = document.getElementById(listId);
  var li = document.createElement('li');
  li.addEventListener('click', () => getFileList(listId, element.path_display));
  var div = document.createElement('div');
  li.appendChild(document.createTextNode(element.name));
  div.appendChild(li);
  var downloadButton = document.createElement('button');
  if (element['.tag'] === 'file')
    downloadButton.addEventListener('click', () =>
      downloadFile(element.path_display, element.name)
    );
  else
    downloadButton.addEventListener('click', () =>
      downloadFolder(element.path_display, element.name)
    );
  downloadButton.innerText = 'İndir';
  downloadButton.style = 'margin-left:10px';
  div.style = 'display:flex;margin:5px';
  div.appendChild(downloadButton);
  ul.appendChild(div);
};

const downloadFile = (path, fileName) => {
  dbx.filesDownload({ path: path }).then((e) => {
    saveAsFile(fileName, e.result.fileBlob);
  });
};

const downloadFolder = (path, fileName) => {
  dbx.filesDownloadZip({ path: path }).then((e) => {
    saveAsFile(fileName + '.zip', e.result.fileBlob);
  });
};

const clearTheList = (listId) => {
  const ourList = document.getElementById(listId);
  ourList.innerHTML = '';
};

const getFileList = (listId, path) => {
  clearTheList(listId);
  dbx
    .filesListFolder({ path: path })
    .then(function (response) {
      console.log(response);
      response.result.entries.forEach((element) => {
        addElementToList(listId, element);
      });
    })
    .catch(function (error) {
      console.log(error);
    });
};

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
