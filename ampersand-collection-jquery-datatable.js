/**
 * Permits the execution of normal ampersand collection operations to act onto
 * a jquery dataTable vs. a standard view
 * @return {Function} table constructor
 */
(function initAmpersandCollectionJqueryDatatable(undefined) {
"use strict";

var _ = require('underscore');

var jQuery = window.jQuery || require('jquery');

/**
 * Constructor
 * @param  {options} object {
 *     collection: {AmpersandCollection} // ampersand collection,
 *     el: {Element},           // dataTable target
 *     dtOptions: {Object},     // dataTable config.  Set the `data` and `columns` props!
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
    if (!options.collection || !options.collection.isCollection) {
        throw new TypeError("Expected AmpersandCollection, received " + options.collection);
    }
    if (!options.el) {
        throw new TypeError("Expected element to bind jquery dataTable to, received: " + options.el);
    }

    if (options.jquery) {
        // permit user to override default jquery with their own
        jQuery = options.jquery;
    }
    this.collection = this.setCollection(options.collection);
    this.stateNodes = {}; // tracks the DOM nodes of the row
    this.dtOptions = options.dtOptions;
    this.dtClasses = options.dtClasses;
    this.el = options.el;
    this.renderer = options.renderer;
    this.$el = jQuery(this.el);
    this.$dt = null;
    this.$api = null; // built by render
    this.render(this.collection);
}



/**
 * Sets the collection for the table and binds event listeners
 * for the table to respond to collection changes
 * @param {Collection} col AmpersandCollection
 */
CollectionDataTable.prototype.setCollection = function(col) {
    var self = this;
    this.collection = col;
    this.collection.on('change', function(m) {
        self.handleCollectionChange(m);
    });
    this.collection.on('add', function(m) {
        self.handleCollectionAdd(m);
    });
    this.collection.on('remove', function(m) {
        self.handleCollectionRemove(m);
    });
    return this.collection;
};

/**
 * Adds row to table corresponding to model added
 * @param  {Model} model
 * @return {CollectionDataTable} this
 */
CollectionDataTable.prototype.handleCollectionAdd = function(model, options) {
    options = options || {};
    if (!this.$api) { return this; }
    this.stateNodes[model.cid] = this.$api.row.add(model).node();
    if (!options.delayDraw) { this.$api.draw(); }
    return this;
};

CollectionDataTable.prototype.handleCollectionChange = function(model, options) {
    options = options || {};
    if (!this.$api) { return this; }
    this.$api
        .row(this.stateNodes[model.cid])
        .data(model)
        .draw(); // I don't need to explicity call draw for my cases,
                 // however, the docs say otherwise
    return this;
};

CollectionDataTable.prototype.handleCollectionRemove = function(model, options) {
    options = options || {};
    if (!this.$api) { return this; }
    this.$api.row(this.stateNodes[model.cid]).remove();
    delete this.stateNodes[model.cid];
    if (!options.delayDraw) { this.$api.draw(); }
    return this;
};



/**
 * Render/re-draw the the DataTable
 * @param  {Collection} r Ampersand Collection
 * @return {this}
 */
CollectionDataTable.prototype.render = function (data) {
    var self = this,
        addOps = {delayDraw: true},
        initCompleteDelayed, initCompleteArgs,
        tableOps,
        state;

    if (data && data.models) {
        data = data.models;
    }

    // Stage initComplete, and execute it post individual row adds
    if (!this.initCompleteFired && this.dtOptions.initComplete) {
        initCompleteDelayed = this.dtOptions.initComplete;
    }

    tableOps = _.extend({}, this.dtOptions);
    tableOps.initComplete = function captureInitCompleteArgs() { initCompleteArgs = _.toArray(arguments); };

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
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            state = data[i];
            this.handleCollectionAdd(state, addOps);
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
