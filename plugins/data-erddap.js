/*

    Copyright (c) 2017, GMRI

    Licensed under the MIT license.

*/

highed.plugins.import.install('ERDDAP',  {
    description: 'ERDDAP data format commonly used for Ocean Observing. <a href="http://www.neracoos.org/erddap/" target="_blank">http://www.neracoos.org/erddap/</a>',
    treatAs: 'csv',
    fetchAs: 'text/html',
    defaultURL: 'http://www.neracoos.org/proxy2?ajax=1&url=https://coastwatch.pfeg.noaa.gov%2Ferddap%2Fgriddap%2FNWW3_Global_Best.json%3FThgt%5B(2017-11-08T05%3A00%3A00.000Z)%3A1%3A(2017-11-11T21%3A00%3A00.000Z%5D%5B(0.0)%3A1%3A(0.0)%5D%5B(43.46415)%3A1%3A(43.46415)%5D%5B(290)%3A1%3A(290)%5D%2CTper%5B(2017-11-08T05%3A00%3A00.000Z)%3A1%3A(2017-11-11T21%3A00%3A00.000Z%5D%5B(0.0)%3A1%3A(0.0)%5D%5B(43.46415)%3A1%3A(43.46415)%5D%5B(290)%3A1%3A(290)%5D%2Cshgt%5B(2017-11-08T05%3A00%3A00.000Z)%3A1%3A(2017-11-11T21%3A00%3A00.000Z%5D%5B(0.0)%3A1%3A(0.0)%5D%5B(43.46415)%3A1%3A(43.46415)%5D%5B(290)%3A1%3A(290)%5D%2Csper%5B(2017-11-08T05%3A00%3A00.000Z)%3A1%3A(2017-11-11T21%3A00%3A00.000Z%5D%5B(0.0)%3A1%3A(0.0)%5D%5B(43.46415)%3A1%3A(43.46415)%5D%5B(290)%3A1%3A(290)%5D',
    options: {
        includeFields: {
            type: 'string',
            label: 'Fields to include, separate by whitespace',
            default: 'time Thgt Tper'                           
        }
    },
    filter: function (data, options, fn) {
        var csv = [], header = [];

        options.includeFields = highed.arrToObj(options.includeFields.split(' '));

        var data_parsed = JSON.parse(data) ;
        var dataArray = data_parsed.table.rows ;
        // Decode column indexes to use
        var columnKeys = [] ;
        for ( var vKey in options.includeFields ) {
          var cIndex = ERDDAPColumnIndexFromColumnName( data_parsed.table.columnNames, vKey ) ;
          columnKeys[vKey] = cIndex ;
        }
        if (highed.isArr(dataArray)) {
            //Only include things we're interested in
            data = dataArray.map(function (d) {
                var r = {};
                Object.keys(options.includeFields).forEach(function (c) {
                    r[c] = d[columnKeys[c]];
                });
                return r;
            });

            data.forEach(function (row, i) {
                var rdata = [];                            
                
                Object.keys(row).forEach(function (key) {
                    var col = row[key];

                    if (!options.includeFields[key]) {
                        return;
                    }

                    if (i == 0) {
                        header.push(key);
                    }
                    if ( key == 'time' ) {
                      rdata.push((col) || col);
                    } else {
                      // rdata.push(parseInt(col) || col);
                      rdata.push((col) || col);
                    }
                    
                });
                csv.push(rdata.join(','));
            });
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
