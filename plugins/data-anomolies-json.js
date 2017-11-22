/*

    Copyright (c) 2017, GMRI

    Licensed under the MIT license.

*/

highed.plugins.import.install('Anomolies',  {
    description: 'Climate data. <a href="http://www.neracoos.org/erddap/" target="_blank">http://www.neracoos.org/erddap/</a>',
    treatAs: 'json',
    fetchAs: 'text/html',
    proxy: "http://www.neracoos.org/proxy2?ajax=1&url=",
    defaultURL: 'http://www.neracoos.org/static/ncdc_cache/NESHELF_OISST-V2-AVHRR_agg_combined_latest.json',
    options: {
        includeFields: {
            type: 'string',
            label: 'User added information',
            default: 'SST_ANOM'                           
        },
        firstColumn: {
            type: 'string',
            label: 'Date Description',
            default: 'Milliseconds Since Epoch'                           
        }
    },
    filter: function (data, options, fn) {

        options.includeFields = highed.arrToObj(options.includeFields.split(' '));

        var data_parsed = JSON.parse(data) ;
        var chart_options = {} ;
        chart_options.series = [] ;
        // first without min max which we'll put together
        // for an area range.
          //Only include things we're interested in
          var rdata = [] ;
          for ( var fKey in options.includeFields ) {
            switch ( fKey ) {
              case 'SST_ANOM':
              default:
                var series = {} ;
                series.name = fKey ;
                series.type = "column" ;
                series.color = "#CC201D";
                series.negativeColor = "#2432DD";
                if ( options.firstColumn.indexOf("Convert Milliseconds Since Epoch") == 0 ) {
                  series.data = [] ;
                  for ( var dKey in data_parsed[fKey].data ) {
                    var new_data_point = [] ;
                    for ( var iKey in data_parsed[fKey].data[dKey] ) {
                      if ( iKey == 0 ) {
                        var new_date = new Date(data_parsed[fKey].data[dKey][iKey]);
                        var new_date_isoString = new_date.toISOString() ;
                        // "1981-09-01T00:00:00.000Z"
                        var rdt_temp = new_date_isoString.substr(0,4) + "-" + new_date_isoString.substr(5,2) +
                          "-" + new_date_isoString.substr(8,2) + "T" +
                          new_date_isoString.substr(11, 8) + "Z" ;
                          // var resultdatems = Date.parse(rdt_temp);
                        new_data_point.push(rdt_temp);
                      } else {
                        new_data_point.push(data_parsed[fKey].data[dKey][iKey]) ;
                      }
                    }
                    series.data.push( new_data_point);
                  }
                } else {
                  series.data = data_parsed[fKey].data ;
                  // value suffix object
                  let vs_object = {shared: true, crosshairs: true};
                  vs_object.xDateFormat = '%A %m-%d-%Y %I:%M %p' ;
                  vs_object.pointFormatter = function () {
                    return (this.y + ' c')
                  }
                  series.tooltip = vs_object ;
                }
                chart_options.series.push(series) ;
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
                var yAxis = [] ;
                
                var new_title3 = {} ;
                new_title3.text = 'Anomoly' ;
                var new_label3 = {} ;
                new_label3.format = '{value} ' + 'degrees' ;
                yAxis.push( {
                  title: new_title3,
                  labels: new_label3 
                })
                chart_options.yAxis = yAxis;
                break;
            }
          }
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
