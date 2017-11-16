/*

    Copyright (c) 2017, GMRI

    Licensed under the MIT license.

*/

highed.plugins.import.install('ClimatologiesJSON',  {
    description: 'Climate data. <a href="http://www.neracoos.org/erddap/" target="_blank">http://www.neracoos.org/erddap/</a>',
    treatAs: 'json',
    fetchAs: 'text/html',
    proxy: "http://www.neracoos.org/proxy2?ajax=1&url=",
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
        // first without min max which we'll put together
        // for an area range.
          //Only include things we're interested in
          var rdata = [] ;
          for ( var fKey in options.includeFields ) {
            switch ( fKey ) {
              case 'STD':
                var series = {} ;
                series.data = data_parsed[fKey].data ;
                series.name = "Standard Deviation" ;
                series.type = "errorbar" ;
                chart_options.series.push(series) ;
                break;
              case 'BOXPLOT':
                var series = {} ;
                series.data = data_parsed[fKey].data ;
                series.name = "Box Plot" ;
                series.type = "boxplot" ;
                chart_options.series.push(series) ;
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
                break;
            }
          }
          // now merge MIN & MAX into one series
          if ( use_min_max ) {
            // to create an arearange
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
