/*

    Copyright (c) 2017, GMRI

    Licensed under the MIT license.

*/

highed.plugins.import.install('Climatologies',  {
    description: 'Climate data. <a href="http://www.neracoos.org/erddap/" target="_blank">http://www.neracoos.org/erddap/</a>',
    treatAs: 'csv',
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
        header.push('doy');
        if (highed.isArr(dataArray)) {
            //Only include things we're interested in
            var rdata = [] ;
            for ( var fKey in options.includeFields ) {
              header.push(fKey); // MEDIAN, MEAN etc.
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
            }
            for ( var dKey in rdata ) {
              var row = rdata[dKey].doy ;
              for ( var fKey in options.includeFields ) {
                row += "," + rdata[dKey][fKey] ;
              }
              csv.push(row);
            }
        }

        fn(false, [header.join(',')].concat(csv).join('\n'));
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
