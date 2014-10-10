/*
 * CODENVY CONFIDENTIAL
 * __________________
 *
 *  [2012] - [2014] Codenvy, S.A.
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Codenvy S.A. and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Codenvy S.A.
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Codenvy S.A..
 */
if (typeof analytics === "undefined") {
    analytics = {};
}

analytics.view = new View();

function View() {

    var viewHtml;

    var widget;
    
    var params;

    var ABORT_LOADING_MESSAGE = "<i>Loading has been aborted.</i>";
    var INTERRUPT_LOADING_MESSAGE = "<i>Loading has been interrupted.</i>";

    function printTable(table, isDisplaySpecificFirstCell, tableId, additionalTableCssClass) {
        print("<div class='table-container'>");
        
        // set text align = right in cells by default
        var additionalTableCssClass = additionalTableCssClass || "text-aligned-right";
        
        if (typeof tableId == "undefined") {
            print('<table cellspacing="0" class="database-table ' + additionalTableCssClass + '" align="center">');
        } else {
            print('<table cellspacing="0" class="database-table ' + additionalTableCssClass + '" align="center" id="' + tableId + '">');
        }
        
        print('<thead aria-hidden="false">');
        print('<tr>');
    
        // print first cell of header
        if (table.columns.length > 0) {
            var value = table.columns[0] || "&nbsp;";   // add space to be able to display icons in the empty cell of first column of header 
            print('<th class="header">');
            print("<div>" + value + "</div>");
            print('</th>');
        }
    
        // print other cells of header    
        for (var i = 1; i < table.columns.length; i++) {
            print('<th class="header">');
            print("<div>" + table.columns[i] + "</div>");
            print('</th>');
        }
        print('</tr>');
        print('</thead>');
    
        // print table body
        print('<tbody>');
        for (var i = 0; i < table.rows.length; i++) {
            // print odd row
            print('<tr>');
    
            var firstCellClass = "cell";
            if (typeof isDisplaySpecificFirstCell != "undefined" && isDisplaySpecificFirstCell) {
                firstCellClass += " first-cell text-cursor";
            }
    
            if (typeof table.columns_original != "undefined"
                && analytics.configuration.isTextColumnName(table.columns_original[0])) {
                firstCellClass += " text";
            }
            
            // print first cell
            print('<td class="' + firstCellClass + '">');
            print(table.rows[i][0]);
            print('</td>');
    
            // print another cells
            for (var j = 1; j < table.columns.length; j++) {
                var cellCssClass = "cell";
                if (typeof table.columns_original != "undefined"
                    && analytics.configuration.isTextColumnName(table.columns_original[j])) {
                    cellCssClass += " text";
                }
                print('<td class="' + cellCssClass + '">');
                print(table.rows[i][j]);
                print('</td>');
            }
            print('</tr>');
        }
    
        print('<tfoot aria-hidden="true" style="display: none;"></tfoot>');
        print('</tbody>');
        print('</table>');
        print("</div>");
    };
    
    function printCsvButton(csvButtonLink) {
        var csvButtonLabel = "CSV";
        
        print("<div class='small-links-block'>");
        print("  <a href='" + csvButtonLink + "' target='_blank'>");
        print(csvButtonLabel);
        print("  </a>");
        print("</div>");
    }
    
    function printWidgetHeader(widgetLabel, csvButtonLink) {
        if (typeof csvButtonLink != "undefined") {        
            printCsvButton(csvButtonLink);
        }
        
        print("<div class='header'>");
        print(widgetLabel);
        print("</div>");
    }
    
    function printTableVerticalRow(table) {     
        print('<table cellspacing="0" class="database-table-vertical-row" align="center">');
        print('<tbody>');
    
        // print other cells name + cell
        for (var i = 0; i < table.columns.length; i++) {
            print("<tr>");
            print("<th class='cell-name'>");
            print(table.columns[i] + ":");
            print("</th>");

            print("<td class='cell'>");
            if (typeof table.rows != "undefined"
                    && typeof table.rows[0] != "undefined"
                    && typeof table.rows[0][i] != "undefined") {

                print(table.rows[0][i]);

            }
            print("</td>");
            print("</tr>");
        }
    
        print('</tbody>');
        print('</table>');
    }   
        
    /**
     * Load handlers of table events.
     * Default value of displaySorting is true.
     */
    function loadTableHandlers(displaySorting, sortingParams, tableId) {
        var sortingParams = sortingParams || {};
        if (typeof displaySorting == "undefined") {
            displaySorting = true;
        }
        
        print("<script>");
        print("  jQuery(function() { ");
        print("       analytics.views.databaseTable.setupHorizontalTableRowHandlers("
                + displaySorting + ", '"
                + JSON.stringify(sortingParams) + "', '"
                + tableId + "');");
        print("       analytics.views.databaseTable.setupVerticalTableRowHandlers();");
        print("  });");
        print("</script>");
    }
    
    /**
     * Prints page navigator, meets the requirements: '<<','<' and '>'.
     * CurrentPageNumber is 1-based. 
     */
    function printBottomPageNavigator(pageCount, currentPageNumber, params, pageQueryParameter, widgetName) {   
        // remove old page number
        var params = analytics.util.clone(params);
        delete params[widgetName];  
        delete params.page;
        var queryString = "";
        if (!jQuery.isEmptyObject(params)) {
            queryString += "?" + analytics.util.constructUrlParams(params);
        }
        
        print('<link href="/analytics/css/page-navigator.css" rel="stylesheet" type="text/css" />');
        print("<div class='bottom-page-navigator'>");

        var isEmptyFirstPageLink = (currentPageNumber == 1);
        var isEmptyLastPageLink = (pageCount != null 
                                   && currentPageNumber >= pageCount);
        
        var firstPageLinkHtml = getFirstPageNavigationLinkHtml(queryString,              
                                                 pageQueryParameter,
                                                 widgetName,
                                                 isEmptyFirstPageLink);
        
        var previousPageLinkHtml = getPreviousPageNavigationLinkHtml(queryString, 
                                                           currentPageNumber, 
                                                           pageQueryParameter, 
                                                           widgetName, 
                                                           isEmptyFirstPageLink);
        
        var currentPageHtml = "<div class='empty'>" + currentPageNumber + "</div>";
        
        var nextPageLinkHtml = getNextPageNavigationLinkHtml(queryString, 
                                                   currentPageNumber, 
                                                   pageQueryParameter, 
                                                   widgetName, 
                                                   isEmptyLastPageLink);
        
        print(firstPageLinkHtml);
        print(previousPageLinkHtml);
        print(currentPageHtml);
        print(nextPageLinkHtml);
        
        print("</div>");
    }
    
    function getFirstPageNavigationLinkHtml(queryString, pageQueryParameter, widgetName, isEmptyLink) {
        if (typeof isEmptyLink == "undefined") {
            isEmptyLink = false;
        }
        
        var label = "&lt;&lt;";
        var firstPageNumber = 1;        
        
        if (isEmptyLink) {
            return "<div class='empty'>" + label + "</div>";
            
        } else {
            return getPageNavigationHtml(queryString, firstPageNumber, pageQueryParameter, widgetName, label);
        }
    }
    
    function getPreviousPageNavigationLinkHtml(queryString, currentPageNumber, pageQueryParameter, widgetName, isEmptyLink) {
        if (typeof isEmptyLink == "undefined") {
            isEmptyLink = false;
        }
        
        var label = "&lt;";
        var previousPageNumber = (currentPageNumber * 1 - 1) || 1;  // if currentPageNumber is NaN, then result will be 1        
        
        if (isEmptyLink) {
            return "<div class='empty'>" + label + "</div>";
            
        } else {
            return getPageNavigationHtml(queryString, previousPageNumber, pageQueryParameter, widgetName, label);
        }
    }
    
    function getNextPageNavigationLinkHtml(queryString, currentPageNumber, pageQueryParameter, widgetName, isEmptyLink) {
        if (typeof isEmptyLink == "undefined") {
            isEmptyLink = false;
        }
        
        var label = "&gt;";
        var nextPageNumber = (currentPageNumber * 1 + 1) || 1;  // if currentPageNumber is NaN, then result will be 1 
        
        if (isEmptyLink) {
            return "<div class='empty'>" + label + "</div>";
            
        } else {
            return getPageNavigationHtml(queryString, nextPageNumber, pageQueryParameter, widgetName, label);
        }
    }
    
    function getPageNavigationHtml(queryString, pageNumber, pageQueryParameter, widgetName, label) {
        var href = getPageNavigationUrl(queryString, pageNumber, pageQueryParameter);
        var onClickHandler = "analytics.main.reloadWidgetByUrl(\"" + href + "\",\"" + widgetName + "\"); return false;";
        
        return "<a class='page-link' href='" + href + "' onclick='" + onClickHandler + "' title='Go to page " + pageNumber + "'>" + label + "</a>";
    }
    
    function getPageNavigationUrl(baseQueryString, pageNumber, pageQueryParameter) {
        var paramDelimeter = "&";
        if (baseQueryString.indexOf("?") < 0) {
            paramDelimeter = "?";
        }
    
        var url = baseQueryString + paramDelimeter + pageQueryParameter + "=" + pageNumber;
    
        return url;
    }

    /**
     * Print table and line chart in the separate tabs
     */
    function printTableAndChart(table, initialTable) {
        var chartLabel = initialTable.columns[0];
        var columnLabels = initialTable.columns.slice(1); // don't include label of first column
        printLineChart(initialTable.rows, columnLabels, chartLabel);

        printTable(table, true);
    }
    
    function printLineChart(rows, columnLabels, chartLabel) {
        var chartId = "line-chart-" + analytics.util.getRandomNumber();
        print("<div class='chart-container'>");
        print("<div class='chart-label'>" + chartLabel + "</div>");
        print("<div class='line-chart' id='" + chartId + "'></div>");
        print("</div>");
        
        // display chart after the loading container        
        analytics.views.lineChart.push({
            columns: rows,
            columnLabels: columnLabels, 
            chartId: chartId
        });
    }

    
    /**
     * Uses jQuery element widget linked with target container
     */
    function print(html) {
        viewHtml += html;
    }
    
    function setWidget(newWidget) {
        widget = newWidget;
    };
    
    function setParams(newParams) {
        params = newParams;
    };   

    function getParams() {
        return params;
    };    
    
    function clear() {
        widget.empty();
        viewHtml = "";
    };
    
    function show() {
        widget.html(viewHtml);
    };
    
    function showAbortMessage() {
        print(ABORT_LOADING_MESSAGE);
        show();
    };

    function showInterruptMessage() {
        print(INTERRUPT_LOADING_MESSAGE);
        show();
    };
    
    function showErrorMessage(status, textStatus, errorThrown) {
        if (status == 500) {
            print("<div class='internalServerErrorMessage'>The data cannot be calculated.</div>");            
        } else {
            print("<i>Error of loading data</i>: (" + status + ") '" + errorThrown + "'.");
        }
        
        show();
    };

    function getSystemMessageLabel(message) {
        return "<div class='system'>(" + message + ")</div>";
    }
    
    /**
     * Update UI according to the user UI preferences
     */
    function implementUIPreferences() {
        // verify if there is UI preferences button group at the current page
        if (! $("#ui-preferences").doesExist()) {
            return;
        }
        
        var uiPreferences = analytics.util.getGlobalParamFromStorage('ui_preferences');
        
        switch (uiPreferences) {
            case "table":
                displayAllTables();
                hideAllCharts()
                break;
            
            case "chart":
                hideAllTables();
                displayAllCharts();
                break;
                
            case "table&chart":
                displayAllTables();
                displayAllCharts();
                break;
            
            default:
                displayAllTables();
                hideAllCharts()
                break;
        }
    }
    
    function displayAllTables() {
        var allTables = $(".table-container");        
        for (var i = 0; i < allTables.length; i++) {
            jQuery(allTables[i]).show();            
        }
    }

    function hideAllTables() {
        var allTables = $(".table-container");        
        for (var i = 0; i < allTables.length; i++) {
            jQuery(allTables[i]).hide();            
        }
    }
    
    function displayAllCharts() {
        analytics.views.lineChart.displayAll();
        var allCharts = $(".chart-container");        
        for (var i = 0; i < allCharts.length; i++) {
            jQuery(allCharts[i]).show();            
        }
    }
    
    function hideAllCharts() {
        var allCharts = $(".chart-container");        
        for (var i = 0; i < allCharts.length; i++) {
            jQuery(allCharts[i]).hide();            
        }
    }

    /**
     * Update table according to the data preferences
     */
    function implementDataPreferences() {
        // verify if there is UI preferences button group at the current page
        if (! $("#data-preferences").doesExist()) {
            return;
        }

        var dataPreferences = analytics.util.getGlobalParamFromStorage('data_preferences');

        switch (dataPreferences) {
            case "mean":
                //displayMean();
                break;

            case "median":
                //displayMedian();
                break;

            case "mode":
                //displayMode();
                break;

            case "data":
            default:
                //displayData();
                break;
        }
    }
    
    /** ****************** API ********** */
    return {
        setWidget: setWidget,
        setParams: setParams,
        getParams: getParams,
        clear: clear,
        show: show,
        print: print,
        getSystemMessageLabel: getSystemMessageLabel,
        
        // table
        printTable: printTable,
        loadTableHandlers: loadTableHandlers,
        printTableVerticalRow: printTableVerticalRow,

        // widget header
        printWidgetHeader: printWidgetHeader,
        
        // page navigation
        printBottomPageNavigator: printBottomPageNavigator,

        // line chart
        printTableAndChart: printTableAndChart,
        printLineChart: printLineChart,
        
        // server ajax error messages
        showAbortMessage: showAbortMessage,
        showInterruptMessage: showInterruptMessage,
        showErrorMessage: showErrorMessage,

        implementUIPreferences: implementUIPreferences,
        implementDataPreferences: implementDataPreferences
    }
}
