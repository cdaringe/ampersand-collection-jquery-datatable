var colDefs = [
    {title: 'suuuuuuuuuuuuuper_long_title_1', data: 'a'},
    {title: 'suuuuuuuuuuuuuper_long_title_2', data: 'a'},
    {title: 'suuuuuuuuuuuuuper_long_title_3', data: 'a'},
    {title: 'suuuuuuuuuuuuuper_long_title_4', data: 'a'},
    {title: 'suuuuuuuuuuuuuper_long_title_5', data: 'a'},
    {title: 'suuuuuuuuuuuuuper_long_title_6', data: 'a'},
    {title: 'suuuuuuuuuuuuuper_long_title_7', data: 'a'},
    {title: 'suuuuuuuuuuuuuper_long_title_8', data: 'a'},
    {title: 'suuuuuuuuuuuuuper_long_title_9', data: 'a'},
    {title: 'suuuuuuuuuuuuuper_long_title_10', data: 'a'}
];

var dummyData = [
    {a: 'bananas'},
    {a: 'oranges'},
    {a: 'pineapps'},
    {a: 'cereal'},
    {a: 'salad'}
];

$(document).ready(function(){
    var $myDt = jQuery('#myTable');
    var dtOptions = {
        data: dummyData,
        columns: colDefs,
        responsive: true
    };
    window.$dtApi = $myDt.DataTable(dtOptions);

    var $showPaneBtn = jQuery('[data-hook="show-pane"]').on('click', function() {
        jQuery('#cell_pane').show();
    });

    var $hidePane = jQuery('[data-hook="hide-pane"]').on('click', function() {
        jQuery('#cell_pane').hide();
    });

});
