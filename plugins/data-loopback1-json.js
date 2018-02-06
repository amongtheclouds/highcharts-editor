/*

    Copyright (c) 2017, GMRI

    Licensed under the MIT license.

*/

highed.plugins.import.install('LoopbackTest1',  {
    description: 'Loop Back. <a href="http://13.90.147.70/explorer" target="_blank">http://13.90.147.70/explorer</a>',
    treatAs: 'json',
    fetchAs: 'text/html',
    // proxy: "http://www.neracoos.org/proxy2?ajax=1&url=",
    fisrtColumn: "Timestamp",
    defaultURL: 'http://13.90.147.70/api/data?filter=%7B%22limit%22%3A1000%7D',
    options: {
        includeFields: {
            type: 'string',
            label: 'User added information',
            default: 'temp precip'                           
        },
        firstColumn: {
            type: 'string',
            label: 'date',
            default: 'Loopback Timestamp'                           
        }
    },
    filter: function (data, options, fn) {

        options.includeFields = highed.arrToObj(options.includeFields.split(' '));

        var data_parsed = JSON.parse(data) ;
        var chart_options = {} ;
        var copy_hc_colors = ["#7cb5ec", "#434348", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"] ;
        var color_count = 0 ;
        chart_options.series = [] ;
        var series_array = [] ;
        var series_index = 0 ;
        var yAxis = [] ;
        var yAxisCount = 0 ;
        var toggle_opposite = false ; // a yAxis toggle for the side of the chart.
        // first without min max which we'll put together
        // for an area range.
          //Only include things we're interested in
          var rdata = [] ;
          // create a series (line) for each field.
          for ( var fKey in options.includeFields ) {
            var series = {} ;
            switch ( fKey ) {
              case 'temp':
                series.type = "spline" ;
                series.color = copy_hc_colors[color_count]  ;
                break;
              case 'precip':
                series.type = "column" ;            
                series.color = "#CC201D";
                series.negativeColor = "#2432DD";
                break;
              default:
                break;
            }
            series.name = fKey ;
            if ( options.firstColumn.indexOf("Loopback Timestamp") == 0 ) {
              series.data = [] ;
              // loop through all the data
              for ( var dKey in data_parsed ) {
                var new_data_point = [] ;
                var new_date = new Date(data_parsed[dKey][this.options.firstColumn.label]);
                var utcMilliseconds = new_date.valueOf();
                new_data_point.push(utcMilliseconds);
                if ( 0 ) {
                  var new_date_isoString = data_parsed[dKey][this.options.firstColumn.label];
                  // "1985-09-08T00:00:00.000Z"
                  var rdt_temp = new_date_isoString.substr(0,4) + "-" + new_date_isoString.substr(5,2) +
                    "-" + new_date_isoString.substr(8,2) + "T" +
                    new_date_isoString.substr(11, 8) + "Z" ;
                    // var resultdatems = Date.parse(rdt_temp);
                  new_data_point.push(rdt_temp);
                }
                new_data_point.push(data_parsed[dKey][fKey]) ;
                series.data.push( new_data_point);
              }
            } else {
              // 2018-02-03T19:35:49.199Z
              series.data = data_parsed[fKey].data ;
              // value suffix object
              let vs_object = {shared: true, crosshairs: true};
              vs_object.xDateFormat = '%A %m-%d-%Y %I:%M %p' ;
              vs_object.pointFormatter = function () {
                return (this.y + ' c')
              }
              series.tooltip = vs_object ;
            }
            series_array.push(series) ;
            // yAxis is added later as an array to the series.
            var new_title3 = {} ;
            new_title3.text = fKey  ;
            new_title3.style = {color: copy_hc_colors[color_count] };
            var new_label3 = {} ;
            // new_label3.format = '{value} ' + data_parsed.table.columnUnits[columnKeys[fKey]] ;
            new_label3.format = '{value} ';
            new_label3.style = {color: copy_hc_colors[color_count] };
            yAxis.push( {
              gridLineWidth: 0,
              title: new_title3,
              labels: new_label3,
              opposite: toggle_opposite
            })
            toggle_opposite = !toggle_opposite;
            series_array[series_index].yAxis = yAxisCount ;
            yAxisCount ++;
            series_index++;
            color_count ++ ;
            if ( color_count >= copy_hc_colors.length ) {
              color_count = 0 ;
            }
          }
        chart_options.tooltip = {
         formatter: function () {
          var pDate = new Date(this.x);
          var sDate = pDate.toDateString();
          var s = '<b>' + sDate + '</b>';
          for ( var tpKey in this.points ) {
            var point = this.points[tpKey];
            switch ( point.series.name ) {
              case 'precip':
                s += '<br/>' + point.series.name + ': ' +
                point.y.toFixed(2) + ' in';
                break;
              case 'temp':
              default:
                s += '<br/>' + point.series.name + ': ' +
                point.y.toFixed(2) + ' °C';
                break;
            }
          }
          return s;
         },
          shared: true,
          crosshairs: true
        };
        chart_options.yAxis = yAxis;
        chart_options.series = series_array ;
        chart_options.xAxis =  {
          type: 'datetime',
          isDirty: true,
          labels: {
              style: {
                  fontFamily: 'Tahoma'
              },
              rotation: -45
          }
        }
        chart_options.title = {text: "LoopbackTest1"} ;
        chart_options.subtitle = {text: "Source: " + options.url} ;
        fn(false, chart_options);
    }
});

var gmriHelper = {

  daily_ticks : [],
  monthly_ticks : [],
  month_days: [],

  initialize: function () {    
    this.month_days = [31,29,31,30,31,30,31,31,30,31,30,31];
    this.monthly_ticks = [
     [1, "Jan"],
     [2, "Feb"],
     [3, "Mar"],
     [4, "Apr"],
     [5, "May"],
     [6, "Jun"],
     [7, "Jul"],
     [8, "Aug"],
     [9, "Sep"],
     [10, "Oct"],
     [11, "Nov"],
     [12, "Dec"]
    ];
    this.daily_ticks = [
     [1, "Jan"],
     [32, "Feb"],
     [61, "Mar"],
     [92, "Apr"],
     [122, "May"],
     [153, "Jun"],
     [183, "Jul"],
     [214, "Aug"],
     [245, "Sep"],
     [275, "Oct"],
     [306, "Nov"],
     [336, "Dec"]
   ];
  },
  monthString : function (i, clim_freq) {
    if(clim_freq === 'mc'){
      return (this.monthly_ticks[i-1][1]);
    }
    if(clim_freq === 'dc'){
      return(this.monthStringFromDay(i));
    }
  },
  monthStringFromDay: function (day_num){
    var total_month_days = 0;
    for(var j = 0; j <= 11;  j++){
      var day1 = this.daily_ticks[j][0];
      var day2;
      if(j == 11){
        day2 = 367;
      } else {
        day2 = this.daily_ticks[j+1][0];
      }
      //alert(day1 + ' ' + day2);
      if(day_num >= day1 && day_num < day2){
        //alert(day_num + ' ' + daily_ticks[j][1] + ' ' + total_month_days);
        total_month_days = day_num - total_month_days;
        return this.daily_ticks[j][1] + ', ' + total_month_days;
      } else {
        total_month_days += this.month_days[j];
      }
    }
    return '';
  },
  isLeapYear: function (inDate){
    var year = inDate.getFullYear();
    if((year & 3) != 0) return false;
    return ((year % 100) != 0 || (year % 400) == 0);
  },

  // Get Day of Year
  getDOY: function (inDate) {
      var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      var mn = inDate.getMonth();
      var dn = inDate.getDate();
      var dayOfYear = dayCount[mn] + dn;
      if(mn > 1 && this.isLeapYear(inDate)) dayOfYear++;
      return dayOfYear;
  },
  roundNumber: function (num, dec) {
   var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
   return result;
  }
  
}

