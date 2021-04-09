const ETHSBELL_API_URL = "https://api.ethsbell.xyz/data/eths";
const SPREADSHEET_URL = "https://script.google.com/macros/s/AKfycbyD4QWaKRFb88EY9ZENMZu7l1qnk9WImxVf1Bkj-bHidrXVOPwzKgFzY1rvKhGLEI9Q/exec?sheet={SHEET}";

// Delay between each fetch (seconds)
const DELAY = 15;

// Which sheet is used for each day
const SHEET_INDEXES = {
  'Sunday': -1,
  'Monday': -1,
  'Tuesday': 1,
  'Wednesday': 2,
  'Thursday': 3,
  'Friday': 4,
  'Saturday': -1
}

// Dropdown selected
let selectedPeriod = null;

// Periods to be ignored in the dropdown
const IGNORED_PERIODS = ['AM Support', 'Office Hours / Teacher Collaboration', 'Break', 'Break/Travel'];

// Dropdown HTML
const dropdownWrapper = '<select class="dropdown" onchange="dropdownChanged(event)">{OPTIONS}</select>';
const dropdownOptions = '<option value="{VALUE}" {DISABLED}>{NAME}</option>';
// Add advancedFormat plugin to day.js
dayjs.extend(window.dayjs_plugin_advancedFormat)

// Generate text for date and time
function leftText() {
  const date = dayjs().format('dddd, MMMM Do');
  const time = dayjs().format('h:mm A');

  return {
    date,
    time
  };
}

// Get data from ETHSBell and the spreadsheet and parse them
async function fetchData(period, day) {
  // Fetch from ETHSBell
  const ethsbellRes = await fetch(ETHSBELL_API_URL);
  let ethsbellJson;

  try {
    ethsbellJson = await ethsbellRes.json();
  } catch (e) {}

  if (!ethsbellRes.ok || !ethsbellJson) return {
    ethsbell: {
      periods: [],
      current: null,
      remaining: null
    },
    data: []
  }
  // Get array of period names and remove ignored periods
  const periods = ethsbellJson.schedule ? ethsbellJson.schedule.period_array.map(x => x.period_name).filter(x => !IGNORED_PERIODS.includes(x)) : [];

  // Use current period if none specified
  if (!period) period = ethsbellJson.theSlot;

  if (period == 'monitor') {
    if (ethsbellJson.theNextSlot && !IGNORED_PERIODS.includes(ethsbellJson.theNextSlot) && ethsbellJson.timeLeftInPeriod >= 0 && (ethsbellJson.timeLeftInPeriod <= 5 || (ethsbellJson.timeLeftInPeriod <= 15 && IGNORED_PERIODS.includes(ethsbellJson.theSlot)))) {
      period = ethsbellJson.theNextSlot;
    } else {
      period = ethsbellJson.theSlot;
    }
  }

  // No period should be shown
  if (!period || IGNORED_PERIODS.includes(period) || (period == ethsbellJson.theSlot && ethsbellJson.timeLeftInPeriod < 0)) period = null;

  // ETHSBell data to return

  const ethsbell = {
    periods,
    current: ethsbellJson.theSlot && ethsbellJson.timeLeftInPeriod >= 0 ? ethsbellJson.theSlot : null,
    showing: period,
    remaining: ethsbellJson.timeLeftInPeriod
  };

  // No period specified and no current period
  if (!period) return {
    ethsbell,
    data: []
  };

  // Get sheet index for that day
  const dayOfWeek = day || dayjs().format('dddd');
  if (!SHEET_INDEXES[dayOfWeek] || SHEET_INDEXES[dayOfWeek] == -1) return { // No sheet for that day
    ethsbell,
    data: []
  };

  // Get URL to fetch for spreadsheet
  const spreadsheetURL = SPREADSHEET_URL.replace('{SHEET}', SHEET_INDEXES[dayOfWeek]);

  // Fetch the data
  const spreadsheetRes = await fetch(spreadsheetURL);

  let spreadsheetJson;
  try {
    spreadsheetJson = await spreadsheetRes.json();
  } catch (e) {}

  // Error
  if (!spreadsheetRes.ok || !spreadsheetJson || spreadsheetJson.error) return {
    ethsbell,
    data: []
  };

  // Get this period only from the data and remove teachers without a period
  const thisPeriod = spreadsheetJson.map(x => ({
    name: x.name,
    data: x[period]
  })).filter(x => x.data && x.data.location.toString().replace(/ /g, '') !== '');

  return {
    ethsbell,
    data: thisPeriod
  };
}

// HTML for each icon
const ICON_NOUNIFORM = '<i class="fas position-relative fa-tshirt nouniform"><i class="fas position-absolute fa-times nouniform-x"></i></i>';
const ICON_UNIFORM = '<i class="fas fa-tshirt uniform"></i>'
const ICON_HEART = '<i class="fas fa-heartbeat heart"></i>'
const ICON_LAPTOP = '<i class="fas fa-laptop laptop"></i>'
const ICON_ = ''

const CLASS_HTML = `<div class="class col-6 col-md-6 col-lg-4 col-xl-3 p-2 d-flex flex-column justify-content-center" {DISPLAY}>
<span class="name d-block">{NAME}</span>
<span class="location d-block">{LOCATION}</span>
<span class="icons d-block">
  {NOUNIFORM}
  {UNIFORM}
  {HEART}
  {LAPTOP}
</span>
</div>`;

// Generate cell HTML for each period
function getCellHTML(template, data, filter) {
  const htmlArray = data.data.map(x => {
    let html = template;

    html = html.replace('{NAME}', x.name); // Add name
    html = html.replace('{LOCATION}', x.data.location.toString()); // Add location
    html = html.replace('{NOUNIFORM}', x.data.nodress ? ICON_NOUNIFORM : ''); // Add no uniform icon
    html = html.replace('{UNIFORM}', !x.data.nodress ? ICON_UNIFORM : ''); // Add uniform icon
    html = html.replace('{HEART}', x.data.heart ? ICON_HEART : ''); // Add heartrate icon
    html = html.replace('{LAPTOP}', x.data.chromebook ? ICON_LAPTOP : ''); // Add laptop icon

    if (filter) filter = filter.toLowerCase().replace(/ /g, '');
    html = html.replace('{DISPLAY}', filter && filter !== '' && ![x.name, x.data.location].map(x => x.toLowerCase().replace(/ /g, '').includes(filter)).includes(true) ? 'style="display: none;"' : '')
    return html;
  })

  return htmlArray;
}

// Update HTML for monitor

async function updateMonitorHTML() {
  const data = await fetchData('monitor'); // Get data
  const html = getCellHTML(CLASS_HTML, data); // Get HTML from that data
  document.getElementById('main-body-monitor').innerHTML = html.join('\n'); // Add HTML to the body

  document.getElementById('date').innerHTML = leftText().date; // Set the date
  document.getElementById('time').innerHTML = leftText().time; // Set the time

  if (data.ethsbell.current && data.ethsbell.showing && data.ethsbell.remaining !== null) {
    document.getElementById('showing').innerHTML = 'Showing locations for<br>' + data.ethsbell.showing;
    document.getElementById('timeleft').innerHTML = `${data.ethsbell.current} ends in<br>${data.ethsbell.remaining} minute${data.ethsbell.remaining == 1 ? '' : 's'}.`;
  } else if (data.ethsbell.current && data.ethsbell.remaining !== null) {
    document.getElementById('showing').innerHTML = '';
    document.getElementById('timeleft').innerHTML = `${data.ethsbell.current} ends in<br>${data.ethsbell.remaining} minute${data.ethsbell.remaining == 1 ? '' : 's'}.`;
  } else {
    document.getElementById('showing').innerHTML = '';
    document.getElementById('timeleft').innerHTML = '';
  }
}

// Update HTML for website
async function updateWebsiteHTML() {
  const dropdown = document.querySelector('#selectperiod select');

  const search = document.getElementById('search').value;

  selectedPeriod = dropdown && dropdown.value && dropdown.value !== '---' ? dropdown.value : null;

  const data = await fetchData(selectedPeriod); // Get data
  const html = getCellHTML(CLASS_HTML, data, search); // Get HTML from that data
  document.getElementById('main-body').innerHTML = html.join('\n'); // Add HTML to the body

  document.getElementById('date').innerHTML = leftText().date; // Set the date
  document.getElementById('time').innerHTML = leftText().time; // Set the time

  // Set period end time text if there is a period
  if (data.ethsbell.current && data.ethsbell.remaining) document.getElementById('timeleft').innerHTML = `${data.ethsbell.current} ends in ${data.ethsbell.remaining} minute${data.ethsbell.remaining == 1 ? '' : 's'}.`;

  // Remove loading text and add in dropdown
  if (document.getElementById('showing').innerHTML == 'Loading data from ETHSBell...') {
    // Generate dropdown HTML
    const dropdown = dropdownWrapper.replace('{OPTIONS}', ['---'].concat(data.ethsbell.periods).map(x => dropdownOptions
      .replace('{NAME}', x)
      .replace('{VALUE}', x)
      .replace('{DISABLED}', x == '---' ? 'disabled' : '')
    ));

    // Remove text and add dropdown 
    document.getElementById('selectperiod').innerHTML = dropdown;

    // Select current period
    document.querySelector('#selectperiod select').selectedIndex = data.ethsbell.periods.indexOf(data.ethsbell.showing) + 1;
  }
  document.getElementById('showing').innerHTML = 'Showing locations for ';
}

function dropdownChanged() {
  document.getElementById('showing').innerHTML = 'Loading locations for ';
  updateWebsiteHTML();
}

function search() {
  const value = document.getElementById('search').value;
  const cellArray = document.querySelectorAll('.class');

  for (let cell of cellArray) {
    if (value == '' || ['.name', '.location'].map(x => cell.querySelector(x).innerHTML.toLowerCase().replace(/ /g, '').includes(value.toLowerCase().replace(/ /g, ''))).includes(true)) {
      cell.classList.remove('filtered');
    } else {
      cell.classList.add('filtered');
    }
  }
}

function init(location) {
  if (location == 'website') {
    setInterval(updateWebsiteHTML, DELAY * 1000);
    updateWebsiteHTML();
  }
  if (location == 'tv') {
    setInterval(updateMonitorHTML, DELAY * 1000);
    updateMonitorHTML();
  }
}
