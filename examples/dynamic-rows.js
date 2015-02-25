var jQuery = window.jQuery = require('jquery'),
    Collection = require('ampersand-collection'),
    Model = require('ampersand-model'),
    TestModel = Model.extend({ props: {a: 'string', b: 'string'} }),
    CollectionTable = require('../ampersand-collection-jquery-datatable'),
    datatables = require('datatables');

var colDefs = [{title: 'a', data: 'a'}, {title: 'b', name: 'b', data: 'b'}];
var dummyData = [
    new TestModel({a: 'a1', b: 'b1'}),
    new TestModel({a: 'a2', b: 'b2'})
];

window.addEventListener('DOMContentLoaded', function() {
    var $myDt = jQuery('#myTable');
    var TestCollection = Collection.extend({
        indexes: ['a', 'b'],
        model: TestModel
    });
    var dummyCollection = new TestCollection();
    var acjd = new CollectionTable({
        collection: dummyCollection,
        el: $myDt[0],
        dtOptions: {
            columns: colDefs,
            data: dummyData,
            createdRow: function(row, data, ndx) {
                var api = this.api();
                var cell = api.cell({
                    row: ndx,
                    column: api.column('b:name').index()
                });
                console.dir(cell.data());
            },
            initComplete: function() {
                var numNodes = this.api().column(1).nodes().length;
                console.log("yea buddy! initComplete! // " + numNodes + " in table");
            }
        },
    });

    // Test add/remove/update
    var newObj = new TestModel({a: 'new', b: 'new'});
    dummyCollection.add(newObj);  // dataTable responds, adds row!

    // remove obj
    var removeObj = new TestModel({a: 'REMOVE', b: 'REMOVE'});
    dummyCollection.add(removeObj);
    dummyCollection.remove(removeObj); // dataTable responds, removes row!

    // change
    dummyCollection.add({a: 'needs-to-be-updated', b: 'needs-to-be-updated'});
    var toChange = dummyCollection.get('needs-to-be-updated', 'a');
    toChange.a = 'updated-successfully';
    toChange.b = 'updated-successfully';
    // dataTable responds, deletes old row, adds row with new data back in
    // as your model changes.  Note: if your model changes a lot, this is expensive
    // re-drawing.  A debounce may worth implementing, or simply refreshing the row
    // from an updated data source

});
