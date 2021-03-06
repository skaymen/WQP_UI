/* jslint browser : true */
/* global describe, beforeEach, afterEach, it, expect, jasmine */
/* global $ */
/* global PORTAL */

describe('Tests for PORTAL.VIEWS.dataDetailsView', function() {
	"use strict";

	var testView;
	var $testDiv;
	var $kml, $sites, $samples, $biosamples, $sorted, $hiddenSorted, $narrowsamples, $activity, $activitymetrics, $resultdet;
	var updateResultTypeAction;

	beforeEach(function() {
		$('body').append('<div id="test-div">' +
			'<form>' +
			'<input checked class="result-type" type="radio" id="sites" value="Station" />' +
			'<input class="result-type" type="radio" id="samples" value="Result" />' +
			'<input class="result-type" type="radio" id="biosamples" value="Result" />' +
			'<input class="result-type" type="radio" id="narrowsamples" value="Result" />' +
			'<input class="result-type" type="radio" id="activitymetric-input" value="ActivityMetric" />' +
			'<input class="result-type" type="radio" id="activity-input" value="Activity" />' +
			'<input class="result-type" type="radio" id="resultdetection" value="ResultDetectionQuantitationLimit" />' +
			'<input type="radio" checked name="mimeType" id="csv" value="csv" />' +
			'<input type="radio" checked name="mimeType" id="tsv" value="tsv" />' +
			'<input type="radio" checked name="mimeType" id="xlsx" value="xlsx" />' +
			'<input type="radio" checked name="mimeType" id="kml" value="kml" />' +
			'<input type="checkbox" id="sorted" />' +
			'<input type="hidden" name="sorted" id="hidden-sorted" value="no" />' +
			'<input type="hidden" name="zip" id="zip" value="yes" />' +
			'</form></div>'
		);
		$testDiv = $('#test-div');
		$kml = $('#kml');
		$sites = $('#sites');
		$samples = $('#samples');
		$biosamples = $('#biosamples');
		$narrowsamples = $('#narrowsamples');
		$activity = $('#activity-input');
		$activitymetrics = $('#activitymetric-input');
		$resultdet = $('#resultdetection');

		$sorted = $('#sorted');
		$hiddenSorted = $('#hidden-sorted');

		updateResultTypeAction = jasmine.createSpy('updateResultTypeAction');

		testView = PORTAL.VIEWS.dataDetailsView({
			$container : $testDiv,
			updateResultTypeAction : updateResultTypeAction
		});
		testView.initialize();
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects that if the kml button is checked that checkboxes other than the sites checkbox are disabled', function() {
		$kml.prop('checked', true).trigger('change');
		expect($sites.is(':disabled')).toBe(false);
		expect($samples.is(':disabled')).toBe(true);
		expect($biosamples.is(':disabled')).toBe(true);
		expect($narrowsamples.is(':disabled')).toBe(true);
		expect($activity.is(':disabled')).toBe(true);
		expect($activitymetrics.is(':disabled')).toBe(true);
		expect($resultdet.is(':disabled')).toBe(true);

		$kml.prop('checked', false).trigger('change');
		expect($sites.is(':disabled')).toBe(false);
		expect($samples.is(':disabled')).toBe(false);
		expect($biosamples.is(':disabled')).toBe(false);
		expect($narrowsamples.is(':disabled')).toBe(false);
		expect($activity.is(':disabled')).toBe(false);
		expect($activitymetrics.is(':disabled')).toBe(false);
		expect($resultdet.is(':disabled')).toBe(false);
	});

	it('Expects that if the result-type radio button is changed, updateResultTypeAction is executed', function() {
		$samples.prop('checked', true).trigger('change');
		expect(updateResultTypeAction).toHaveBeenCalledWith('Result');

		$biosamples.prop('checked', true).trigger('change');
		expect(updateResultTypeAction.calls.count()).toBe(2);
		expect(updateResultTypeAction.calls.argsFor(1)[0]).toEqual('Result');

		$narrowsamples.prop('checked', true).trigger('change');
		expect(updateResultTypeAction.calls.count()).toBe(3);
		expect(updateResultTypeAction.calls.argsFor(2)[0]).toEqual('Result');

		$sites.prop('checked', true).trigger('change');
		expect(updateResultTypeAction.calls.count()).toBe(4);
		expect(updateResultTypeAction.calls.argsFor(3)[0]).toEqual('Station');

		$activitymetrics.prop('checked', true).trigger('change');
		expect(updateResultTypeAction.calls.count()).toBe(5);
		expect(updateResultTypeAction.calls.argsFor(4)[0]).toEqual('ActivityMetric');

		$activity.prop('checked', true).trigger('change');
		expect(updateResultTypeAction.calls.count()).toBe(6);
		expect(updateResultTypeAction.calls.argsFor(5)[0]).toEqual('Activity');

		$resultdet.prop('checked', true).trigger('change');
		expect(updateResultTypeAction.calls.count()).toBe(7);
		expect(updateResultTypeAction.calls.argsFor(6)[0]).toEqual('ResultDetectionQuantitationLimit');
	});

	it('Expects that if the biosamples radio button is checked, a hidden input is added with name dataProfile', function() {
		$biosamples.prop('checked', true).trigger('change');
		expect($testDiv.find('input[type="hidden"][name="dataProfile"]').length).toBe(1);

		$sites.prop('checked', true).trigger('change');
		expect($testDiv.find('input[type="hidden"][name="dataProfile"]').length).toBe(0);
	});

	it('Expects that if the narrowsamples radio button is checked, a hidden input is added with name dataProfile', function() {
		$narrowsamples.prop('checked', true).trigger('change');
		expect($testDiv.find('input[type="hidden"][name="dataProfile"]').length).toBe(1);

		$sites.prop('checked', true).trigger('change');
		expect($testDiv.find('input[type="hidden"][name="dataProfile"]').length).toBe(0);
	});

	it('Expects that changing the sort checkbox updates the hidden sorted input', function() {
		$sorted.prop('checked', true).trigger('change');
		expect($hiddenSorted.val()).toEqual('yes');

		$sorted.prop('checked', false).trigger('change');
		expect($hiddenSorted.val()).toEqual('no');
	});

	it('Expects that getResultType returns the currently selected result type', function() {
		$samples.prop('checked', true).trigger('change');
		expect(testView.getResultType()).toEqual('Result');

		$sites.prop('checked', true).trigger('change');
		expect(testView.getResultType()).toEqual('Station');
	});

	it('Expects that getMimeType returns the currently selected mime type', function() {
		$('#xlsx').trigger('click');
		expect(testView.getMimeType()).toEqual('xlsx');

		$('#tsv').trigger('click');
		expect(testView.getMimeType()).toEqual('tsv');
	});
});
