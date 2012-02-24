﻿/// <reference path="jquery-1.4.4-vsdoc.js" />

(function ($) {
    $.fn.extend({
        mvccontribGrid: function (options) {
            var defaults = {
                url: null,
                selectedClass: "ui-state-highlight", /*ui-state-highlight, ui-state-active*/
                alignRight: false,
                addRowOverState: false, /* row over state - mouse over row effects */
                addSelectedState: false, /* selected state - change class on row selected */
                onRequestStarting: function () { }, /* on request starting event handler - invoked just prior to ajax request */
                onRequestEnding: function () { }, /* on request ending event handler - invoked just prior to replacing content */
                onRequestEnded: function () { } /* on request ended event handler - invoked immediately after replacing content  */
            };

            options = $.extend(defaults, options);
            options.alignClass = (options.alignRight) ? "mc-grid-right" : "mc-grid-left";

            // ui-state-default
            var stylize = function ($context) {
                $(".ui-state-default:not(th, .ui-state-disabled, .ui-slider-range, .ui-progressbar-value), a.ui-datepicker-next, a.ui-datepicker-prev, .ui-dialog-titlebar-close", $context).hover(
                    function () { $(this).addClass("ui-state-hover"); },
                    function () { $(this).removeClass("ui-state-hover"); }
                );
                $("table thead th", $context).addClass("ui-state-default");

                var $tr = $("table tbody tr", $context);
                if (options.addRowOverState) {
                    $tr.hover( /* add hover states to the grid */
                        function () { $("td", this).addClass("ui-state-hover"); },
                        function () { $("td", this).removeClass("ui-state-hover"); }
                    );
                }

                if (options.addSelectedState) { /* add/remove 'selected' states to the rows on click */
                    /* the 'selected' states just added prevents anchor propagation within the cells, so to enable proper anchor execution
                    rows will not be selected when the target is an anchor. */
                    $tr.mvccontribGridToggle(
                        function (e) {
                            if (e.target.nodeName.toLowerCase() != "a") {
                                $("td", this).addClass(options.selectedClass);
                            } else { return true; }
                        },
                        function (e) {
                            if (e.target.nodeName.toLowerCase() != "a") {
                                $("td", this).removeClass(options.selectedClass);
                            } else { return true; }
                        }
                    );
                }
                $tr.find("td").addClass("ui-widget-content " + options.alignClass);
            };

            var ajaxifyGrid = function ($context) {
                var $sorters = $("table thead tr th a", $context);
                var $pagers = $(".mc-grid-pager a", $context);
                var $actions = $sorters.add($pagers);
                var $sizer = $("select.mc-grid-page-size", $context);

                var loadGrid = function ($context, url) {
                    if (options.onRequestStarting) options.onRequestStarting.call($context, url);
                    var $content = $("<div/>").load(url, null, function (results) {
                        if (options.onRequestEnding) options.onRequestEnding.call($context, url);
                        $context.empty().append($content);
                        $($context).mvccontribGrid(options);
                        if (options.onRequestEnded) options.onRequestEnded.call($context, url);
                    });
                };

                $actions.each(function (idx, item) {
                    var $action = $(this);
                    var qs = $action.attr("href").substring($action.attr("href").indexOf("?"));
                    $action.data("url", options.url + qs).attr("href", "javascript:void(0);");
                });

                $("option", $sizer).each(function (idx, item) {
                    var $option = $(this);
                    var qs = $option.val().substring($option.val().indexOf("?"));
                    $option.val(options.url + qs);
                });

                $actions.not(".ui-state-disabled").click(function (e) {
                    var $this = $(this);
                    e.preventDefault();
                    loadGrid($context, $this.data("url"));
                });

                $sizer.change(function (e) {
                    loadGrid($context, $(this + ":selected").val());
                });
            };

            return this.each(function () {
                var $this = $(this);
                stylize($this);
                ajaxifyGrid($this);
            });
        },
        mvccontribGridToggle: function (fn) { /* this was necessary bc toggle was preventing href actions - removed event.preventDefault */
            // Save reference to arguments for access in closure
            var args = arguments, i = 1;

            // link all the functions, so any of them can unbind this click handler
            while (i < args.length) {
                jQuery.proxy(fn, args[i++]);
            }

            return this.click(jQuery.proxy(fn, function (event) {
                // Figure out which function to execute
                var lastToggle = (jQuery.data(this, "lastToggle" + fn.guid) || 0) % i;
                jQuery.data(this, "lastToggle" + fn.guid, lastToggle + 1);

                // Make sure that clicks stop
                //event.preventDefault();

                // and execute the function
                return args[lastToggle].apply(this, arguments) || false;
            }));
        }
    });
})(jQuery);