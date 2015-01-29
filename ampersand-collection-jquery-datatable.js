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
 *     el: {Element}, // dataTable target
 *     dtOptions: {Object}, // dataTable config.  Set the `data` and `columns` props! *     dtClasses: {String=},  // classes to be applied to the target element/table
 *     noToolbar: {Boolean=}
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
    this.dtApi = null;
    this.collection = this.setCollection(options.collection);
    this.dtOptions = options.dtOptions;
    this.dtClasses = options.dtClasses;
    this.el = options.el;
    this.$el = jQuery(this.el);
    this.$dt = null; // built by render
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
    col.on('change', function(m) {
        self.handleCollectionChange(m);
    });
    col.on('add', function(m) {
        self.handleCollectionAdd(m);
    });
    col.on('remove', function(m) {
        self.handleCollectionRemove(m);
    });
};

/**
 * Adds row to table corresponding to model added
 * @param  {Model} model
 * @return {CollectionDataTable} this
 */
CollectionDataTable.prototype.handleCollectionAdd = function(model, options) {
    options = options || {};
    if (!this.$dt) { return this; }
    this.$dt.row.add(model).draw();
    if (!options.delayDraw) { this.$dt.draw(); }
    return this;
};

CollectionDataTable.prototype.handleCollectionChange = function(model, options) {
    options = options || {};
    if (!this.$dt) { return this; }
    this.handleCollectionRemove(model, {delayDraw: true});
    this.handleCollectionAdd(model, options);
    return this;
};

CollectionDataTable.prototype.handleCollectionRemove = function(model, options) {
    options = options || {};
    if (!this.$dt) { return this; }
    this.$dt
        .row(function(idx, data, node) {
            return (data.cid === model.cid) ? true : false;
        })
        .remove();
    if (!options.delayDraw) { this.$dt.draw(); }
    return this;
};



/**
 * Render/re-draw the the DataTable
 * @param  {Collection} r Ampersand Collection
 * @return {this}
 */
CollectionDataTable.prototype.render = function (data) {
    var self = this;
    var tableOps;

    if (data && data.models) {
        data = data.models;
    }
    tableOps = _.extend({data: data}, this.dtOptions);
    this.$el.addClass(this.dtClasses);
    this.$dt = this.$el.DataTable(tableOps);
    if (this.noToolbar) {
        this.$el.find('.dataTables_wrapper .ui-toolbar').hide();
    }
    return this;
};

module.exports = CollectionDataTable;

})();
