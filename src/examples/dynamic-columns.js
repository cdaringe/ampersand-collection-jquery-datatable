var jQuery = window.jQuery = require('jquery'),
    CollectionTable = require('../../ampersand-collection-jquery-datatable'),
    datatables= require('datatables'),
    domready = require('domready');

var colDefs = [{title: 'a', data: 'a'}, {title: 'b', data: 'b'}];
var dummyData = [
    {
        a: 'a1',
        b: 'b1',
        c: 'c1',
        d: 'd1'
    },
    {
        a: 'a2',
        b: 'b2',
        c: 'c2',
        d: 'd2'
    },
    {
        a: 'a3',
        b: 'b3',
        c: 'c3',
        d: 'd3'
    },
];



domready(function() {
    var $myDt = jQuery('#myTable');
    $myDt.dataTable({
        data: dummyData,
        columns: colDefs
    });

        colDefs.push({title: 'd', data: 'd'});
        $myDt.DataTable().destroy();
        $myDt.dataTable({
            data: dummyData,
            columns: colDefs
        });
});
