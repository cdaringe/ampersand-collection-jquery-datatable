// ampersand-collection-jquery-datatable.js
/**
 * Permits the execution of normal ampersand collection operations to act onto
 * a jquery dataTable vs. a standard view
 * @return {Function} table constructor
 */
(function initAmpersandCollectionJqueryDatatable(undefined) {
"use strict";

var _ = require('underscore');
var jQuery = window.jQuery;
/**
 * Constructor
 * @param  {options} object {
 *     collection: {AmpersandCollection}, // assumes `rows`, OR use...
 *     collections: {
 *         rows: {AmpersandCollection|Array},
 *         cols: {AmpersandCollection|Array}  // overrides dtOptions.columns. Contained
 *                                            // states should have .title, and likely a .data & .id
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
function CollectionDataTable (options) {
    var self = this;
    if (!options || !_.isObject(options)) {
        throw new TypeError("Expected options object, received " + options);
    }
    this.dtOptions = options.dtOptions || {};

    if (options.jquery) {
        // permit user to override default jquery with their own
        jQuery = options.jquery;
    }
    this.setEl(options.el);

    if (!options.collection && !options.collections) {
        throw new TypeError("Expected collection or collections property");
    }
    if (options.collection) {
        if (!options.collection.isCollection) {
            throw new TypeError("Expected AmpersandCollection, received " + options.collection);
        }
        this.rowCollection = this.setRowCollection(options.collection);
    }

    if (options.collections) { this.initCollections(options.collections); }

    if (!this.dtOptions.data && !this.rowCollection && !this.rowArray) {
        throw new TypeError("no initial row data or row data container provided");
    }

    if (!this.dtOptions.columns && !this.colCollection && !this.colArray) {
        throw new TypeError("no initial col data or col data container provided");
    }

    this.rowStateNodes = {}; // tracks the DOM nodes of the row
    this.dtClasses = options.dtClasses;
    this.renderer = options.renderer;
    this.$dt = null;
    this.$api = null; // built by render
    this.render();
}



/**
 * Initialize passed collections for the table
 * @param  {Object} collections hash of .rows & .cols props, values of Ampersand-Collection
 * @return {undefined}
 */
CollectionDataTable.prototype.initCollections = function(collections) {
    var cols, rows;
    // init collections.cols
    cols = collections.cols;
    if (cols) {
        if (cols.isCollection) {
            this.colCollection = this.setColCollection(cols);
        } else if (_.isArray(cols)) {
            this.colArray = cols;
        } else {
            throw new TypeError("Expected cols as AmpersandCollection or Array");
        }
    }

    // init collections.rows
    rows = collections.rows;
    if (rows) {
        if (rows.isCollection) {
            this.rowCollection = this.setRowCollection(rows);
        } else if (_.isArray(rows)) {
            this.rowArray = rows;
        } else {
            throw new TypeError("Expected rows as AmpersandCollection or Array");
        }
    }
};



/**
 * Sets the element and associated meta for the table
 * @param {Element} el
 */
CollectionDataTable.prototype.setEl = function(el) {
    if (!el) {
        throw new TypeError("Expected element, received: " + el);
    }
    this.el = el;
    this.$el = jQuery(this.el);
    this.initOuterHTML = this.el.outerHTML;
};



/**
 * Sets the row collection for the table and binds event listeners
 * for the table to respond to collection changes
 * @param {Collection} collection AmpersandCollection
 */
CollectionDataTable.prototype.setRowCollection = function(collection) {
    var self = this;
    this.rowCollection = collection;
    this.rowCollection.on('change', function(m, coll, mode) {
        self.handleRowCollectionChange(m, coll, mode);
    });
    this.rowCollection.on('add', function(m, coll, mode) {
        self.handleRowCollectionAdd(m, coll, mode);
    });
    this.rowCollection.on('remove', function(m, coll, mode) {
        self.handleRowCollectionRemove(m, coll, mode);
    });
    return this.rowCollection;
};


/**
 * Sets a column collection for the table and binds event listeners
 * for the table to respond to collection changes
 * @param {Collection} collection AmpersandCollection
 */
CollectionDataTable.prototype.setColCollection = function(collection) {
    var self = this;
    this.colCollection = collection;
    this.colCollection.on('add remove', function(m) {
        if (!self.$api) { return self; }
        self.$api.destroy();
        self.el.innerHTML = '';
        self.render();
    });
    return this.colCollection;
};

/**
 * Adds row to table corresponding to model added
 * @param  {Model} model
 * @return {CollectionDataTable} this
 */
CollectionDataTable.prototype.handleRowCollectionAdd = function(model, options) {
    options = options || {};
    if (!this.$api) { return this; }
    this.rowStateNodes[model.cid] = this.$api.row.add(model).node();
    if (!options.delayDraw) { this.$api.draw(false); }
    return this;
};

CollectionDataTable.prototype.handleRowCollectionChange = function(model, options) {
    options = options || {};
    if (!this.$api) { return this; }
    var node = this.dtOptions.deferRender ? options.node : this.rowStateNodes[model.cid];
    var $node;
    var priorClasses;
    if (node) {
        $node = jQuery(node);
        priorClasses = $node.attr("class");
    }

    // allow data to be re-drawn, regardless if the node is generated or not
    if (this.dtOptions.deferRender) {
        // significantly slower in large datasets
        this.$api
            .row(function(idx, data, node) {
                return data === model;
            })
            .invalidate()
            .draw(false);
    } else {
        this.$api
            .row(node)
            .invalidate()
            .draw(false);
    }

    if (node) {
        // restore prior class styling
        this.$el.one('draw.dt', function () {
            $node.attr("class", priorClasses);
        });
    }
    return this;
};

CollectionDataTable.prototype.handleRowCollectionRemove = function(model, options) {
    options = options || {};
    if (!this.$api) { return this; }
    // remove row.  if deferRender is on, search through table to find row
    // otherwise, we know the exact node to delete
    if (this.dtOptions.deferRender) {
        this.$api.row(function(idx, data, node) {
            return data === model;
        }).remove();
    } else {
        this.$api.row(this.rowStateNodes[model.cid]).remove();
    }
    delete this.rowStateNodes[model.cid];
    if (!options.delayDraw) { this.$api.draw(false); }
    return this;
};



/**
 * Render/re-draw the the DataTable
 * @return {this}
 */
CollectionDataTable.prototype.render = function () {
    var self = this,
        addOps = {delayDraw: true},
        initCompleteDelayed, initCompleteArgs,
        tableOps, state, cols, data;


    // Stage initComplete, and execute it post individual row adds
    if (!this.initCompleteFired && this.dtOptions.initComplete) {
        initCompleteDelayed = this.dtOptions.initComplete;
    }

    // Duplicate table options, prevent input from mutation
    tableOps = _.extend({}, this.dtOptions);
    tableOps.initComplete = function captureInitCompleteArgs() { initCompleteArgs = _.toArray(arguments); };

    // Set table rows
    if (this.rowCollection) {
        data = this.rowCollection.models;
    } else if (this.rowArray) {
        data = this.rowArray;
    }

    // Set table cols if specified in the `collections.cols` prop
    if (this.colCollection) {
        cols = this.colCollection.models;
    } else if (this.colArray) {
        cols = this.colArray;
    }
    if (cols) {
        tableOps.columns = cols;
    }

    // Style table and render it
    this.$el.addClass(this.dtClasses);
    if (!this.renderer) {
        this.$api = this.$el.DataTable(tableOps);
    } else {
        this.$api = this.renderer(this.$el, tableOps);
        if (!this.$api) {
            throw new Error('renderer did not provide a DataTable instance');
        }
    }
    this.$dt = this.$el.dataTable();

    // Add all state/models in one-by-one to track their nodes
    if (data) {
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                state = data[i];
                this.handleRowCollectionAdd(state, addOps);
            }
        }
    }
    this.$api.draw();

    // Execute initComplete, mimicking native functionality
    if (this.dtOptions.initComplete) {
        this.initCompleteFired = true;
        initCompleteDelayed.apply(this.$dt, initCompleteArgs);
    }

    if (this.noToolbar) {
        this.$el.find('.dataTables_wrapper .ui-toolbar').hide();
    }
    return this;
};

module.exports = CollectionDataTable;

})();
