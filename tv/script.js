//CONSTANTS

var PERIODS_PER_DAY = 10;
var slotList = ["Early Bird", "1st Period", "2nd Period", "3rd Period", "4th Period", "5th Period", "6th Period", "7th Period", "8th Period", "9th Period"];
var DELAY = 15;

var weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
var sheetStart = 1;
var currentDay;
var dayOfWeek;
var periodNumberDebug;

// GLOBAL VARIABLES

var currentlyShowing, currentPeriod, timeLeft;


//QUICK SELECT

function sel(query) {
  return document.querySelector(query);
}

//DATE AND TIME
//functions
function numSuffix(i) {
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

function toBool(str) {
  if (str == "TRUE") {
    return true;
  } else if (str == "FALSE") {
    return false;
  } else {
    return "Error";
  }
}

function twoDigit(i) {
  if (i.toString().length === 1) {
    return ('0' + i);
  } else {
    return i;
  }
}


//BEGIN BIG OLE' FUNCTION
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
  dayOfWeek = days[date.getDay()];
  currentDay = weekdays.indexOf(dayOfWeek) + 1; //For sheet selection
  var month = months[date.getMonth()];
  var day = date.getDate();
  var year = date.getFullYear();
  var hour = (date.getHours() > 12) ? date.getHours() - 12 : date.getHours();
  if (hour == 0) {
    hour = 12;
  }
  var period = (date.getHours() < 12) ? "AM" : "PM";
  var minute = date.getMinutes();
  var fullDate = dayOfWeek + ', ' + month + ' ' + numSuffix(day);
  var fullTime = hour + ':' + twoDigit(minute) + " " + period;

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

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function get() {


  var mocktime = getParameterByName("mock_time");

  if (mocktime == null) {
    mocktime = "";
  } else {
    mocktime = "?mock_time=" + mocktime;
  }


  var bellUrl = "https://api.ethsbell.xyz/data/eths" + mocktime;

  ajax(bellUrl, function(data) {
    data = JSON.parse(data);
    var d;
    currentPeriod = data.theSlot;
    realCurrent = currentPeriod;
    timeLeft = data.timeLeftInPeriod;
    if (currentPeriod == 'AM Support') {
      currentPeriod = '1st Period';
    }
    if (timeLeft <= 5 && timeLeft !== 0 && currentPeriod !== 'AM Support') {
      var next = data.theNextSlot;
      console.log(next);
      if (next !== "Early Bird") {
        currentPeriod = next;

        for (d = 0; d < document.querySelectorAll('.locker').length; d++) {
          document.querySelectorAll('.locker')[d].style.display = 'block';
        }
      } else {
        for (d = 0; d < document.querySelectorAll('.locker').length; d++) {
          document.querySelectorAll('.locker')[d].style.display = 'none';
        }
      }
    }

    if (currentPeriod == null) {
      sel('#showing').innerHTML = '';
    } else {
      sel('#showing').innerHTML = 'Showing locations for ' + currentPeriod + '.';
      sel('#timeleft').innerHTML = realCurrent + ' ends in ' + timeLeft + ' minutes.';
    }

    var lockerRoom = data.timeSinceLastPeriod;
    if (timeLeft > 20) {
      sel('#lockers').innerHTML = 'Locker rooms close in <b><u>' + (timeLeft - 20) + '</u></b> minutes.';
    } else if (timeLeft < 6) {
      sel('#lockers').innerHTML = 'Locker rooms are open.';
    } else {
      sel('#lockers').innerHTML = 'Locker rooms are closed.';
    }

    ajax(sheetURL + (currentDay + sheetStart) + sheetUrlEnd, run, table);
    ajax(sheetURL + 8 + sheetUrlEnd, run, overrideCheck);
  });
}
//
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
  runNext(responseObj);
}

var teacherArray = [];
var teacherData = {};

function table(data) {
  teacherArray = [];
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
}

var cellArray;
var periodArray;

function putData(data) {

  cellArray = document.querySelectorAll('.cell');
  for (var k = 0; k < cellArray.length; k++) {
    cellArray = document.querySelectorAll('.cell');
    cellArray[k].querySelector('.icons .uniform').style.display = '';
    cellArray[k].querySelector('.icons .heart').style.display = '';
    cellArray[k].querySelector('.icons .laptop').style.display = '';
    cellArray[k].querySelector('.icons .noshirt').style.display = '';
    cellArray[k].querySelector('.icons .noshirt1').style.display = '';
    cellArray[k].querySelector('.icons .noshirt2').style.display = '';
    cellArray[k].querySelector('.name').innerHTML = '';
    cellArray[k].querySelector('.location').innerHTML = '';
  }
  if (currentPeriod != null) {
    
    var periodNumber;
    periodArray = [];
    for (var i = 0; i < slotList.length; i++) {
      if (currentPeriod.indexOf(slotList[i]) === 0) {
        periodNumber = i;
        break;
      }
    }
    periodNumberDebug = periodNumber;
    //var periodNumber = slotList.indexOf(currentPeriod);
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
      cellArray[j].querySelector('.name').innerHTML = '';
      cellArray[j].querySelector('.location').innerHTML = '';

      cellArray[j].querySelector('.name').innerHTML = periodArray[j].name;
      if (periodArray[j].location == "") {
        cellArray[j].querySelector('.location').innerHTML = 'No location specified';
      } else {
        cellArray[j].querySelector('.location').innerHTML = periodArray[j].location;
      }
      if (!periodArray[j].uniform) {
        cellArray[j].querySelector('.icons .uniform').style.display = 'inline';
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

function overrideCheck(data) {
  if (data.columns._cpzh4[1] == null || data.columns._cpzh4[1] == "-") {
    console.log("no override");
    sel("#main-body").style.display = "block";
    sel("#overRide").style.display = "none";
  } else {
    console.log('there is an override');
    sel("#main-body").style.display = "none";
    sel("#overRideP").innerHTML = data.columns._cpzh4[1];
    sel("#overRide").style.display = "block";
  }
}

var sheetURL =
  "https://spreadsheets.google.com/feeds/list/1T-HUAINDX69-UYUHhOO1jVjZ_Aq0Zqi1z08my0KHzqU/";
var sheetUrlEnd = "/public/values?alt=json";

//Reload interval

var interval = setInterval(reload, DELAY * 1000);
