var test = require('tape'); // jshint ignore:line
var jQuery = require('jquery');
var $ = window.jQuery = jQuery;
var prettyHTML = require('js-beautify').html; // debug ref: console.dir(prettyHTML(myTable.innerHTML));
require('datatables');
var Model = require('ampersand-model');
var TestModel = Model.extend({ props: {id: 'any', a: 'string'}});

var Collection = require('ampersand-collection');
var MyCollection = Collection.extend({
    model: TestModel,
    indexes: ['a']
});
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
    rowCollection = new MyCollection();
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
    t.equal(cdt.$api.rows()[0].length, rowCollection.length, "should have same number of table nodes as data nodes ");
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
    t.equal(cdt.$api.cells()[0].length, 2 * rowCollection.length, "should have same number of td's as data nodes (2 col * rows)");
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
    beforeRows = cdt.$api.rows()[0].length;
    rowCollection.add(dummyItem);
    afterRows = cdt.$api.rows()[0].length;
    t.equal(beforeRows + 1, afterRows, 'should add an extra row when adding data to collection');
    rowCollection.remove('one extra');
    afterRows = cdt.$api.rows()[0].length;
    t.equal(beforeRows, afterRows, 'should remove a row when removing data from the collection');
    t.end();
});


test('add/delete/change a collection item when it has no node', function (t) {
    setup();
    var i = 0;
    var manyDummies = [];
    // build large table, where row nodes won't be drawn off-the-bat
    var dummyItem = function() {
        return {id: i++, a: 'a' + i, b: 'b' + i, c: 'c' + i};
    };
    for (var k=0; k < 100; ++k) {
        manyDummies.push(dummyItem());
    }
    rowCollection.reset();
    rowCollection.add(manyDummies);
    var cdt = new CollectionTable({
        collection: rowCollection,
        el: myTable,
        dtOptions: {
            columns: [
                {title: "ABC's", data: 'id'},
                {title: "BFC's", data: 'a'} // big flippin calzones :)
            ],
            deferRender: true
        }
    });

    rowCollection.add(dummyItem());
    t.equal(rowCollection.length, 101, 'should add an extra row when adding data to collection (deferred mode)');

    rowCollection.remove(rowCollection.get(50));
    t.equal(rowCollection.length, 100, 'should remove dummy from collection (deferred mode)');

    // update node currently displayed in table on change
    rowCollection.get('a1', 'a').a = 'CHANGED'; // should update the datatable
    var node = cdt.$api.row(function(tr, data, node) {
        return data.a === 'CHANGED';
    }).node();
    var found = !!node.innerHTML.match(/CHANGED/);
    t.equal(found, true, "should update in deferedMode if node is shown");

    // update node data for node not currently displayed in table, confirm update and node doesn't exist
    rowCollection.get('a100', 'a').a = 'CHANGED2'; // should update the datatable
    node = cdt.$api.row(function(tr, data, node) {
        if (data.a === 'CHANGED2') {
            t.ok(!node, 'should not have a node if deferRender on and node not in table');
        }
        return false;
    });
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
    t.equal(myTable.querySelectorAll('td').length, 3 * rowCollection.length, "should have same number of cells as (columns * data-points)");

    colCollection.add({title: 'new', data: 'id', id: 'd'});
    t.equal(myTable.querySelectorAll('th').length, 4, "should add a new column");

    colCollection.remove('d');
    t.equal(myTable.querySelectorAll('th').length, 3, "should remove a column");

    t.end();
});

test('no mutations for non-collection inputs');
