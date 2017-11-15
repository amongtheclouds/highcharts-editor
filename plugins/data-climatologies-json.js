/*

    Copyright (c) 2017, GMRI

    Licensed under the MIT license.

*/

highed.plugins.import.install('ClimatologiesJSON',  {
    description: 'Climate data. <a href="http://www.neracoos.org/erddap/" target="_blank">http://www.neracoos.org/erddap/</a>',
    treatAs: 'json',
    fetchAs: 'text/html',
    defaultURL: 'http://www.neracoos.org/proxy2?ajax=1&url=http%3A%2F%2Fwww.neracoos.org%2Fstatic%2Fncdc_cache%2FNESHELF_sst_daily_clim_1982_2011.json',
    options: {
        includeFields: {
            type: 'string',
            label: 'User added information',
            default: 'MEDIAN MEAN MIN MAX'                           
        }
    },
    filter: function (data, options, fn) {
        var csv = [], header = [];

        options.includeFields = highed.arrToObj(options.includeFields.split(' '));

        var data_parsed = JSON.parse(data) ;
        var dataArray = data_parsed.MEAN.data ;
        var chart_options = {} ;
        chart_options.series = [] ;
        header.push('doy');
        // first without min max which we'll put together
        // for an area range.
        if (highed.isArr(dataArray)) {
            //Only include things we're interested in
            var rdata = [] ;
            for ( var fKey in options.includeFields ) {
              if ( fKey != 'MIN' && fKey != 'MAX' ) {
                var series = {} ;
                header.push(fKey); // MEDIAN, MEAN etc.
                series.name = fKey ;
                series.data = data_parsed[fKey].data ;
                /*
                for ( var dKey in data_parsed[fKey].data ) {
                  // all the data MEDIAN, MEAN etc start with doy
                  if( rdata[dKey] == undefined ) {
                    rdata[dKey] = [] ;
                  }
                  rdata[dKey]['doy'] = data_parsed[fKey].data[dKey][0] ;
                  rdata[dKey][fKey] = data_parsed[fKey].data[dKey][1];
                  // var row = [] ;
                  // row.push(data_parsed[fKey].data[dKey][0]) ;
                  // row.push(data_parsed[fKey].data[dKey][1]) ;
                  // rdata[fKey].push(row);
                  if ( dKey > 10 ) {
                    // break;
                  }
                }
                */
              chart_options.series.push(series) ;
              }
            }
            // now merge MIN & MAX into one series
            ar_series = {}
            ar_series.name = "Min-Max" ;
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
            /*
            csv.push(header);
            for ( var dKey in rdata ) {
              // var row = parseInt(rdata[dKey].doy) ;
              var row = [] ;
              row.push(parseInt(rdata[dKey].doy) );
              for ( var fKey in options.includeFields ) {
                // row += "," + parseFloat(rdata[dKey][fKey]) ;
                row.push(parseFloat(rdata[dKey][fKey])) ;
              }
              csv.push(row);
            }
            */
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
