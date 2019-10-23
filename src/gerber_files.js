const whatsThatGerber = require('whats-that-gerber')
const path = require('path')

function gerberFiles(files, gerberPath) {
  if (gerberPath != null) {
    const regex = RegExp('^' + gerberPath)
    files = files.filter(f => regex.test(f))
  }
  const layers = files
    .map(f => ({path: f, type: whatsThatGerber(path.basename(f))}))
    .filter(({type}) => type !== 'drw')
  const possibleGerbers = layers.map(({path}) => path)
  const possibleTypes = layers.map(({type}) => type)
  const duplicates = possibleTypes.reduce((prev, t) => {
    return prev || possibleTypes.indexOf(t) !== possibleTypes.lastIndexOf(t)
  }, false)
  if (!duplicates) {
    return {gerbers: possibleGerbers, types: possibleTypes}
  }
  //if we have duplicates we reduce it down to the folder with the most
  //gerbers
  const folders = possibleGerbers.reduce((folders, f) => {
    const name = path.dirname(f)
    folders[name] = (folders[name] || 0) + 1
    return folders
  }, {})
  const gerberFolder = Object.keys(folders).reduce((prev, f) => {
    if (folders[f] > folders[prev]) {
      return f
    }
    return prev
  })
  layers.filter(layer => path.dirname(layer.path) === gerberFolder)
  const gerbers = layers.map(({path}) => path)
  const types = layers.map(({type}) => type)
  return {gerbers, types}
}

module.exports = gerberFiles
