# ampersand-collection-jquery-datatable
[ ![Codeship Status for cdaringe/ampersand-collection-jquery-datatable](https://codeship.com/projects/21ed5d70-9f55-0132-8711-02db7f3f2d41/status?branch=master)](https://codeship.com/projects/65128)
[![browser support](https://ci.testling.com/cdaringe/ampersand-collection-jquery-datatable.png)
](https://ci.testling.com/cdaringe/ampersand-collection-jquery-datatable.png)

# What

* You use [ampersand.js](https://ampersandjs.com/) (or [backbone.js](http://backbonejs.org/)).
* You use [jQuery DataTables](https://datatables.net/).
* You have an [collection](https://github.com/AmpersandJS/ampersand-collection) that you want to render in a DataTable.
* You want your dataTable to respond to collection events (i.e. `add`, `remove`, `update`), and be displayed immediately, without having to get into the dataTable API on your own.  This library updates DataTable rows and columns as their corresponding collections change.  However, you are technically not required to use collections for either.

How refreshing.

## Usage

```js
var CollectionTable = require('ampersand-collection-jquery-datatable'); // long name :)
// Generate a config of the following form:
var config = {
    el: raw_DOM_node_for_table, // e.g. this.queryByHook('my-table')
    collection: myCollection, // OR ...
    dtOptions: {
        // datatable constructor options
    },
    dtClasses: 'display compact' // sugar for adding some styles
};

...
    // inside a view
    render: function() {
        var myCollDataTable = new CollectionTable(config)
    }
...
```

To see other options, **check the contructor DocBlock**.  The latest should always be maintained here, too:
/**
 * Constructor
 * @param  {options} object {
 *     collection: {AmpersandCollection}, // assumes `rows`, OR use...
 *     collections: {
 *         rows: {AmpersandCollection|Array},
 *         cols: {AmpersandCollection|Array}  // overrides dtOptions.columns. Contained
 *                                            // states should have .title, .data, & .id attr
 *     }
 *     el: {Element},           // dataTable target
 *     dtOptions: {Object},     // dataTable config.  Set the `data` (rows) and `columns` props as reqd
 *     dtClasses: {String=},    // class(es) to be applied to the target element/table
 *     noToolbar: {Boolean=},   // hide the datatable toolbar
 *     renderer:  {Function=}   // delegate a custom function to init the dataTable.
 *                              // renderer receives `($el, modified-dtOptions)`,
 *                              // and should return the result of `$el.DataTables(...)
 * }
 * @return {CollectionDataTable}
 */
```

## api

##### attrs
- `stateNodes` - Access the row DOM node for you state/model by peeking at `yourCollectionTable.stateNodes[yourModel.cid]`


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
# Edge Cases and Warnings

1. **Adding and deleting columns completely destroys the dataTable and rebuilds it**.  Dynamic columns is not officially supported by DataTables, so I scrap and rebuild it as there is no other way at the time of writing.  Be careful adding/deleting many cols with large datasets.  PRs are in work @DataTables for this.
1. Using the `init.dt` event and `initComplete` options may yield unexpected behavior.  Post-initialization of a ACJD, an *empty table is drawn*.  CollectionTable then immediately adds row data, and re-draws.  Your defined `initComplete` is executed then.  The `init.dt` (or similair) event is not rethrown.  PRs are welcome in this regard.
1. Using `deferRender` in `dtOptions` prevents `CollectionTable.stateNodes` from storing valid DOM nodes, as DOM nodes aren't built immediately!
1. To run the tests, if initial run results in an error that complains about phantom/*, see [this](https://github.com/AmpersandJS/ampersand-collection-view/issues/13#issuecomment-51083095)

# Changelog
* 2.0.0 - moved datatables and jquery to package.json dependencies. support DT 1.10.7.
* 1.3.5 - bugfix: do standing draw on update (change), not reset draw
* 1.3.4 - if DT `deferRender` is activated, still be able to locate data to update, regardless if a DOM node is built or not. (handle no node in `cid` store)
* 1.3.1-3 - README updates and remove self-assign from `options.dtOptions` (all pass in of read-only `.dtOptions`)
* 1.3.0 - add dynamic columns, tests, and sandbox
* 1.2.3 - add missing repo field
* 1.2.2 - Carry applied `classes` from old `tr` to new `tr` onchange.  Additional attrs may need consideration as well
* 1.2.1 - Drastically improve `change` on the collection--rows are no longer deleted and re-added.  Instead, the `.data()` setter is used, even if the data pointer is the same as the original, which triggers a view update on that row.
* 1.2.0 - `initComplete` handling update.  initComplete must be called after the table is instantiated due to the way that the table data is populated in CollectionTable.  Additionally, `.$dt` now points to the actual DT instance, and `.$api` points to a `.$dt.api()`.
* 1.1.2 - doc updates only
* 1.1.1 - bugfix & feature.  removing a state would sometimes scrap the full table. improved the indexing by looking up models in table by DOM node via `.stateNodes`
* 1.1.0 - added `.renderer` option.  some users have pre-defined utilities to pipe table options thru prior to initialization

# ToDo

1. Debounce for bulk changes
