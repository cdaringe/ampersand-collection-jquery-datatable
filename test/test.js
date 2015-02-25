var test = require('tape'); // jshint ignore:line
var jQuery = require('jquery');
var $ = window.jQuery = jQuery;
var prettyHTML = require('js-beautify').html; // debug ref: console.dir(prettyHTML(myTable.innerHTML));
require('datatables');
var Collection = require('ampersand-collection');
var CollectionTable = require('../ampersand-collection-jquery-datatable.js');

var rowCollectionData = [
    {
        id: 'auntie t',
        a: 'a'
    }, {
        id: 'supreme',
        a: 'b'
    }, {
        id: 'veggie',
        a: 'c'
    }
];

var rowCollection, myTable, $myTable;

function setup() {
    myTable = window.document.createElement('table');
    myTable.id = 'myTable';
    $myTable = $(myTable);
    if (rowCollection && rowCollection.isCollection) {
        rowCollection.reset();
    }
    rowCollection = new Collection();
    rowCollection.add(rowCollectionData);
}



test('basic table', function (t) {
    setup();
    var cdt = new CollectionTable({
        collection: rowCollection,
        el: myTable,
        dtOptions: {
            columns: [
                {title: "ABC's", data: 'id'}
            ]
        }
    });
    t.equal(myTable.querySelector('th').textContent, "ABC's", 'should have matching title with th');
    t.equal(myTable.querySelectorAll('td').length, 3, "should have same number of table nodes as data nodes ");
    t.end();
});



test('multi-col table', function (t) {
    setup();
    var beforeRows, afterRows;
    var cdt = new CollectionTable({
        collection: rowCollection,
        el: myTable,
        dtOptions: {
            columns: [
                {title: "ABC's", data: 'a'},
                {title: "BFC's", data: 'id'} // big flippin calzones :)
            ]
        }
    });
    t.equal(jQuery(myTable).find('th')[1].textContent, "BFC's", 'should have matching title with 2nd col');
    t.equal(myTable.querySelectorAll('th').length, 2, "should have same number of th's as titles");
    t.equal(myTable.querySelectorAll('td').length, 6, "should have same number of td's as data nodes");
    t.end();
});



test('add/delete a collection item', function (t) {
    setup();
    var dummyItem = {a: 'one extra', id: 'one extra'};
    var cdt = new CollectionTable({
        collection: rowCollection,
        el: myTable,
        dtOptions: {
            columns: [
                {title: "ABC's", data: 'a'},
                {title: "BFC's", data: 'id'} // big flippin calzones :)
            ]
        }
    });
    beforeRows = myTable.querySelectorAll('tbody tr').length;
    rowCollection.add(dummyItem);
    afterRows = myTable.querySelectorAll('tbody tr').length;
    t.equal(beforeRows + 1, afterRows, 'should add an extra row when adding data to collection');
    rowCollection.remove('one extra');
    afterRows = myTable.querySelectorAll('tbody tr').length;
    t.equal(beforeRows, afterRows, 'should remove a row when removing data from the collection');
    t.end();
});

test('use collection for columns, add/remove to/from collection', function (t) {
    setup();
    var colCollection = new Collection();
    colCollection.add([
        {id: 'a', title: 'collection col 1', data: 'a'},
        {id: 'b', title: 'collection col 2', data: 'id'},
        {id: 'c', title: 'collection col 3', data: 'a'},
    ]);
    var cdt = new CollectionTable({
        collections: {
            rows: rowCollection,
            cols: colCollection
        },
        el: myTable
    });
    t.equal(myTable.querySelectorAll('th').length, 3, "should have same number of th's as titles");
    t.equal(myTable.querySelectorAll('td').length, 3 * 3, "should have same number of td's as col * data-points");

    colCollection.add({title: 'new', data: 'id', id: 'd'});
    t.equal(myTable.querySelectorAll('th').length, 4, "should add a new column");

    colCollection.remove('d');
    t.equal(myTable.querySelectorAll('th').length, 3, "should remove a column");

    t.end();
});
