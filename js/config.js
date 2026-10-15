// The teacher's Google Apps Script web app (google-apps-script/Code.gs), the
// URL that ends in /exec. A link with ?s=<url> (from the Teacher page) also
// sets it for the students who open it.
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxQb1WdP-7SB3pQZWjmzTUqgYUdApXODRBxPPlrylRmkH0HFCpelEaLnGb1hXC_73o/exec';

// Earlier deployments: a browser that saved one of these (from the Teacher
// page or a ?s= link) uses SCRIPT_URL instead.
export const RETIRED_URLS = [
  'https://script.google.com/macros/s/AKfycbyttqRw62yK_FaNUo16KjWi6fr3iHaJRzVYo4vBQ_I3BYmWjLJ4h5h2TbgXQ-yZWThy/exec',
  'https://script.google.com/macros/s/AKfycbzi6kHiUefhgLz_Lqqt3CUBPhlALS66Iq7yOIZVu0a6XTuY1tvSxJbjLQwzSVQatgXh/exec',
  'https://script.google.com/macros/s/AKfycbxYluH9qfOA4Q_5iB6oIHbh95jJFfi3udNd5HHh1xXYvQfJDeVybAunH5u_fjW0Zcjx/exec',
];

// The code that opens the teacher pages (set-up and the free preview of the
// readings). It keeps students out of them during the exam; it is not a
// password: anyone who reads the page's code can find it.
export const TEACHER_CODE = '1234';

// The oldest google-apps-script/Code.gs this page works with (its doGet says
// which one is deployed). From version 3 the script takes the readings r1–r10,
// so the five readings of version 4 also work with a version 3 deployment;
// version 4 only updates the Readings and Rubric tabs.
export const SCRIPT_VERSION = 3;
