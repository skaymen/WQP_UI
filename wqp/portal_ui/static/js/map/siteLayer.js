/* jslint browser: true */
/* global L */
/* global Config */
/* global _ */
/* global $ */
/* global log */

var PORTAL = PORTAL || {};

PORTAL.MAP = PORTAL.MAP || {};

PORTAL.MAP.siteLayer = (function() {
	"use strict";

	var self = {};

	var WQP_SITE_LAYER_NAME = 'wqp_sites';
	var WFS_VERSION = '1.1.0';

	var getSearchParams = function(queryParamArray) {
		var queryJson = PORTAL.UTILS.getQueryParamJson(queryParamArray);
		var resultJson = _.omit(queryJson, ['mimeType', 'zip']);
		resultJson = _.mapObject(resultJson, function(value) {
			return value.join('|');
		});
		var resultArray =  _.map(resultJson, function(value, name) {
			return name + ':' + value;
		});
		return resultArray.join(';');
	};

	/*
	 * @param {Array of Object with name and value properties} queryParamArray - query parameters to be used to retrieve the sites
	 * 	 * @return {L.tileLayer.wms} - The source for the tile adds an additional event, 'sourceloaded', which is fired after
	 * 		all tiles have been loaded. The layer has an additional property queryParamArray which are the query parameters
	 * 		used to retrieve the sites and is passed into this method.
	 */
	self.createWQPSitesLayer = function(queryParamArray, style) {
		var layer =  L.tileLayer.wms(Config.SITES_GEOSERVER_ENDPOINT + 'wms', {
			layers: WQP_SITE_LAYER_NAME,
			format : 'image/png',
			transparent : true,
			styles : style,
			version : '1.1.0'
		});
		layer.setParams({
			SEARCHPARAMS : getSearchParams(queryParamArray)
		});
		return layer;
	};

	/*
	 * @param {WQP Sites Layer} layer
	 * @param {Array of Object with name and value properties} queryParamArray - query to be used to retrieve site layer
	 */
	self.updateWQPSitesLayer = function(layer, queryParamArray) {
		layer.setParams({
			SEARCHPARAMS : getSearchParams(queryParamArray),
			cacheId : Date.now() // Needed to prevent a cached layer from being used.
		});
	};

	/*
	 * @param {WQP Sites Layer} layer
	 * @param {String} sld
	 */
	self.updateWQPSitesSLD = function(layer, sld) {
		layer.setParams({
			styles : sld
		});
	};

	self.getWfsGetFeatureUrl = function(queryParamArray) {
		var queryData = {
			request : 'GetFeature',
			service : 'wfs',
			version : WFS_VERSION,
			typeName : WQP_SITE_LAYER_NAME,
			searchParams : getSearchParams(queryParamArray),
			outputFormat : 'application/json'
		};
		return Config.SITES_GEOSERVER_ENDPOINT + 'wfs/?' + $.param(queryData);
	};

	/*
	 * @param {Array of Object with name and value properties} queryParamArray - query parameters to be used to retrieve the sites
	 * @param {ol.Extent} boundingBox - limit the request to look for features in this boundingBox
	 * @return {Jquery.promise}
	 * 		@resolve - Argument is the response parsed into JSON
	 * 		@reject - Argument is an error string
	 */
	self.getWQPSitesFeature = function(queryParamArray, boundingBox) {
		var deferred = $.Deferred();
		var wfsFormat = new ol.format.WFS();

		var searchParams = getSearchParams(queryParamArray);

		// Create the post feature document
		var getFeatureDoc;
		var getFeatureQueryDoc = wfsFormat.writeGetFeature({
			featureNS: '',
			featurePrefix : '',
			featureTypes : [WQP_SITE_LAYER_NAME],
			srsName : 'EPSG:900913',
			geometryName : 'the_geom',
			bbox :	boundingBox
		});
		var $getFeature = $(getFeatureQueryDoc);
		var $filter = $getFeature.find('Filter');
		$getFeature.remove('BBOX');
		$getFeature.find('Filter').html(
			'<And><PropertyIsEqualTo matchCase="true">'  +
			'<PropertyName>searchParams</PropertyName>' +
			'<Literal>' + encodeURIComponent(searchParams) + '</Literal>' +
			'</PropertyIsEqualTo>' + $filter.html() + '</And>'
		);
		getFeatureDoc = '<GetFeature xmlns="http://www.opengis.net/wfs" ' +
			'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" service="WFS" version="' + WFS_VERSION + '" ' +
			'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">' +
			$(getFeatureQueryDoc).html() +
			'</GetFeature>';

		$.ajax({
			url : Config.SITES_GEOSERVER_ENDPOINT + 'wfs',
			data : getFeatureDoc,
			method : 'POST',
			contentType : 'application/xml',

			success : function(response) {
				if ($(response).find('ExceptionReport, ows\\:ExceptionReport').length > 0) {
					log.error('WFS received an error response');
					deferred.reject('WFS request failed');
				}
				else {
					var features = _.map(wfsFormat.readFeatures(response), function(f) {
						return f.getProperties();
					});
					deferred.resolve(features);
					log.debug('Got response');
				}
			},
			error : function(jqXHR, textStatus, error) {
				log.error('Error is ' + textStatus);
				deferred.reject('WFS service is not working');
			}
		});

		return deferred.promise();

	};

	self.getLegendGraphicURL = function(wmsSource) {
		var layerParams = wmsSource.getParams();
		var defaultOptions = {
			REQUEST : 'GetLegendGraphic',
			FORMAT : 'image/png',
			LAYER : layerParams.LAYERS,
			STYLE : layerParams.STYLES,
			SEARCHPARAMS : layerParams.SEARCHPARAMS,
			LEGEND_OPTIONS : 'fontStyle:bold;'
		};
		return Config.SITES_GEOSERVER_ENDPOINT + 'wms?' + $.param(defaultOptions);
	};

	return self;
})();