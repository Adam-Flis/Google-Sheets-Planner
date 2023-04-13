function onOpen(e) {
  menuBar();
  updateSheet();
}

function onEdit(e) {
  updateSheet();
}

function msToHr(ms) {
  return ms/3600000;
}

function menuBar() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Functions")
    .addItem("Refresh", "updateSheet")
    .addItem("Add New Assignment", "addAssignmentUI")
    .addToUi();
}

function addAssignmentUI() {
  var html = HtmlService.createHtmlOutputFromFile("addAssignmentUI");
  SpreadsheetApp.getUi().showModalDialog(html, "Add New Assignment");
}

function getClassNames() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var values = sheet.getRange("A1:A").getValues();
  return values;
}

function addAssignment(classV, typeV, nameV, dateV, timeV) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var rows = sheet.getRange("A1:A").getValues();
  var rangeLow = 0;
  var rangeHigh = 0;
  // Testing
  // dateV = "2022-09-30";
  // timeV = "11:30";
  // classV = "ENR 2100";
  // typeV = "Homework";
  // nameV = "hjhgjkaghjk";

  // Find low range
  for (var i = 0; rows.length > i && rangeLow == 0; i++) {
    if (rows[i].toString() == classV) {
      rangeLow = i + 1;
    }
  }

  // Find high range
  subRows = sheet.getRange("A"+rangeLow+":A").getValues();
  for (var i = 1; subRows.length > i && rangeHigh == 0; i++) {
    if (subRows[i] != "") {
      rangeHigh = rangeLow + i - 1;
    }
  }

  if (rangeHigh == 0) {
    rangeHigh = rows.length;
  }

  console.log("Low: " + rangeLow + "\nHigh: " + rangeHigh);

  // Build date
  var year = dateV.substring(0, 4);
  var month = dateV.substring(5, 7);
  var day = dateV.substring(8, 10);
  var hour = timeV.substring(0, 2);
  var min = timeV.substring(3, 5);
  var inDate = new Date(month + " " + day + ", " + year + " " + hour + ":" + min + ":00");

  // Build row values
  var values = [];
  values.push(["", "", typeV, nameV, inDate]);

  // Determine where to place the row
  var dates = sheet.getRange("E"+rangeLow+":E"+rangeHigh).getValues();
  for (i = rangeLow; i <= rangeHigh; i++) {
    var date = new Date(dates[i - rangeLow]);
    if (inDate.getTime() < date.getTime()) {
      sheet.insertRowBefore(i);
      sheet.getRange("A"+ i +":E"+ i).setValues(values);
      sheet.getRange("B" + i).setBackground("#ffffff");
      i = rangeHigh + 1;
    } 
    else if (i == rangeHigh) {
      sheet.insertRowAfter(rangeHigh);
      sheet.getRange("A"+(rangeHigh+1)+":E"+(rangeHigh+1)).setValues(values);
    }
  }
  updateSheet();
}

function updateSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var dates = sheet.getRange("E1:E").getValues();
  var tF = sheet.getRange("B1:B").getValues();

  var today = new Date();
  var todayTime = msToHr(today.getTime());

  // Sets background color of date
  for (var i = 0; dates.length > i; i++) {
    var range = ("E"+(i+1));
    var date = new Date(dates[i]);
    if (date != "Invalid Date") {
      var dateTime = msToHr(date.getTime());
      var diff = dateTime - todayTime;
      //console.log(range + ": " + diff);
      if (diff <= 0) {  // Past
        if(tF[i].toString() == "true") { // True
          sheet.getRange(range).setBackground("#90ee90");
        }
        else {
          sheet.getRange(range).setBackground("#d35df5");
        }
      }
      else if (tF[i].toString() == "true") {
          sheet.getRange(range).setBackground("#00ffbf");
      }
      else if (diff <= 24) { // Due in 24 hrs
          sheet.getRange(range).setBackground("#ff5e61");
      }
      else if (diff <= 48) { // Due in 48 hrs
          sheet.getRange(range).setBackground("#fbeb4d");
      }
      else {
        sheet.getRange(range).setBackground("#ffffff");
      }
    }
  }
}
