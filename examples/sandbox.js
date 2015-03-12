"use strict";
// beefy examples/sandbox.js:sandbox.js --cwd examples
var jQuery = window.jQuery = require('jquery'),
    Model = require('ampersand-model'),
    TestModel = Model.extend({
        props: {
            id: 'any',
            a: 'any',
            b: 'any'
        }
    }),
    Collection = require('ampersand-collection'),
    TestCollection = Collection.extend({
        model: TestModel,
        indexes: ['a']
    }),
    CollectionTable = require('../ampersand-collection-jquery-datatable'),
    datatables = require('datatables');

var dummyData = [
    new TestModel({id: 1, a: 'a1', b: 'b1'}),
    new TestModel({id: 2, a: 'a2', b: 'b2'})
];

window.addEventListener('DOMContentLoaded', function() {
    var myTable = window.myTable = window.document.getElementById('myTable');
    var rowCollection = new TestCollection();


    /**
     * Output in ms the speed diff it takes get and change 1000 records in the table
     * using deferRender or not.  It should be FASTER with deferOff because we cache
     * the node, thus it should be faster to get the node and redraw as needed
     * @return {ms}
     */
    var testDeferredChangePerformance = function() {
        var deferOff = _testDeferredChangePerformance(false, 200, true);
        var deferOn = _testDeferredChangePerformance(true, 200);
        var rslt = deferOn - deferOff;
        console.log('deferRender: false is ' + rslt + ' ms faster');
        return rslt;
    };
    var _testDeferredChangePerformance = function(deferOn, iterations, destroyAtEnd) {
        var i = 0;
        var manyDummies = [],
            time;
        // build large table, where row nodes won't be drawn off-the-bat
        var dummyItem = function() {
            var rslt = {id: i, a: 'a' + i, b: 'b' + i, c: 'c' + i};
            ++i;
            return rslt;
        };
        for (var k=0; k < iterations; ++k) {
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
                ]
            },
            deferRender: deferOn
        });

        // update node currently displayed in table on change
        var start;
        start = new Date();
        for (var j = 0; j < iterations; j++) {
            rowCollection.get('a' + j, 'a').a = 'CHANGED'; // should update the datatable
        }
        time = (new Date()) - start;
        if (destroyAtEnd) {
            cdt.$api.destroy();
            myTable.innerHTML = '';
        }
        return time;
    };

    // testDeferredChangePerformance();

});
