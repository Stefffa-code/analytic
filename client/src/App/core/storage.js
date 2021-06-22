import moment from 'moment'

function removeItem(item){
  localStorage.removeItem(item)
}


function getItem(key){
  let item = localStorage.getItem(key)
  return JSON.parse(item) || false
}

function setItem(name,item){
  let stringed = JSON.stringify(item)
  localStorage.setItem(name, stringed)
}

function clear() {
  localStorage.clear()
}


export {
  setItem,
  getItem,
  removeItem,
  clear
}
