# ampersand-collection-jquery-datatable

# What

* You use [ampersand.js](https://ampersandjs.com/).
* You use [jQuery DataTables](https://datatables.net/).
* You have an [ampersand collection](https://github.com/AmpersandJS/ampersand-collection) that you rendered into a dataTable.
* You want your dataTable to respond to collection events (i.e. `add`, `remove`, `update`), and be displayed immediately, without having to get into the dataTable API on your own.

How refreshing.

# How

## Pre-conditions
* You should already have jQuery on the window or in your dependencies
* You should already have the DataTables plugin loaded onto jQuery

## Process
Feel free to take a peek at the `src/examples/dynamic-rows.js` && `sandbox/dynamic-rows.html` files.

The process is generally:

1. Generate a config object, e.g. `var config = {};`
1. Set an `el` property, where `config.el = raw_DOM_node_for_table;`  e.g `config.el = window.document.getElementById('my_table')`;
1. Set a `collection` property, where the value is some type of `ampersand-collection`
1. Add any table options that you would normally use for the DataTable to `.dtOptions`
1. Add any styles you would like to add to the table element to `.dtClasses` e.g. `display compact`
1. `var CDT = require('ampersand-collection-jquery-datatable')` (sorry for the long name!), and construct via `var myCollDataTable = new CDT(confg)`
1. To see other options, **check the contructor DocBlock**.  The latest should always be maintained here:

```js
/**
 * Constructor
 * @param  {options} object {
 *     collection: {AmpersandCollection} // ampersand collection,
 *     el: {Element}, // dataTable target
 *     dtOptions: {Object}, // dataTable config.  Set the `data` and `columns` props!
 *     dtClasses: {String=}, // classes to be applied to the target element/table
 *     noToolbar: {Boolean=}
 * }
 * @return {CollectionDataTable}
 */
```

# Full Example
```js
var jQuery = window.jQuery = require('jquery'),
    Collection = require('ampersand-collection'),
    Model = require('ampersand-model'),
    TestModel = Model.extend({ props: {a: 'string', b: 'string'} }),
    CollectionTable = require('../../ampersand-collection-jquery-datatable'),
    datatables= require('datatables'),
    domready = require('domready');

var colDefs = [{title: 'a', data: 'a'}, {title: 'b', data: 'b'}];
var dummyData = [
    new TestModel({a: 'a1', b: 'b1'}),
    new TestModel({a: 'a2', b: 'b2'})
];

domready(function() {
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
            data: dummyData,
            columns: colDefs
        }
    });

    // Test add/remove/update
    var newObj = new TestModel({a: 'new', b: 'new'});
    dummyCollection.add(newObj);  // dataTable responds, adds row!

    // remove obj
    var removeObj = new TestModel({a: 'REMOVE', b: 'REMOVE'});
    dummyCollection.add(removeObj);
    dummyCollection.remove(removeObj); // dataTable responds, removes row!

    // change
    dummyCollection
        .add({a: 'needs-to-be-updated', b: 'needs-to-be-updated'});
    var toChange = dummyCollection.get('nees-to-be-updated', 'a');
    toChange.a = 'updated-successfully';
    toChange.b = 'updated-successfully';
    // dataTable responds, deletes old row, adds row with new data back in
    // as your model changes.  Note: if your model changes a lot, this is expensive
    // re-drawing.  A debounce may worth implementing, or simply refreshing the row
    // from an updated data source

});
```
# Gotchas

1. Dynamic columns is not yet supported by DataTables (sorry!).  It will likely be in a 10.4/5/X or 11.X release?
1. `change` updates are *slow* as they delete your row, re-add it, and re-draw.  Know that if you are changing your models often, you may want a mitigation strategy, or to add a debounce to this lib!  The code is simple :).

# ToDo

1. Some tests, really.
1. Debounce for bulk changes
