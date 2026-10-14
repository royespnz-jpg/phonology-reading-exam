/* ── Phonology Exam · parte 6 de 10 ── */

function setup() {
  Object.keys(SHEETS).forEach(function (k) { sheet_(k); });
  reference_('rubric', rubric_());
  reference_('readings', readingRows_());
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

/* ── fin de la parte 6 de 10 ── */
