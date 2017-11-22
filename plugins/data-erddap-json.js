/*

    Copyright (c) 2017, GMRI

    Licensed under the MIT license.

*/

highed.plugins.import.install('ERDDAP',  {
    description: 'ERDDAP data format commonly used for Ocean Observing. <a href="http://www.neracoos.org/erddap/" target="_blank">http://www.neracoos.org/erddap/</a>',
    treatAs: 'json',
    fetchAs: 'text/html',
    proxy: "http://www.neracoos.org/proxy2?ajax=1&url=",
    // defaultURL: 'http://www.neracoos.org/proxy2?ajax=1&url=https://coastwatch.pfeg.noaa.gov%2Ferddap%2Fgriddap%2FNWW3_Global_Best.json%3FThgt%5B(2017-11-08T05%3A00%3A00.000Z)%3A1%3A(2017-11-11T21%3A00%3A00.000Z%5D%5B(0.0)%3A1%3A(0.0)%5D%5B(43.46415)%3A1%3A(43.46415)%5D%5B(290)%3A1%3A(290)%5D%2CTper%5B(2017-11-08T05%3A00%3A00.000Z)%3A1%3A(2017-11-11T21%3A00%3A00.000Z%5D%5B(0.0)%3A1%3A(0.0)%5D%5B(43.46415)%3A1%3A(43.46415)%5D%5B(290)%3A1%3A(290)%5D%2Cshgt%5B(2017-11-08T05%3A00%3A00.000Z)%3A1%3A(2017-11-11T21%3A00%3A00.000Z%5D%5B(0.0)%3A1%3A(0.0)%5D%5B(43.46415)%3A1%3A(43.46415)%5D%5B(290)%3A1%3A(290)%5D%2Csper%5B(2017-11-08T05%3A00%3A00.000Z)%3A1%3A(2017-11-11T21%3A00%3A00.000Z%5D%5B(0.0)%3A1%3A(0.0)%5D%5B(43.46415)%3A1%3A(43.46415)%5D%5B(290)%3A1%3A(290)%5D',
    // defaultURL: 'http://www.neracoos.org/erddap/tabledap/A01_accelerometer_all.json?station%2Ctime%2Cmooring_site_desc%2Csignificant_wave_height%2Csignificant_wave_height_qc%2Cdominant_wave_period%2Cdominant_wave_period_qc%2Clongitude%2Clatitude%2Cdepth&time%3E=2017-11-09T00%3A00%3A00Z&time%3C=2017-11-16T18%3A00%3A00Z',
    defaultURL: 'http://www.neracoos.org/erddap/tabledap/B01_met_all.json?time%2Cair_temperature%2Cwind_speed&time%3E=2017-11-13T00%3A00%3A00Z&time%3C=2017-11-20T16%3A00%3A00Z',
    options: {
        includeFields: {
            type: 'string',
            label: 'Fields to include, separate by whitespace',
            default: 'time air_temperature wind_speed'                           
        },
        firstColumn: {
            type: 'string',
            label: 'Date Description',
            default: 'ISO Date'                           
        }
    },
    filter: function (data, options, fn) {
        var csv = [], header = [];

        options.includeFields = highed.arrToObj(options.includeFields.split(' '));

        var data_parsed = JSON.parse(data) ;
        // Decode column indexes to use
        var columnKeys = [] ;
        for ( var vKey in options.includeFields ) {
          var cIndex = ERDDAPColumnIndexFromColumnName( data_parsed.table.columnNames, vKey ) ;
          columnKeys[vKey] = cIndex ;
        }
        var chart_options = {} ;
        var yAxis = [] ;
        chart_options.series = [] ;
        var toggle_opposite = false ; // a yAxis toggle for the side of the chart.
        
        for ( var fKey in options.includeFields ) {
          switch ( fKey ) {
            case 'time':
              // time is used in every series
              // just skip it.
              break;
            default:
              var series = {} ;
              series.name = fKey ;
              series.type = 'spline';
              series.data = []
              for ( dKey in data_parsed.table.rows) {
                var data_point = [];
                if ( options.firstColumn.indexOf("ISO Date") == 0 ) {
                  var new_date = new Date(data_parsed.table.rows[dKey][columnKeys['time']]);
                  var msse = new_date.valueOf();
                  data_point.push(msse) ;
                } else {
                  data_point.push(data_parsed.table.rows[dKey][columnKeys['time']]) ;
                }
                data_point.push( data_parsed.table.rows[dKey][columnKeys[fKey]]);
                series.data.push(data_point);
              }
              // value suffix object
              series.units = data_parsed.table.columnUnits[columnKeys[fKey]];
              var vs_object = {shared: true, crosshairs: true};
              vs_object.xDateFormat = '%A %m-%d-%Y %I:%M %p' ;
              vs_object.pointFormatter = function () {
                return (this.series.options.name + " " + this.y + this.series.options.units + "<br/>")
              }
              series.tooltip = vs_object ;
              chart_options.tooltip = vs_object;
              chart_options.series.push(series) ;
              // yAxis is added later as an array to the series.
              var new_title3 = {} ;
              new_title3.text = fKey  ;
              var new_label3 = {} ;
              // new_label3.format = '{value} ' + data_parsed.table.columnUnits[columnKeys[fKey]] ;
              new_label3.format = '{value}';
              yAxis.push( {
                title: new_title3,
                labels: new_label3,
                opposite: toggle_opposite
              })
              toggle_opposite = !toggle_opposite;
              break;
          }
        }
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
        chart_options.yAxis = yAxis ;
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
