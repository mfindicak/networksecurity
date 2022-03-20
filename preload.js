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
