/*jshint -W054 */
/*

I'm working on decoding Albert's functions

-Asher

*/

//CONSTANTS


var PERIODS_PER_DAY = 10; //number of periods in a day, including early bird
var slotList = [
  "Early Bird",
  "1st Period",
  "2nd Period",
  "3rd Period",
  "4th Period",
  "5th Period",
  "6th Period",
  "7th Period",
  "8th Period",
  "9th Period",
  null //unsure, maybe bug protection?
]; //exactly what it sounds like
var weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
var sheetStart = 1;
var currentDay;

var DELAY = 15; //refresh delay in seconds

var ddHTML = '<span id="selectperiod"><select class="dropdown" onchange="reload();"><option value="p0">Early Bird</option><option value="p1">1st Period</option><option value="p2">2nd Period</option><option value="p3">3rd Period</option><option value="p4">4th Period</option><option value="p5">5th Period</option><option value="p6">6th Period</option><option value="p7">7th Period</option><option value="p8">8th Period</option><option value="p9">9th Period</option><option value="select">Select Period</option></select></span>';

// GLOBAL VARIABLES

var currentlyShowing, currentPeriod, timeLeft; //VERY IMPORTANT VARS, DO NOT TOUCH! Names tell you what they mean.


//QUICK SELECT

function sel(query) {
  return document.querySelector(query);
}

//DATE AND TIME
//functions
function numSuffix(i) { //finds the suffix for a given number, i.e. 1 -> 1st, 2 -> 2nd, 3 -> 3rd, 4 -> 4th, etc
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

function toBool(str) { //I feel like this can be removed with some spaghetti code later, but I'm not going to do it now.
  if (str == "TRUE") {
    return true;
  } else if (str == "FALSE") {
    return false;
  } else {
    return "Error";
  }
}

function twoDigit(i) { //returns numbers as double digits, used mostly to fix date text
  if (i.toString().length === 1) {
    return ('0' + i);
  } else {
    return i;
  }
}


//BEGIN BIG OLE' FUNCTION
//THAT'S NOT DISCRIPTIVE **AT ALL**
function reload() {

  var mocktime = getParameterByName("mock_time");
  var date;
  if (mocktime) {
    date = new Date(mocktime * 1000);
  } else {
    date = new Date();
  }
  //Fill left column
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var dayOfWeek = days[date.getDay()];
  currentDay = weekdays.indexOf(dayOfWeek) + 1; //For sheet selection
  var month = months[date.getMonth()];
  var day = date.getDate();
  var year = date.getFullYear();
  var hour = (date.getHours() > 12) ? date.getHours() - 12 : date.getHours();
  if (hour == 0) { //fixes java time beig weird
    hour = 12;
  }
  var period = (date.getHours() < 12) ? "AM" : "PM"; //finds out if it's the morning or the afternoon
  var minute = date.getMinutes();
  var fullDate = dayOfWeek + ', ' + month + ' ' + numSuffix(day);
  var fullTime = hour + ':' + twoDigit(minute) + " " + period;
  // \/  Return the dates \/
  sel('#date').innerHTML = fullDate;
  sel('#time').innerHTML = fullTime;
  get();
}
reload();
//ETHSBELL

function ajax(theUrl, callback, nextFunc) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      if (nextFunc) {
        callback(xmlHttp.responseText, nextFunc);
      } else {
        callback(xmlHttp.responseText);
      }
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.send(null);
}

function getParameterByName(name, url) { //parses URL for mock time query streams
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function get() { //there actual function that runs an HTTP GET request


  var mocktime = getParameterByName("mock_time");

  if (mocktime == null) {
    mocktime = "";
  } else {
    mocktime = "?mock_time=" + mocktime;
  }


  var bellUrl = "https://api.ethsbell.xyz/data/eths" + mocktime;

  ajax(bellUrl, function(data) {
    data = JSON.parse(data);

    currentPeriod = data.theSlot;
    timeLeft = data.timeLeftInPeriod;

    if (sel('#showing').innerHTML == 'Loading data from ETHSBell...') { //displays loading text
      sel('#showing').innerHTML = 'Showing locations for ' + ddHTML + '';
      sel('#selectperiod select').selectedIndex = slotList.indexOf(currentPeriod);
      if (currentPeriod == null || slotList.indexOf(currentPeriod) == -1) {
        sel('#selectperiod select').selectedIndex = 10;
      }
    }
    currentPeriod = slotList[sel('#selectperiod select').selectedIndex];
    //sel('#timeleft').innerHTML = currentPeriod + ' ends in ' + timeLeft + ' minutes.';

    ajax(sheetURL + (currentDay + sheetStart) + sheetUrlEnd, run, table);
    ajax(sheetURL + 8 + sheetUrlEnd, run, overrideCheck);

  });
}

function run(msg, runNext) {
  var datadiv = document.getElementById("data");
  var data = JSON.parse(msg);
  var responseObj = {};
  var rows = [];
  var columns = {};
  for (var i = 0; i < data.feed.entry.length; i++) {
    var entry = data.feed.entry[i];
    var keys = Object.keys(entry);
    var newRow = {};
    var queried = false;
    for (var j = 0; j < keys.length; j++) {
      var gsxCheck = keys[j].indexOf("gsx$");
      if (gsxCheck > -1) {
        var key = keys[j];
        var name = key.substring(4);
        var content = entry[key];
        var value = content.$t;
        queried = true;
        if (true && !isNaN(value)) {
          value = Number(value);
        }
        newRow[name] = value;
        if (queried === true) {
          if (!columns.hasOwnProperty(name)) {
            columns[name] = [];
            columns[name].push(value);
          } else {
            columns[name].push(value);
          }
        }
      }
    }
    if (queried === true) {
      rows.push(newRow);
    }
  }
  if (true) {
    responseObj.columns = columns;
  }
  if (true) {
    responseObj.rows = rows;
  }
  console.log(responseObj);
  runNext(responseObj);
}

var teacherArray = [];
var teacherData = {};

function table(data) { //converts raw data to arrays
  /*ajax(settingsUrl, function(json) {
    var override = JSON.parse(json).feed.entry[3].content.$t;
    if (override !== "") {
      var cellArray = document.querySelectorAll('.cell');
      for (var l = 0; l < cellArray.length; l++) {
        cellArray[l].querySelector('.icons .uniform').style.display = '';
        cellArray[l].querySelector('.icons .heart').style.display = '';
        cellArray[l].querySelector('.icons .laptop').style.display = '';
        cellArray[l].querySelector('.name').innerHTML = '';
        cellArray[l].querySelector('.location').innerHTML = '';
      }
      var overrideEl = document.getElementById('override');
      overrideEl.style.display = '';
      overrideEl.innerHTML = override;

    } else {*/
  //document.getElementById('override').style.display = 'none';
  var currentJson = [];
  var currentName;
  var currentArray = [];
  var current;
  data = data.rows;
  var teacherLength = data.length - 1;
  for (var k = 0; k < PERIODS_PER_DAY; k++) {
    teacherData[k] = [];
  }
  for (var i = 0; i <= teacherLength; i++) {
    current = {};
    currentArray = [];
    currentArray = Object.values(data[i]);
    teacherArray.push(currentArray);
    currentName = currentArray[0];
    currentJson = [];
    currentJson.push(currentName);
    for (var j = 0; j < PERIODS_PER_DAY; j++) {
      current = {};
      current.name = currentName;
      current.location = currentArray[4 * j + 1 + 0];
      current.uniform = toBool(currentArray[4 * j + 1 + 1]);
      current.heart = toBool(currentArray[4 * j + 1 + 2]);
      current.chromebook = toBool(currentArray[4 * j + 1 + 3]);
      teacherData[j].push(current);
    }
  }
  putData(teacherData);
  /*}
  });*/
}

function putData(data) { //turns arrays into HTML
  var periodArray = [];
  var periodNumber = slotList.indexOf(currentPeriod);


  var cellArray = document.querySelectorAll('.cell');
  for (var k = 0; k < cellArray.length; k++) {
    cellArray[k].querySelector('.icons .uniform').style.display = '';
    cellArray[k].querySelector('.icons .heart').style.display = '';
    cellArray[k].querySelector('.icons .laptop').style.display = '';
    cellArray[k].querySelector('.icons .noshirt').style.display = '';
    cellArray[k].querySelector('.icons .noshirt1').style.display = '';
    cellArray[k].querySelector('.icons .noshirt2').style.display = '';
    cellArray[k].querySelector('.name').innerHTML = '';
    cellArray[k].querySelector('.location').innerHTML = '';
  }
  if (periodNumber !== 10) {
    for (var i = 0; i < teacherData[periodNumber].length; i++) {
      if (teacherData[periodNumber][i].location !== "FALSE" && teacherData[periodNumber][i].location !== false && teacherData[periodNumber][i].location !== "0" && teacherData[periodNumber][i].location !== 0) {
        periodArray.push(teacherData[periodNumber][i]);
      }
    }
    for (var j = 0; j < periodArray.length; j++) {
      cellArray[j].querySelector('.icons .uniform').style.display = '';
      cellArray[j].querySelector('.icons .heart').style.display = '';
      cellArray[j].querySelector('.icons .laptop').style.display = '';
      cellArray[j].querySelector('.icons .noshirt').style.display = '';
      cellArray[j].querySelector('.icons .noshirt1').style.display = '';
      cellArray[j].querySelector('.icons .noshirt2').style.display = '';
      cellArray[j].querySelector('.name').innerHTML = periodArray[j].name;
      if (periodArray[j].location == 0) {
        cellArray[j].querySelector('.location').innerHTML = 'No location specified';
        cellArray[j].style.display = 'none';

      } else {
        cellArray[j].style.display = '';
        cellArray[j].querySelector('.location').innerHTML = periodArray[j].location;
      }
      if (!periodArray[j].uniform) {
        cellArray[j].querySelector('.icons .uniform').style.display = 'inline';
        cellArray[j].querySelector('.icons .noshirt').style.display = 'none';
      } else {
        cellArray[j].querySelector('.icons .noshirt').style.display = 'inline-block';
        cellArray[j].querySelector('.icons .noshirt1').style.display = 'inline';
        cellArray[j].querySelector('.icons .noshirt2').style.display = 'inline';
      }
      if (periodArray[j].heart) {
        cellArray[j].querySelector('.icons .heart').style.display = 'inline';
      }
      if (periodArray[j].chromebook) {
        cellArray[j].querySelector('.icons .laptop').style.display = 'inline';
      }
    }
  }
}

function search() {
  var cellArray = document.querySelectorAll('.cell');
  for (var k = 0; k < cellArray.length; k++) {
    if (sel('#search').value == '' || cellArray[k].querySelector('.name').innerHTML.toLowerCase().search(sel('#search').value.toLowerCase()) !== -1 || cellArray[k].querySelector('.location').innerHTML.toLowerCase().search(sel('#search').value.toLowerCase()) !== -1) {
      cellArray[k].style.display = "inline-block";
    } else {
      cellArray[k].style.display = "none";
    }
  }
}

function overrideCheck(data) {

  if (data.columns._cpzh4[1] == null || data.columns._cpzh4[1] == "-") {
    console.log("no override");
    sel("#main-body").style.display = "block";
    sel("#overRide").style.display = "none";
  } else {
    console.log('there is an override');
    var currentOverride = data.columns._cpzh4[1];
    console.log(currentOverride);
    sel("#main-body").style.display = "none";
    sel("#overRideP").innerHTML = data.columns._cpzh4[1];
    sel("#overRide").style.display = "block";
  }
}


var sheetURL =
  "https://spreadsheets.google.com/feeds/list/1T-HUAINDX69-UYUHhOO1jVjZ_Aq0Zqi1z08my0KHzqU/";
var sheetUrlEnd = "/public/values?alt=json";

var settingsUrl = "https://spreadsheets.google.com/feeds/cells/1T-HUAINDX69-UYUHhOO1jVjZ_Aq0Zqi1z08my0KHzqU/3/public/values?alt=json";
var settingsQueries = { //NOT USED
  override: "data.feed.entry[3].content.$t"
};
//Reload interval

var interval = setInterval(reload, DELAY * 1000); //reloads the page after a delay
