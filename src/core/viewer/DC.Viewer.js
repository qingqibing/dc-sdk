/*
 * @Author: Caven
 * @Date: 2019-12-27 17:13:24
 * @Last Modified by: Caven
 * @Last Modified time: 2020-02-29 20:14:28
 */

import Cesium from '@/namespace'
import ViewerOption from '../option/ViewerOption'
import CameraOption from '../option/CameraOption'
import MouseEvent from '../event/MouseEvent'
import ViewerEvent from '../event/ViewerEvent'
import Popup from '../widget/Popup'
import ContextMenu from '../widget/ContextMenu'
import Tooltip from '../widget/Tooltip'
import Attribution from '../widget/Attribution'
import MapSwitch from '../widget/MapSwitch'

const DEF_OPTS = {
  animation: false, //Whether to create animated widgets, lower left corner of the meter
  baseLayerPicker: false, //Whether to display the layer selector
  fullscreenButton: false, //Whether to display the full-screen button
  geocoder: false, //To display the geocoder widget, query the button in the upper right corner
  homeButton: false, //Whether to display the Home button
  infoBox: false, //Whether to display the information box
  sceneModePicker: false, //Whether to display 3D/2D selector
  selectionIndicator: false, //Whether to display the selection indicator component
  timeline: false, //Whether to display the timeline
  navigationHelpButton: false, //Whether to display the help button in the upper right corner
  navigationInstructionsInitiallyVisible: false,
  creditContainer: undefined,
  shouldAnimate: true
}

DC.Viewer = class {
  constructor(id, options = {}) {
    if (!id || !document.getElementById(id)) {
      throw new Error('the id is empty')
    }
    this._delegate = new Cesium.Viewer(id, {
      ...options,
      ...DEF_OPTS
    }) // Initialize the viewer
    new MouseEvent(this) // Register global mouse events
    this._viewerOption = new ViewerOption(this) // Initialize the viewer option
    this._cameraOption = new CameraOption(this) // Initialize the camera option
    this._viewerEvent = new ViewerEvent(this) // Register viewer events
    this._dcContainer = DC.DomUtil.create(
      'div',
      'dc-container',
      document.getElementById(id)
    ) //Register the custom container
    this._baseLayerPicker = new Cesium.BaseLayerPickerViewModel({
      globe: this._delegate.scene.globe
    })
    this._layerCache = {}
    this._effectCache = {}
    this.on(DC.ViewerEventType.ADD_LAYER, this._addLayerCallback, this) //Initialize layer add event
    this.on(DC.ViewerEventType.REMOVE_LAYER, this._removeLayerCallback, this) //Initialize layer remove event
    this.on(DC.ViewerEventType.ADD_EFFECT, this._addEffectCallback, this) //Initialize effect add event
    this.on(DC.ViewerEventType.REMOVE_EFFECT, this._removeEffectCallback, this) //Initialize effect remove event
    /**
     * Add default components
     */
    this._popup = new Popup()
    this._contextMenu = new ContextMenu()
    this._tooltip = new Tooltip()
    this._mapSwitch = new MapSwitch()
    this.use(this._popup)
      .use(this._contextMenu)
      .use(this._tooltip)
      .use(this._mapSwitch)
      .use(new Attribution())
  }

  get delegate() {
    return this._delegate
  }

  get dcContainer() {
    return this._dcContainer
  }

  get scene() {
    return this._delegate.scene
  }

  get camera() {
    return this._delegate.camera
  }

  get canvas() {
    return this._delegate.scene.canvas
  }

  get clock() {
    return this._delegate.clock
  }

  get viewerEvent() {
    return this._viewerEvent
  }

  get popup() {
    return this._popup
  }

  get contextMenu() {
    return this._contextMenu
  }

  get tooltip() {
    return this._tooltip
  }

  _addLayerCallback(layer) {
    if (layer && layer.layerEvent && layer.state !== DC.LayerState.ADDED) {
      !this._layerCache[layer.type] && (this._layerCache[layer.type] = {})
      layer.layerEvent.fire(DC.LayerEventType.ADD, this)
      this._layerCache[layer.type][layer.id] = layer
    }
  }

  _removeLayerCallback(layer) {
    if (layer && layer.layerEvent && layer.state !== DC.LayerState.REMOVED) {
      layer.layerEvent.fire(DC.LayerEventType.REMOVE, this)
      if (
        this._layerCache[layer.type] &&
        this._layerCache[layer.type][layer.id]
      ) {
        delete this._layerCache[layer.type][layer.id]
      }
    }
  }

  _addEffectCallback(effect) {
    if (effect && effect.effectEvent && effect.state !== DC.EffectState.ADDED) {
      !this._effectCache[effect.type] && (this._effectCache[effect.type] = {})
      effect.effectEvent.fire(DC.EffectEventType.ADD, this)
      this._effectCache[effect.type][effect.id] = effect
    }
  }

  _removeEffectCallback(effect) {
    if (
      effect &&
      effect.effectEvent &&
      effect.state !== DC.EffectState.REMOVED
    ) {
      effect.effectEvent.fire(DC.EffectEventType.REMOVE, this)
      if (
        this._effectCache[effect.type] &&
        this._effectCache[effect.type][effect.id]
      ) {
        delete this._effectCache[effect.type][effect.id]
      }
    }
  }

  /**
   *
   * @param {*} options
   * set viewer options
   *
   */
  setOptions(options) {
    this._viewerOption.setOptions(options)
    return this
  }

  /**
   *
   * @param {*} min
   * @param {*} max
   * set camera options
   */
  setPitchRange(min = -90, max = -20) {
    this._cameraOption.setPichRange(min, max)
    return this
  }

  /**
   * Restrict camera access underground
   */
  limitCameraToGround() {
    this._cameraOption.limitCameraToGround()
    return this
  }

  /**
   *
   * @param {*} baseLayers
   * Add the baselayer to the viewer.
   * The baselayer can be a single or an array,
   * and when the baselayer is an array, the baselayer will be loaded together
   */
  addBaseLayer(baseLayers, options = {}) {
    if (!baseLayers) {
      return this
    }
    this._baseLayerPicker.imageryProviderViewModels.push(
      new Cesium.ProviderViewModel({
        name: options.name || '地图',
        creationFunction: () => {
          return baseLayers
        }
      })
    )
    if (!this._baseLayerPicker.selectedImagery) {
      this._baseLayerPicker.selectedImagery = this._baseLayerPicker.imageryProviderViewModels[0]
    }
    this._mapSwitch.addMap(options)
    return this
  }

  /**
   *
   * @param {*} index
   * Change the current globe display of the baselayer
   */
  changeBaseLayer(index) {
    if (this._baseLayerPicker && index >= 0) {
      this._baseLayerPicker.selectedImagery = this._baseLayerPicker.imageryProviderViewModels[
        index
      ]
    }
    return this
  }

  /**
   *
   * @param {*} terrain
   * Add the terrain to the viewer.
   */
  addTerrain(terrain) {
    if (!terrain) {
      return this
    }
    this._baseLayerPicker.terrainProviderViewModels.push(
      new Cesium.ProviderViewModel({
        name: options.name || '地形',
        creationFunction: () => {
          return terrain
        }
      })
    )
    if (!this._baseLayerPicker.selectedTerrain) {
      this._baseLayerPicker.selectedTerrain = this._baseLayerPicker.terrainProviderViewModels[0]
    }
  }

  /**
   *
   * @param {*} index
   * Change the current globe display of the terrain
   */
  changeTerrain(index) {
    if (this._baseLayerPicker && index >= 0) {
      this._baseLayerPicker.selectedTerrain = this._baseLayerPicker.terrainProviderViewModels[
        index
      ]
    }
    return this
  }

  /**
   *
   * @param {*} layer
   * Add a layer to the viewer
   */
  addLayer(layer) {
    this._viewerEvent.fire(DC.ViewerEventType.ADD_LAYER, layer)
    return this
  }

  /**
   *
   * @param {*} layer
   * remove a layer from the viewer
   */
  removeLayer(layer) {
    this._viewerEvent.fire(DC.ViewerEventType.REMOVE_LAYER, layer)
    return this
  }

  /**
   *
   * @param {*} id
   * get the layer by id
   */
  getLayer(id) {
    let layer = undefined
    for (let type in this._layerCache) {
      let cache = this._layerCache[type]
      for (let layerId in cache) {
        if (layerId === id) {
          layer = cache[layerId]
          break
        }
      }
      if (layer) {
        break
      }
    }
    return layer
  }

  /**
   *  get all layers
   */
  getLayers() {
    let result = []
    for (let type in this._layerCache) {
      let cache = this._layerCache[type]
      for (let layerId in cache) {
        result.push(cache[layerId])
      }
    }
    return result
  }

  /**
   *
   * @param {*} method
   * @param {*} context
   * loop through each layer
   */
  eachLayer(method, context) {
    for (let type in this._layerCache) {
      let cache = this._layerCache[type]
      for (let layerId in cache) {
        method.call(context, cache[layerId])
      }
    }
    return this
  }

  /**
   *
   * @param {*} effect
   */
  addEffect(effect) {
    this._viewerEvent.fire(DC.ViewerEventType.ADD_EFFECT, effect)
    return this
  }

  /**
   *
   * @param {*} effect
   */
  removeEffect(effect) {
    this._viewerEvent.fire(DC.ViewerEventType.REMOVE_EFFECT, effect)
    return this
  }

  /**
   *
   * @param {*} target
   */
  flyTo(target) {
    this._delegate.flyTo(target.delegate || target)
    return this
  }

  /**
   *
   * @param {*} target
   */
  zoomTo(target) {
    this._delegate.zoomTo(target.delegate || target)
    return this
  }

  /**
   *
   * @param {*} position
   * @param {*} completeCallback
   */
  flyToPosition(position, completeCallback, duration) {
    if (position instanceof DC.Position) {
      this._delegate.camera.flyTo({
        destination: DC.T.transformWSG84ToCartesian(position),
        orientation: {
          heading: Cesium.Math.toRadians(position.heading),
          pitch: Cesium.Math.toRadians(position.pitch),
          roll: Cesium.Math.toRadians(position.roll)
        },
        complete: completeCallback,
        duration: duration
      })
    }
    return this
  }

  /**
   *
   * @param {*} type
   * @param {*} callback
   * @param {*} context
   */
  on(type, callback, context) {
    this._viewerEvent.on(type, callback, context || this)
    return this
  }

  /**
   *
   * @param {*} type
   * @param {*} callback
   * @param {*} context
   */
  off(type, callback, context) {
    this._viewerEvent.off(type, callback, context || this)
    return this
  }

  /**
   *
   * @param {*} plugin
   */
  use(plugin) {
    if (plugin && plugin.install) {
      plugin.install(this)
    }
    return this
  }
}
