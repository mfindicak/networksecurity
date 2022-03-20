var dbx = new Dropbox.Dropbox({
  accessToken:
    'sl.BEKvMj4zyVQyQHJpErFSwGDKKZN-VqiRSBuhO-fyolO3-kYnRUjVX5nZMA_l3p9rBnNOtGsMevq9Voj-fCk6Xu0ihEDgFi5QJK_zIiGja-xRImYsTYIaYdo1YLXHcXl1Lp6W6kw9zcu5',
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
