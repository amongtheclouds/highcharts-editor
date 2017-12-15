/*

    Copyright (c) 2017, GMRI

    Licensed under the MIT license.

*/
var end_date = new Date() ;
var msBack = 7 * 24 * 60 * 60 * 1000 ;
var start_date = new Date(end_date.getTime() - msBack) ;
var start_date_iso = start_date.toISOString();
var end_date_iso = end_date.toISOString();
                          
var start_date_encoded = encodeURIComponent(start_date_iso);
var end_date_encoded = encodeURIComponent(end_date_iso);
// 2017-12-08T16%3A39%3A42.919Z
// 2017-11-22T00%3A00%3A00Z

highed.plugins.import.install('ERDDAP',  {
    description: 'ERDDAP data format commonly used for Ocean Observing. <a href="http://www.neracoos.org/erddap/" target="_blank">http://www.neracoos.org/erddap/</a>',
    treatAs: 'json',
    fetchAs: 'text/html',
    proxy: "http://www.neracoos.org/proxy2?ajax=1&url=",
    // defaultURL: 'http://www.neracoos.org/proxy2?ajax=1&url=https://coastwatch.pfeg.noaa.gov%2Ferddap%2Fgriddap%2FNWW3_Global_Best.json%3FThgt%5B(2017-11-08T05%3A00%3A00.000Z)%3A1%3A(2017-11-11T21%3A00%3A00.000Z%5D%5B(0.0)%3A1%3A(0.0)%5D%5B(43.46415)%3A1%3A(43.46415)%5D%5B(290)%3A1%3A(290)%5D%2CTper%5B(2017-11-08T05%3A00%3A00.000Z)%3A1%3A(2017-11-11T21%3A00%3A00.000Z%5D%5B(0.0)%3A1%3A(0.0)%5D%5B(43.46415)%3A1%3A(43.46415)%5D%5B(290)%3A1%3A(290)%5D%2Cshgt%5B(2017-11-08T05%3A00%3A00.000Z)%3A1%3A(2017-11-11T21%3A00%3A00.000Z%5D%5B(0.0)%3A1%3A(0.0)%5D%5B(43.46415)%3A1%3A(43.46415)%5D%5B(290)%3A1%3A(290)%5D%2Csper%5B(2017-11-08T05%3A00%3A00.000Z)%3A1%3A(2017-11-11T21%3A00%3A00.000Z%5D%5B(0.0)%3A1%3A(0.0)%5D%5B(43.46415)%3A1%3A(43.46415)%5D%5B(290)%3A1%3A(290)%5D',
    // defaultURL: 'http://www.neracoos.org/erddap/tabledap/A01_accelerometer_all.json?station%2Ctime%2Cmooring_site_desc%2Csignificant_wave_height%2Csignificant_wave_height_qc%2Cdominant_wave_period%2Cdominant_wave_period_qc%2Clongitude%2Clatitude%2Cdepth&time%3E=2017-11-09T00%3A00%3A00Z&time%3C=2017-11-16T18%3A00%3A00Z',
    // defaultURL: 'http://www.neracoos.org/erddap/tabledap/B01_met_all.json?time%2Cair_temperature%2Cwind_speed&time%3E=2017-11-13T00%3A00%3A00Z&time%3C=2017-11-20T16%3A00%3A00Z',
    // defaultURL: 'http://www.neracoos.org/erddap/tabledap/B01_met_all.json?time%2Cair_temperature%2Cbarometric_pressure%2Cwind_speed&time%3E=2017-11-22T00%3A00%3A00Z&time%3C=2017-11-29T15%3A00%3A00Z',
    // example of calculated default date
    // http://www.neracoos.org/erddap/tabledap/B01_met_all.json?time%2Cair_temperature%2Cbarometric_pressure%2Cwind_speed&time%3E=2017-11-24T19%3A33%3A28.168Z&time%3C=2017-12-01T19%3A33%3A28.168Z
    /// 
    /// NERACOOS ERDDAP default URL
    defaultURL: 'http://www.neracoos.org/erddap/tabledap/B01_met_all.json?time%2Cair_temperature%2Cbarometric_pressure%2Cwind_speed&time%3E=' +
                      start_date_encoded + '&time%3C=' + end_date_encoded,
    /// GMRI ERDDAP Default URL
    ///defaultURL: 'http://docker1.gmri.org:8230/erddap/tabledap/NMFS_Atlantic_Lobster_Landings.json?Year%2CPounds%2CValue%2CMetricTons%2CSpecies%2CState',
    options: {
        includeFields: {
            type: 'string',
            label: 'Fields to include as data, separate by whitespace',
            // default: 'Pounds Value MetricTons' 
            default: 'time air_temperature wind_speed barometric_pressure'                             
        },
        labelFields: {
            type: 'string',
            label: 'Fields to use as labels, separate by whitespace',
            // default: 'State'                           
            default: 'Species State'                           
        },
        xAxisColumn: {
            type: 'string',
            label: 'xAxis column name and type separated by a comma',
            // default: 'Year,Year'        
            default: 'time,ISO Date'                           
        },
        chartType: {
            type: 'string',
            label: 'Chart Type: Stacked and Grouped, One Line Per Field',
            // default: 'Stacked and Grouped'  
            default: 'One Line per Field'
        }
    },
    filter: function (data, options, fn) {
        var csv = [], header = [];

        // creates an array of field_name1: true, field_name2: true....
        // options.includeFields = highed.arrToObj(options.includeFields.split(' '));
        
        options.labels = options.labelFields.split(" ") ;
        options.fields = options.includeFields.split(" ");
        options.labelFields = highed.arrToObj(options.labelFields.split(' '));
        options.xAxisColumn = options.xAxisColumn.split(",");

        var data_parsed = JSON.parse(data) ;
        // Decode column indexes to use
        var columnKeys = [] ;
        var labelKeys = [] ;
        var xAxisIndex = 0 ;
        var copy_hc_colors = ["#7cb5ec", "#434348", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"] ;
        var color_count = 0 ;
        var chart_options = {} ;
        var yAxis = [] ;
        var yAxisCount = 0 ;
        chart_options.series = [] ;
        var toggle_opposite = false ; // a yAxis toggle for the side of the chart.
        var categories = [] ; // for stacked and grouped charts. effectively the xAxis values
        
        // sort by labels. So Lobster American and Connecticut is a series.
        // That would imply creating an array of series with indexed by label and 
        // populating them with rows that match.
        var series_array = [] ;
        var xAxisType = 'datetime';
        // flag for testing the use of categories. This might
        // end up being a choice the user makes
        var use_categories = false ;
        
        // new tact. pass in a chart type
        switch ( options.chartType ) {
          case 'Stacked and Grouped':
            // 
            // Stacked and Grouped
            // ex. http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/column-stacked-and-grouped/
            // xAxisColumn = xAxis Categories
            // includeFields = series.name
            // labelFields = series.stack
            //
            for ( var vKey in options.fields ) {
              var cIndex = ERDDAPColumnIndexFromColumnName( data_parsed.table.columnNames, options.fields[vKey]) ;
              columnKeys[options.fields[vKey]] = cIndex ;
              if (options.fields[vKey] == options.xAxisColumn[0]) {
                xAxisIndex = cIndex ;
              }
            }
            // only one "label" which is really stack
            for ( var lKey in options.labels ) {
              var cIndex = ERDDAPColumnIndexFromColumnName( data_parsed.table.columnNames, options.labels[lKey]) ;
              labelKeys[options.labels[lKey]] = cIndex ;
            }
            // Add each row to a structure 
            // category (xAxis)
            // foreach field stack (labels), data array (by field), name (fields)
            var data_as_number = 0.0 ;
            for ( dKey in data_parsed.table.rows) {
              for ( var fKey in options.fields ) {
                // set up a series for each "field" and Label
                var found_series = false ;
                var series_index =  options.fields[fKey] + data_parsed.table.rows[dKey][labelKeys[options.labels[0]]];
                for ( sKey in series_array ) {
                  if ( sKey == series_index ) {
                    found_series = true ;
                    break;
                  }
                }
                if ( !found_series ) {
                  var series = {} ;
                  var fKeyNumeric = parseInt(fKey);
                  series_array[series_index] = series ;
                  // name the first series after the stack and link subsequent series to it 
                  // that's linkedTo below...
                  // use the fieldName in the tooltip. This is not part of highcharts except
                  // for highcharts adding it to series.userOptions where you can use it
                  if ( fKey == 0 ) {
                    series_array[series_index].name = data_parsed.table.rows[dKey][labelKeys[options.labels[0]]]; 
                    series_array[series_index].fieldName = options.fields[fKey] ;
                  } else {
                    series_array[series_index].name = options.fields[fKey] ;
                    series_array[series_index].fieldName = options.fields[fKey] ;
                  }
                  // series_array[options.fields[fKey]].type = 'spline';
                  series_array[series_index].data = [];
                  // higcharts will merge options here with the chart "options" so
                  // they are available in the tooltip. name above will magically be
                  // this.series.options.name in the tool tip formatter.
                  series_array[series_index].options = {} ;
                  series_array[series_index].pointWidth = 4 ;
                  series_array[series_index].id = series_index ; // field + stack
                  // link all series after the first to the first series
                  // showing only one legend item per stack.
                  if ( fKeyNumeric > 0 ) {
                    series_array[series_index].linkedTo= options.fields[0] + data_parsed.table.rows[dKey][labelKeys[options.labels[0]]]; ; // first field + stack
                  }
                  var vs_object = {shared: true, crosshairs: true};
                  vs_object.pointFormatter = function () {
                    return (this.series.options.name + " " + this.y + " for " + this.series.options.stack )
                  }
                  // series_array[series_index].tooltip = vs_object ;
                  // look for a yAxis and set one up if it's not already
                  // tag this series with it. Watch out, yaxis.text is the comparison
                  var found_yAxis = false ;
                  for ( yKey in yAxis ) {
                    if ( yAxis[yKey].title.text ==  options.fields[fKey] ) {
                      found_yAxis = true ;
                      series_array[series_index].yAxis = parseInt(yKey) ;
                      break;
                    }
                  }
                  if ( !found_yAxis ) { 
                    // yAxis is added later as an array to the series.
                    var new_title3 = {} ;
                    new_title3.text = options.fields[fKey]  ;
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
                    color_count ++ ;
                    if ( color_count >= copy_hc_colors.length ) {
                      color_count = 0 ;
                    }
                  }
                }
                // parseFloat(672,900) is 672. I need to remove the comma.
                var data_no_commas = data_parsed.table.rows[dKey][columnKeys[options.fields[fKey]]].split(',').join('');
                data_as_number = parseFloat(data_no_commas);
                  // not using categories? put the xaxis as the first value 
                  if (!use_categories) {
                    var data_point = [] ;
                    data_point.push(data_parsed.table.rows[dKey][xAxisIndex]) ;
                    data_point.push(data_as_number) ;
                    series_array[series_index].data.push(data_point) ;
                  } else {
                    series_array[series_index].data.push(data_as_number) ;
                  }
                series_array[series_index].stack = data_parsed.table.rows[dKey][labelKeys[options.labels[0]]];
                // check for the category
                let found_category = false ;
                for ( cKey in categories ) {
                  if ( categories[cKey] == data_parsed.table.rows[dKey][xAxisIndex].toString() ) {
                    found_category = true ;
                  }
                }
                if (!found_category) {
                  categories.push(data_parsed.table.rows[dKey][xAxisIndex].toString()) ;
                }
              }
            xAxisType = 'linear';
            chart_options.chart = {
              type: 'column'
            };
            if ( use_categories ) {
              chart_options.xAxis =  {
                categories: categories
              };
            } else {
              chart_options.xAxis = {
                type: 'linear'
              }
            }
            chart_options.plotOptions =  {
                column: {
                    stacking: 'normal'
                }
            };
            chart_options.legend = {
              layout: 'horizontal',
              align: 'center',
              x: 80,
              verticalAlign: 'bottom',
              y: 20,
              floating: true,
              backgroundColor: '#FFFFFF'
            };
            chart_options.tooltip = {
             formatter: function () {
              var s = '<b>' + this.x + '</b>';
              var stack_values = [] ;
              // create an array for each stack with the names and values
              for ( var tpKey in this.points ) {
                var point = this.points[tpKey];
                var found_stack = false ;
                for ( var sKey in stack_values ) {
                  if ( sKey == point.series.userOptions.stack ) {
                    found_stack = true ;
                  }
                }
                if ( !found_stack ) {
                  stack_values[point.series.userOptions.stack] = [] ;
                }
                stack_values[point.series.userOptions.stack][point.series.userOptions.fieldName] = point.y ;
              }
              for ( var sKey in stack_values ) {
                s += '<br/>' + sKey + ": " ;
                for ( var pKey in stack_values[sKey] ) {
                  s += pKey + " " + stack_values[sKey][pKey] + " " ;
                }
              }
              return s;
             },
              shared: true,
              crosshairs: true
            };
            }
            break;
          case 'One Line per Field' :
          default:
            for ( var vKey in options.fields ) {
              var cIndex = ERDDAPColumnIndexFromColumnName( data_parsed.table.columnNames, options.fields[vKey]) ;
              columnKeys[options.fields[vKey]] = cIndex ;
              if (options.fields[vKey] == options.xAxisColumn[0]) {
                xAxisIndex = cIndex ;
              }
            }
            for ( var lKey in options.labels ) {
              var cIndex = ERDDAPColumnIndexFromColumnName( data_parsed.table.columnNames, options.labels[lKey]) ;
              labelKeys[options.labels[lKey]] = cIndex ;
            }
            for ( var fKey in options.fields ) {
              switch ( options.fields[fKey] ) {
                case options.xAxisColumn[0]:
                  // first column is xAxis
                  // time is used in every series
                  // just skip it.
                  break;
                default:
                  // for each row create a series of data points
                  // consisting of the xXaxis and a column
                  for ( dKey in data_parsed.table.rows) {
              
                    // create a series if necessary
                    var label_text = '';
                    for ( lKey in labelKeys ){
                      label_text += " " + data_parsed.table.rows[dKey][labelKeys[lKey]] ;
                    }
                    var found_series = false ;
                    for ( sKey in series_array ) {
                      if ( sKey == options.fields[fKey] ) {
                        found_series = true ;
                        break;
                      }
                    }
                    if ( !found_series ) {
                      var series = {} ;
                      series_array[options.fields[fKey]] = series ;
                      series_array[options.fields[fKey]].name = options.fields[fKey] ;
                      series_array[options.fields[fKey]].type = 'spline';
                      series_array[options.fields[fKey]].yAxis = yAxisCount ;
                      series_array[options.fields[fKey]].data = [];
                      // higcharts will merge options here with the chart "options" so
                      // they are available in the tooltip. name above will magically be
                      // this.series.options.name in the tool tip formatter.
                      series_array[options.fields[fKey]].options = {} ;
                    }
                    var data_as_number = 0.0 ;
              
                    var data_point = [];
                    // xAxis must be first
                    switch ( options.xAxisColumn[1] ) {
                      case "ISO Date" :
                        // first column is time
                        var new_date = new Date(data_parsed.table.rows[dKey][columnKeys[options.fields[0]]]);
                        var msse = new_date.valueOf();
                        data_point.push(msse) ;
                        break;
                      case 'Year':
                        data_point.push(data_parsed.table.rows[dKey][xAxisIndex]) ;
                        break;
                      default:
                        data_point.push(data_parsed.table.rows[dKey][xAxisIndex]) ;
                        break;
                    }
                    // then the data point
                    data_as_number = parseFloat(data_parsed.table.rows[dKey][columnKeys[options.fields[fKey]]]);
                    data_point.push(data_as_number );
                    series_array[options.fields[fKey]].data.push(data_point);
                  }
                  // value suffix object
                  // units may not be present
                  if (  data_parsed.table.columnUnits[columnKeys[options.fields[fKey]]] != undefined) {
                    series_array[options.fields[fKey]].options.units = data_parsed.table.columnUnits[columnKeys[options.fields[fKey]]];
                  } else {
                    series_array[options.fields[fKey]].options.units = "";
                  }
                  var vs_object = {shared: true, crosshairs: true};
                  vs_object.xDateFormat = '%A %m-%d-%Y %I:%M %p' ;
                  vs_object.pointFormatter = function () {
                    return (this.series.options.name + " " + this.y +  " " +
                         this.series.userOptions.options.units + "<br/>")
                  }
                  series_array[options.fields[fKey]].tooltip = vs_object ;
                  chart_options.tooltip = vs_object;
                  // yAxis is added later as an array to the series.
                  var new_title3 = {} ;
                  new_title3.text = options.fields[fKey]  ;
                  new_title3.style = {color: copy_hc_colors[color_count] };
                  var new_label3 = {} ;
                  var units = series_array[options.fields[fKey]].options.units ;
                  // new_label3.format = '{value} ' + data_parsed.table.columnUnits[columnKeys[fKey]] ;
                  new_label3.format = '{value} ' + units;
                  new_label3.style = {color: copy_hc_colors[color_count] };
                  yAxis.push( {
                    gridLineWidth: 0,
                    title: new_title3,
                    labels: new_label3,
                    opposite: toggle_opposite
                  })
                  toggle_opposite = !toggle_opposite;
                  yAxisCount ++;
                  color_count ++ ;
                  if ( color_count >= copy_hc_colors.length ) {
                    color_count = 0 ;
                  }
                  chart_options.chart = {zoomType: 'xy' };
                  break;
              }
            }
            switch ( options.xAxisColumn[1] ) {
              case "ISO Date" :
                xAxisType = 'datetime';
                break;
              case 'Year':
                xAxisType = 'linear';
                break;
              default:
                xAxisType = 'datetime';
                break;
            }
        
            chart_options.xAxis =  {
              type: xAxisType,
              isDirty: true,
              labels: {
                  style: {
                      fontFamily: 'Tahoma'
                  },
                  rotation: -45
              }
            };
            chart_options.legend = {
              layout: 'horizontal',
              align: 'center',
              x: 80,
              verticalAlign: 'bottom',
              y: 20,
              floating: true,
              backgroundColor: '#FFFFFF'
            };
            break;
        }
        // create a zero based array
        var series_array_numeric = [] ;
        for ( sKey in series_array) {
          series_array_numeric.push(series_array[sKey]);
        }
        chart_options.series = series_array_numeric;
        chart_options.yAxis = yAxis ;
        /// chart_options.yAxis = {
        ///   allowDecimals: true,
        ///   min: 0,
        ///   title: {
        ///       text: 'Number of fruits'
        ///       }
        ///   };
        chart_options.title = {text: "Erddap"} ;
        // use the initial part of the url as teh subtitle.
        var qs_index = options.url.indexOf('?') ;
        chart_options.subtitle = {text: "Source: " + options.url.substr(0,qs_index) + "..."} ;
        fn(false, chart_options);
    }
});

  // erddap column index from column name
  // return the column index for a given column name
  function ERDDAPColumnIndexFromColumnName( columnNames, columnName ) {
    var column_index = '';
    for ( column_index in columnNames ) {
      if ( columnNames[column_index] == columnName ) {
        break;
      }
    }
  return(column_index);
  }
