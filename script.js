const ETHSBELL_API_URL_TODAY = "https://codeths.eths.k12.il.us/api/v1/today";
const ETHSBELL_API_URL_NOW = "https://codeths.eths.k12.il.us/api/v1/today/now";
const SPREADSHEET_URL = "https://script.google.com/macros/s/AKfycbyDKSHNBGObWtoxLr9kb9xlbXdnjZAB1K7mYPAEtR095d16Uhzt4QUTiHjQY7JWlqwG/exec";

// Delay between each fetch (seconds)
const DELAY = 15;

// Dropdown selected
let selectedPeriod = null;

// Dropdown HTML
const dropdownWrapper = '<select class="dropdown" onchange="dropdownChanged(event)">{OPTIONS}</select>';
const dropdownOptions = '<option value="{VALUE}" {DISABLED}>{NAME}</option>';
// Add advancedFormat plugin to day.js
dayjs.extend(window.dayjs_plugin_advancedFormat)

// Generate text for date and time
function leftText() {
	const date = dayjs(current_date()).format('dddd, MMMM Do');
	const time = dayjs(current_date()).format('h:mm A');

	return {
		date,
		time
	};
}

function classFilter(period) {
	return typeof period.kind == "object" && (period.kind.Class || period.kind.ClassOrLunch)
}

function formatPeriodName(name) {
	return name.replace(/(\w+ )?([0-9]+)([A-z]+)/, '$1$2')
}

function filterPeriodNames(names) {
	return names.map(x => formatPeriodName(x)).filter((x, i, a) => a.indexOf(x) == i)
}


function human_time(time) {
	const date = date_from_api(time);
	return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' });
}

function date_from_api(time, now = current_date()) {
	const [h, m, s] = time.split(':');
	const date = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m, s);
	return date;
}


// Gets current date
// If timestamp query string is provided, that is used instead of current.
function current_date() {
	const timestampQueryString = new URLSearchParams(window.location.search).get('timestamp');
	if (timestampQueryString) {
		return new Date(Number.parseInt(timestampQueryString, 10) * 1000);
	}

	return new Date();
}

// Gets a human readable duration from an epoch timestamp
function human_time_left(endTime, startTime = null, short = false) {
	const startDate = startTime ? date_from_api(startTime).getTime() : current_date().getTime();
	const endDate = date_from_api(endTime).getTime();
	const timeLeft = Math.floor((endDate - startDate) / 1000);
	const h = Math.floor(timeLeft / 60 / 60);
	const m = Math.ceil(timeLeft / 60 % 60);
	if (short) {
		if (h > 0) {
			return `${h}h ${m}m`;
		}

		return `${m}m`;
	}

	if (h > 0) {
		return `${h} ${plural_suffix(h, 'hour')} and ${m} ${plural_suffix(m, 'minute')}`;
	}

	return `${m} ${plural_suffix(m, 'minute')}`;
}

function human_list(items) {
	let output = '';
	if (items.length === 1) {
		return items[0].toString();
	}

	for (let i = 0; i < items.length; i++) {
		if (i === items.length - 1) {
			output += `${items.length > 2 ? ', ' : ' '}and ${items[i].toString()}`;
		} else if (i === 0) {
			output += items[i].toString();
		} else {
			output += `, ${items[i].toString()}`;
		}
	}

	return output;
}

// Get data from ETHSBell and the spreadsheet and parse them
async function fetchData(period = "now") {
	// Fetch from ETHSBell
	const today = await fetch(`${ETHSBELL_API_URL_TODAY}${window.location.search}`).catch(() => null);
	const now = await fetch(`${ETHSBELL_API_URL_NOW}${window.location.search}`).catch(() => null);

	let todayData, nowData;

	if (today && today.ok) {
		try {
			todayData = await today.json();
		} catch (e) { }
	}

	if (now && now.ok) {
		try {
			nowData = await now.json();
		} catch (e) { }
	}

	// Get array of period names and remove ignored periods
	const periods = todayData ? todayData.periods.filter(classFilter) : [];

	const nowPeriods = nowData && nowData.filter(classFilter).length > 0 ? nowData.filter(classFilter) : null
	const laterPeriods = todayData.periods.filter(x => date_from_api(x.start).getTime() > current_date().getTime());
	const nextPeriod = laterPeriods && laterPeriods.filter(classFilter).length > 0 ? laterPeriods.filter(classFilter)[0] : null;

	if (period == 'monitor') {
		if ((!nowPeriods || (nowPeriods && (nowPeriods.kind == "Passing" || !nowPeriods.map(x => x.end_timestamp * 1000 - current_date().getTime()).some(x => x > 5 * 60 * 1000)))) && nextPeriod) {
			period = laterPeriods.filter(classFilter).filter((x, i, arr) => x.start == arr[0].start);
		} else if (nowPeriods) {
			period = nowPeriods;
		} else {
			period = null;
		}
	} else if (period == "now") {
		period = nowPeriods;
	} else if (period) {
		period = todayData.periods.find(x => formatPeriodName(x.friendly_name) == period);
		if (period) period = [period].filter(classFilter);
	}

	// ETHSBell data to return

	const ethsbell = {
		periods,
		current: nowData,
		showing: period
	};

	// No period specified and no current period
	if (!period) return {
		ethsbell,
		data: []
	};

	// Get URL to fetch for spreadsheet
	const spreadsheetURL = `${SPREADSHEET_URL}${window.location.search}`

	// Fetch the data
	const spreadsheetRes = await fetch(spreadsheetURL).catch(e => null);

	let spreadsheetJson;

	if (spreadsheetRes && spreadsheetRes.ok) {
		try {
			spreadsheetJson = await spreadsheetRes.json();
		} catch (e) { }
	}

	// Error
	if (!spreadsheetJson) return {
		ethsbell,
		data: []
	};

	const periodNames = period.map(x => formatPeriodName(x.friendly_name));

	// Get this period only from the data and remove teachers without a period
	const thisPeriod = spreadsheetJson.map(x => ({
		name: x.name,
		data: periodNames.map(p => x[p]).find(x => x)
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

	if (data.ethsbell.current && data.ethsbell.showing) {
		document.getElementById('showing').innerHTML = 'Showing locations for<br>' + human_list(filterPeriodNames(data.ethsbell.showing.map(x => x.friendly_name)));
		document.getElementById('timeleft').innerHTML = data.ethsbell.current.map(x => `${x.friendly_name} ends in ${human_time_left(x.end, null, true)}`).join('<br>');
	} else if (data.ethsbell.current) {
		document.getElementById('showing').innerHTML = '';
		document.getElementById('timeleft').innerHTML = data.ethsbell.current.map(x => `${x.friendly_name} ends in ${human_time_left(x.end, null, true)}`).join('<br>');
	} else {
		document.getElementById('showing').innerHTML = '';
		document.getElementById('timeleft').innerHTML = '';
	}
}

// Update HTML for website
async function updateWebsiteHTML() {
	const dropdown = document.querySelector('#selectperiod select');

	const search = document.getElementById('search').value;

	selectedPeriod = dropdown && dropdown.value && dropdown.value !== 'Current Period' ? dropdown.value : 'now';

	const data = await fetchData(selectedPeriod); // Get data
	const html = getCellHTML(CLASS_HTML, data, search); // Get HTML from that data
	document.getElementById('main-body').innerHTML = html.join('\n'); // Add HTML to the body

	document.getElementById('date').innerHTML = leftText().date; // Set the date
	document.getElementById('time').innerHTML = leftText().time; // Set the time

	console.log(data);
	// Set period end time text if there is a period
	if (data.ethsbell.current) document.getElementById('timeleft').innerHTML = data.ethsbell.current.map(x => `${x.friendly_name} ends in ${human_time_left(x.end, null, true)}`).join('<br>');

	// Remove loading text and add in dropdown
	if (document.getElementById('showing').innerHTML == 'Loading data from ETHSBell...') {
		// Generate dropdown HTML
		const dropdown = dropdownWrapper.replace('{OPTIONS}', ['Current Period'].concat(filterPeriodNames(data.ethsbell.periods.map(x => x.friendly_name))).map(x => dropdownOptions
			.replace('{NAME}', x)
			.replace('{VALUE}', x)
			.replace('{DISABLED}', x == 'Current Period' ? 'disabled' : '')
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
