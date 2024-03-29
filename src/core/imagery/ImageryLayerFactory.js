/*
 * @Author: Caven
 * @Date: 2020-01-21 15:54:56
 * @Last Modified by: Caven
 * @Last Modified time: 2020-02-19 12:30:50
 */
import Cesium from '@/namespace'
import AmapImageryProvider from './provider/AmapImageryProvider'
import BaiduImageryProvider from './provider/BaiduImageryProvider'
import GoogleImageryProvider from './provider/GoogleImageryProvider'
import TdtImageryProvider from './provider/TdtImageryProvider'
import TencentImageryProvider from './provider/TencentImageryProvider'

DC.ImageryLayerFactory = class {
  /**
   * create amap image layer
   */
  static createAmapImageryLayer(options) {
    return new AmapImageryProvider(options)
  }

  /**
   * create baidu image layer
   */
  static createBaiduImageryLayer(options) {
    return new BaiduImageryProvider(options)
  }

  /**
   * create google image layer
   */
  static createGoogleImageryLayer(options) {
    return new GoogleImageryProvider(options)
  }

  /**
   *  create tdt image layer
   */
  static createTdtImageryLayer(options) {
    return new TdtImageryProvider(options)
  }

  /**
   * create tecent image layer
   */
  static createTencentImageryLayer(options) {
    return new TencentImageryProvider(options)
  }

  /**
   * create arcgis image layer
   */
  static createArcGisImageryLayer(options) {
    return new Cesium.ArcGisMapServerImageryProvider(options)
  }

  /**
   * create singel tile image layer
   */
  static createSingleTileImageryLayer(options) {
    return new Cesium.SingleTileImageryProvider(options)
  }

  /**
   * create wmts image layer
   */
  static createWMTSImageryLayer(options) {
    return new Cesium.WebMapTileServiceImageryProvider(options)
  }

  /**
   * create xyz image layer
   */
  static createXYZImageryLayer(options) {
    return new Cesium.UrlTemplateImageryProvider(options)
  }

  /**
   *  create coord image layer
   */
  static createCoordImageryLayer(options) {
    return new Cesium.TileCoordinatesImageryProvider(options)
  }
}
