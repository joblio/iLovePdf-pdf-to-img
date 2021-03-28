// https://developer.ilovepdf.com/docs/api-reference
// https://www.convertapi.com/prices may have a free tier

function createImageFromPdfUsingILovePdf(pdfFile) {
  let token = authILovePdf();
  Logger.log(token);
  let iLoveObj = startILovePdf(token, 'pdfjpg');
  if (iLoveObj.server == undefined) throw "Problem with startILovePdf "+JSON.stringify(iLoveObj);
  iLoveObj.tool = 'pdfjpg';
  iLoveObj.token = token;
  iLoveObj.file = pdfFile;
  iLoveObj.filename = pdfFile.getName();
  let uploadResult = uploadILovePdf(iLoveObj);
  if (uploadResult.server_filename === undefined) throw "Problem with uploadILovePdf "+JSON.stringify(uploadResult);
  iLoveObj.server_filename = uploadResult.server_filename;
  Utilities.sleep(2000);
  let processResult = processILovePdf(iLoveObj);
  if (processResult.status !== 'TaskSuccess') throw "Problem with processILovePdf "+JSON.stringify(processResult);
  Utilities.sleep(2000);
  let downloadResult = downloadILovePdf(iLoveObj);
  DriveApp.createFile(downloadResult).setName('iLovePdf.jpg');
  return downloadResult;
}

function authILovePdf() {
  let PROJECT_ID = 'project_public_0123456789';
  // let SECRET_KEY = 'secret_key_0123456789';
  let POST_MESSAGE_ENDPOINT = 'https://api.ilovepdf.com/v1/';
  let url = POST_MESSAGE_ENDPOINT + 'auth';
  var payload = { public_key: PROJECT_ID };
  let options = {
    method: 'post',
    payload: JSON.stringify(payload),
    contentType: 'application/json',
    muteHttpExceptions: true
  }

  var result = UrlFetchApp.fetch(url, options);
  Logger.log(result);
  return JSON.parse(result).token;
}

function startILovePdf(token, tool) {
  let POST_MESSAGE_ENDPOINT = 'https://api.ilovepdf.com/v1/';
  let url = POST_MESSAGE_ENDPOINT + 'start/' + tool;
  let options = {
    method: 'get',
    headers: { 'Authorization': 'Bearer ' + token },
    contentType: 'application/json',
  }
  var result = UrlFetchApp.fetch(url, options);
  return JSON.parse(result);
}

function uploadILovePdf(iLoveObj) {
  let url = 'https://' + iLoveObj.server + '/v1/upload';
  let payload = {
    task: iLoveObj.task,
    file: iLoveObj.file
  }
  let options = {
    method: 'post',
    payload: payload,
    headers: { 'Authorization': 'Bearer ' + iLoveObj.token }
  }
  // Logger.log(UrlFetchApp.getRequest(url, options))
  var result = UrlFetchApp.fetch(url, options);
  return JSON.parse(result);
}

function processILovePdf(iLoveObj) {
  let url = 'https://' + iLoveObj.server + '/v1/process';
  Logger.log(iLoveObj.server_filename);
  Logger.log(iLoveObj.filename);
  let payload = {
    task: iLoveObj.task,
    tool: iLoveObj.tool,
    'files[0][server_filename]': iLoveObj.server_filename,
    'files[0][filename]': iLoveObj.filename
  }
  let options = {
    method: 'post',
    payload: payload,
    headers: { 'Authorization': 'Bearer ' + iLoveObj.token },
    // contentType: 'multipart/form-data',
    muteHttpExceptions: true
  }
  Logger.log(UrlFetchApp.getRequest(url, options));
  var result = UrlFetchApp.fetch(url, options);
  Logger.log(result)
  // throw ""
  return JSON.parse(result);
}

function getTaskStatus(iLoveObj) {
  let url = 'https://api.ilovepdf.com/v1/task/'+iLoveObj.task;
  let options = {
    method: 'get',
    headers: { 'Authorization': 'Bearer ' + iLoveObj.token },
    muteHttpExceptions: true
  }
  Logger.log(UrlFetchApp.getRequest(url, options));
  var result = UrlFetchApp.fetch(url, options);
  Logger.log(result);
  return JSON.parse(result);
}

function  downloadILovePdf(iLoveObj) {
  let url = 'https://' + iLoveObj.server + '/v1/download/'+iLoveObj.task;
  let options = {
    method: 'get',
    headers: { 'Authorization': 'Bearer ' + iLoveObj.token },
  }
  var result = UrlFetchApp.fetch(url, options);
  return result;
}
