/* ── Phonology Exam · parte 3 de 7 ── */

function setup() {
  Object.keys(SHEETS).forEach(function (k) { sheet_(k); });
  const rubric = sheet_('rubric');
  if (rubric.getLastRow() < 2) {
    rubric.getRange(2, 1, RUBRIC.length, RUBRIC[0].length).setValues(RUBRIC);
  }
  const readings = sheet_('readings');
  if (readings.getLastRow() > 1) {
    readings.getRange(2, 1, readings.getLastRow() - 1, readings.getLastColumn()).clearContent();
  }
  readings.getRange(2, 1, READINGS_ROWS.length, READINGS_ROWS[0].length).setValues(READINGS_ROWS);
  rootFolder_();
  const msg = 'Listo: hojas Exams, Responses, Rubric y Readings, y la carpeta «' + ROOT_FOLDER +
    '» en tu Drive. Ahora implementá la aplicación web.';
  Logger.log(msg);
  return msg;
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu(APP).addItem('Configurar (setup)', 'setup').addToUi();
}

function doGet() {
  const name = SpreadsheetApp.getActiveSpreadsheet().getName();
  return json_({ ok: true, app: APP, sheet: name, version: VERSION });
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.type === 'start') return json_(withLock_(function () { return start_(data); }));
    if (data.type === 'recording') return json_(recording_(data));
    if (data.type === 'finish') return json_(withLock_(function () { return finish_(data); }));
    throw new Error('Pedido desconocido: ' + String(data.type));
  } catch (err) {
    return json_({ ok: false, error: err.message });
  }
}

/* ── fin de la parte 3 de 7 ── */
