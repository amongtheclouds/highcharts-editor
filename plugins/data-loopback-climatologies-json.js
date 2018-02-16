/*

    Copyright (c) 2017, GMRI

    Licensed under the MIT license.

*/

highed.plugins.import.install('LoopbackClimatologies',  {
    description: 'Climate data. <a href="http://www.neracoos.org/erddap/" target="_blank">http://www.neracoos.org/erddap/</a>',
    treatAs: 'json',
    fetchAs: 'text/html',
    proxy: "http://www.neracoos.org/proxy2?ajax=1&url=",
    fisrtColumn: "Timestamp",
    defaultURL: 'http://www.neracoos.org/static/ncdc_cache/upswell/UPSWELL_GOM_sst_daily_clim_1982_2011.json',
    options: {
        includeFields: {
            type: 'string',
            label: 'User added information',
            default: 'STDLow STDHigh STD MEDIAN MEAN MIN MIN_YEAR MAX MAX_YEAR LOWERQUARTILE UPPERQUARTILE'                           
        },
        xAxisColumn: {
            type: 'int',
            label: 'xAxis column name and type separated by a comma',
            default: 'DOY,Day of Year'                           
        }
    },
    filter: function (data, options, fn) {

        options.includeFields = highed.arrToObj(options.includeFields.split(' '));

        var use_min_max = false;
        var data_parsed = JSON.parse(data) ;
        var chart_options = {} ;
        chart_options.series = [] ;
        var yAxis = [] ;
        var yAxisCount = 0 ;
        var toggle_opposite = false ; // a yAxis toggle for the side of the chart.
        var clim_freq = 'dc';
        var doy_clim_tickPositions =  [1, 32, 61, 92, 122, 153, 183, 214, 245, 275, 306, 336];
        gmriHelper.initialize();
        
                // create a series for the various data and types
        /////////////////
        // STD
        var series = {} ;
        series.data = [] ;
        // I think 'STD' is ignored here in the arearange type plot!
        series.columns = ['DOY', 'STDLow', 'STDHigh', 'STD'] ;
        series.name = "SST Standard Deviation" ;
        // series.yAxis = yAxisCount ;
        // series.type = "errorbar" ; // disappears from legend for some reason
        series.type = "arearange" ;
        chart_options.series.push(series) ;
        // add a yAxis
        yAxisCount ++ ;
        // yAxis is added later as an array to the series.
        var new_title3 = {} ;
        new_title3.text = 'STD'  ;
        var new_label3 = {} ;
        new_label3.format = '{value}' + ' °C';
        yAxis.push( {
          title: new_title3,
          labels: new_label3,
          opposite: toggle_opposite
        })
        toggle_opposite = !toggle_opposite;
        /////////////////
        // BOXPLOT
        var series = {} ;
        series.data = [] ;
        series.columns = ['DOY', 'MIN', 'LOWERQUARTILE', 'MEDIAN', 'UPPERQUARTILE', 'MAX'] ;
        series.name = "Box Plot" ;
        series.type = "boxplot" ;
        //series.yAxis = yAxisCount ;
        chart_options.series.push(series) ;
        // add a yAxis
        yAxisCount ++ ;
        // yAxis is added later as an array to the series.
        var new_title3 = {} ;
        new_title3.text = 'BOXPLOT'  ;
        var new_label3 = {} ;
        new_label3.format = '{value}' + ' °C';
        yAxis.push( {
          title: new_title3,
          labels: new_label3,
          opposite: toggle_opposite
        })
        toggle_opposite = !toggle_opposite;
        /////////////////
        // Median
        var series = {} ;
        series.name = 'MEDIAN' ;
        series.data = [] ;
        series.columns = ['DOY', 'MEDIAN'] ;
        chart_options.series.push(series) ;
        // add a yAxis
        yAxisCount ++ ;
        // yAxis is added later as an array to the series.
        var new_title3 = {} ;
        new_title3.text = 'MEDIAN'  ;
        var new_label3 = {} ;
        new_label3.format = '{value}' + ' °C';
        yAxis.push( {
          title: new_title3,
          labels: new_label3,
          opposite: toggle_opposite
        })
        toggle_opposite = !toggle_opposite;
        /////////////////
        // Mean
        var series = {} ;
        series.name = 'MEAN' ;
        series.data = [] ;
        series.columns = ['DOY', 'MEAN'] ;
        chart_options.series.push(series) ;
        // add a yAxis
        yAxisCount ++ ;
        // yAxis is added later as an array to the series.
        var new_title3 = {} ;
        new_title3.text = 'MEAN'  ;
        var new_label3 = {} ;
        new_label3.format = '{value}' + ' °C';
        yAxis.push( {
          title: new_title3,
          labels: new_label3,
          opposite: toggle_opposite
        })
        toggle_opposite = !toggle_opposite;
        /////////////////
        // MIN MAX
        var series = {} ;
        series.data = [] ;
        series.columns = ['DOY', 'MIN', 'MAX'] ;
        series.name = "SST Min Max Range" ;
        series.type = "arearange" ;
        chart_options.series.push(series) ;
        // add a yAxis
        yAxisCount ++ ;
        // yAxis is added later as an array to the series.
        var new_title3 = {} ;
        new_title3.text = 'MIN/MAX'  ;
        var new_label3 = {} ;
        new_label3.format = '{value}' + ' °C';
        yAxis.push( {
          title: new_title3,
          labels: new_label3,
          opposite: toggle_opposite
        })
        toggle_opposite = !toggle_opposite;
        
        
        // Fill in the data for those series by looping through the data
        for ( var dKey in data_parsed.data) {
          for ( var sKey in chart_options.series ) {
            // for each of the series just setup use their column array
            // to index into the data
            var data_point = [] ;
            // use the column names from the array just setup
            // to get the column number from the metadata in the data ('Columns')
            // and index into the data array
            for ( cKey in  chart_options.series[sKey].columns) {
              data_point.push(data_parsed.data[dKey][data_parsed.Columns[0][chart_options.series[sKey].columns[cKey]].column]) ;
            }
            chart_options.series[sKey].data.push(data_point)
            }
          }
        chart_options.xAxis = {
          type: 'linear',
          tickWidth: 0,
          lineWidth: 0,
          gridLineWidth: 1,
          // Monthly
          tickPositions: doy_clim_tickPositions,
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
                  var low = gmriHelper.roundNumber(point.point.low, 2);
                  var high = gmriHelper.roundNumber(point.point.high, 2);
                  s += '<br/>' + point.series.name + ': ' +
                  range.toFixed(2) + ' °C' + " : " + low + " °C to " + high + ' °C';;
                  break;
                case 'SST Standard Deviation':
                  var low = gmriHelper.roundNumber(point.point.low, 2);
                  var high = gmriHelper.roundNumber(point.point.high, 2);
                  // NOTE: This only works because point.x is the doy 1 - 366.
                  // is there a way to find the actual index in the data?
                  var std = gmriHelper.roundNumber(point.series.options.data[point.x - 1][3], 2);
                  std = gmriHelper.roundNumber(std, 4);
                  s += "<br/> STD: " + std + " Range: " + low + " °C to " + high + ' °C';
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
                  s += "<br/>Upper quartile: " + Upperquartile + ' °C' ;
                  s += "<br/>Median: " + Median + ' °C' ;
                  s += "<br/>Lower quartile: " + Lowerquartile + ' °C' ;
                  // s += "<br/><&nbps>Minimum: " + Minimum ;
                  break;
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
        chart_options.yAxis = yAxis ;
        var title = data_parsed.region + " " + data_parsed.clim_year_start +
               " to " + data_parsed.clim_year_end + " Climatologies" ;
        chart_options.title = {text: title } ;
        // use the initial part of the url as teh subtitle.
        var search_text = 'http://www.neracoos.org/static/ncdc_cache/' ;
        var qs_index = options.url.indexOf('?') ;
        var subtitle = data_parsed.dataset_name + " dataset" ;
        //              "Source: " + options.url.substr(search_text.length) + "..." ;
        chart_options.subtitle = {text: subtitle} ;
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

