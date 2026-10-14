// The teacher's Google Apps Script web app (google-apps-script/Code.gs), the
// URL that ends in /exec. A link with ?s=<url> (from the Teacher page) also
// sets it for the students who open it.
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzi6kHiUefhgLz_Lqqt3CUBPhlALS66Iq7yOIZVu0a6XTuY1tvSxJbjLQwzSVQatgXh/exec';

// Earlier deployments: a browser that saved one of these (from the Teacher
// page or a ?s= link) uses SCRIPT_URL instead.
export const RETIRED_URLS = [
  'https://script.google.com/macros/s/AKfycbyttqRw62yK_FaNUo16KjWi6fr3iHaJRzVYo4vBQ_I3BYmWjLJ4h5h2TbgXQ-yZWThy/exec',
];

// The code that opens the teacher pages (set-up and the free preview of the
// readings). It keeps students out of them during the exam; it is not a
// password: anyone who reads the page's code can find it.
export const TEACHER_CODE = '1234';

// The version of google-apps-script/Code.gs this page needs (its doGet says
// which one is deployed). 2: five readings; 3: ten readings.
export const SCRIPT_VERSION = 3;
