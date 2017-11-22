/*

    Copyright (c) 2017, GMRI

    Licensed under the MIT license.

*/

highed.plugins.import.install('Climatologies',  {
    description: 'Climate data. <a href="http://www.neracoos.org/erddap/" target="_blank">http://www.neracoos.org/erddap/</a>',
    treatAs: 'json',
    fetchAs: 'text/html',
    proxy: "http://www.neracoos.org/proxy2?ajax=1&url=",
    fisrtColumn: "Timestamp",
    defaultURL: 'http://www.neracoos.org/static/ncdc_cache/NESHELF_sst_daily_clim_1982_2011.json',
    options: {
        includeFields: {
            type: 'string',
            label: 'User added information',
            default: 'MEDIAN MEAN MIN MAX STD BOXPLOT'                           
        }
    },
    filter: function (data, options, fn) {

        options.includeFields = highed.arrToObj(options.includeFields.split(' '));

        var use_min_max = false;
        var data_parsed = JSON.parse(data) ;
        var chart_options = {} ;
        chart_options.series = [] ;
        var yAxis = [] ;
        var toggle_opposite = false ; // a yAxis toggle for the side of the chart.
        var clim_freq = 'dc';
        gmriHelper.initialize();
        
        // first without min max which we'll put together
        // for an area range.
          var bAddYAxis = false ;
          for ( var fKey in options.includeFields ) {
            bAddYAxis = false ;
            var parameter_units = data_parsed[fKey].units ;
            switch ( fKey ) {
              case 'STD':
                var series = {} ;
                series.data = data_parsed[fKey].data ;
                series.name = "SST Standard Deviation" ;
                // series.type = "errorbar" ; // disappears from legend for some reason
                series.type = "arearange" ;
                chart_options.series.push(series) ;
                // value suffix object
                var vs_object = {shared: true, crosshairs: true};
                vs_object.pointFormatter = function () {
                  return (this.series.options.name + " " + 
                    data_parsed['STD'].data[this.x -1 ][3] + " Range: " +
                    this.low + " - " + this.high + " " + parameter_units + "<br/>")
                }
                series.tooltip = vs_object ;
                //chart_options.tooltip = vs_object;
                bAddYAxis = true ;
                break;
              case 'BOXPLOT':
                var series = {} ;
                series.data = data_parsed[fKey].data ;
                series.name = "Box Plot" ;
                series.type = "boxplot" ;
                chart_options.series.push(series) ;
                // value suffix object
                var vs_object = {shared: true, crosshairs: true};
                vs_object.pointFormatter = function () {
                  return (this.series.options.name + " " + this.y + parameter_units  + "<br/>")
                }
                vs_object.Formatter = function () {
                  return (this.series.options.name + " " + this.y + parameter_units  + "<br/>")
                  gmriHelper.monthStringFromDay(this.x)
                }
                // series.tooltip = vs_object ;
                //chart_options.tooltip = vs_object;
                bAddYAxis = true ;
                break;
              case 'MIN':
              case 'MAX':
                use_min_max = true ;
                break;
              case 'MEDIAN':
              case 'MEAN':
              default:
                var series = {} ;
                series.name = fKey ;
                series.data = data_parsed[fKey].data ;
                chart_options.series.push(series) ;
                // value suffix object
                var vs_object = {shared: true, crosshairs: true};
                vs_object.pointFormatter = function () {
                  return (this.series.options.name + " " + this.y + parameter_units  + "<br/>")
                }
                // series.tooltip = vs_object ;
                //chart_options.tooltip = vs_object;
                bAddYAxis = true ;
                break;
            }
            if ( bAddYAxis ){
              // yAxis is added later as an array to the series.
              var new_title3 = {} ;
              new_title3.text = fKey  ;
              var new_label3 = {} ;
              new_label3.format = '{value}';
              yAxis.push( {
                title: new_title3,
                labels: new_label3,
                opposite: toggle_opposite
              })
              toggle_opposite = !toggle_opposite;
            }
          }
          // now merge MIN & MAX into one series
          if ( use_min_max ) {
            // to create an arearange
            ar_series = {}
            ar_series.name = "SST Min Max Range" ;
            ar_series.type = "arearange" ;
            var ar_data = [] ;
            for ( mKey in data_parsed['MIN'].data ) {
              var ar_point = [] ;
              ar_point.push(data_parsed['MIN'].data[mKey][0]) ;
              ar_point.push(data_parsed['MIN'].data[mKey][1]) ;
              ar_data.push(ar_point) ;
            }
            for ( xKey in data_parsed['MAX'].data ) {
              ar_data[xKey].push(data_parsed['MAX'].data[xKey][1]) ;
            }
            ar_series.data = ar_data ;
            chart_options.series.push(ar_series) ;
            // value suffix object
            var vs_object = {shared: true, crosshairs: true};
            vs_object.pointFormatter = function () {
              return (this.series.options.name + " " + this.y + parameter_units  + "<br/>")
            }
            vs_object.pointFormatter = function () {
              return (this.series.options.name + " " + " Range: " +
                this.low + " - " + this.high + " " + parameter_units + "<br/>")
            }
            // series.tooltip = vs_object ;
            //chart_options.tooltip = vs_object;
          }
        chart_options.xAxis = {
          type: 'linear',
          tickWidth: 0,
          lineWidth: 0,
          gridLineWidth: 1,
          // Monthly
          tickPositions: this.doy_clim_tickPositions,
          labels: {
            //formatter: function () {return monthStringFromDay(this.value);},
            formatter: function () {
             var month_day = gmriHelper.monthString(this.value, clim_freq);
             var splits = month_day.split(',');
             return splits[0];
            },
            align: 'left',
            style: {
             color: 'black'
            },
            x: 3,
            y: -3
          }
        };
          chart_options.tooltip = {
           formatter: function () {
            var s = '<b>' + gmriHelper.monthStringFromDay(this.x) + '</b>';
            for ( var tpKey in this.points ) {
              var point = this.points[tpKey];
              switch ( point.series.name ) {
                case 'SST Min Max Range':
                  var range = point.point.high - point.point.low ;
                  s += '<br/>' + point.series.name + ': ' +
                  range.toFixed(2) + '°C' + " : " + low + "°C to " + high + '°C';;
                  break;
                case 'SST Standard Deviation':
                  var low = gmriHelper.roundNumber(data_parsed['STD'].data[this.x -1 ][1], 2);
                  var high = gmriHelper.roundNumber(data_parsed['STD'].data[this.x -1 ][2], 2);
                  var std = data_parsed['STD'].data[this.x -1 ][3]
                  std = gmriHelper.roundNumber(std, 4);
                  s += "<br/> STD: " + std + " Range: " + low + "°C to " + high + '°C';
                  break;
                case 'Box Plot':
                  var Maximum = gmriHelper.roundNumber(point.series.options.data[point.x - 1][5], 2);
                  var Upperquartile = gmriHelper.roundNumber(point.series.options.data[point.x - 1][4], 2);
                  var Median = gmriHelper.roundNumber(point.series.options.data[point.x - 1][3], 2);
                  var Lowerquartile = gmriHelper.roundNumber(point.series.options.data[point.x - 1][2], 2);
                  var Minimum = gmriHelper.roundNumber(point.series.options.data[point.x - 1][1], 2);
                  // s += '<br/>' + point.series.name + ': ' ;
                  // already have Maximum and Minimum.
                  // s += "<br/><&nbps>Maximum: " + Maximum ;
                  s += "<br/>Upper quartile: " + Upperquartile + '°C' ;
                  s += "<br/>Median: " + Median + '°C' ;
                  s += "<br/>Lower quartile: " + Lowerquartile + '°C' ;
                  // s += "<br/><&nbps>Minimum: " + Minimum ;
                  break;
                default:
                  s += '<br/>' + point.series.name + ': ' +
                  point.y.toFixed(2) + '°C';
                  break;
              }
            }
            return s;
           },
            shared: true,
            crosshairs: true
          };
        chart_options.yAxis = yAxis ;
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

