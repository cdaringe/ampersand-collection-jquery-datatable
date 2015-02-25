"use strict";
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
    var myTable = window.myTable = window.document.getElementById('myTable');
    var rowCollection = new Collection();
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
    rowCollection.add(rowCollectionData);
    var colCollection = new Collection();
    colCollection.add([
        {title: 'collection col 1', data: 'a'},
        {title: 'collection col 2', data: 'id'},
        {title: 'collection col 3', data: 'a'},
    ]);
    var cdt = new CollectionTable({
        collections: {
            rows: rowCollection,
            cols: colCollection
        },
        el: myTable
    });

    colCollection.add({title: 'new', data: 'id'});
});
