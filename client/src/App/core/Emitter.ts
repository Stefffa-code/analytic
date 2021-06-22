export class Emitter {
  static _self
  readonly listeners : any = {}

  static get self() {
    if(Emitter._self)
      return Emitter._self
    Emitter._self = new Emitter()
    return Emitter._self
  }


  // генерирует уведомление
  emit(event, ...args) {
    if (!Array.isArray(this.listeners[event])) {
      return false
    }
    this.listeners[event].forEach(listener => {
      listener(...args)
    })
    return true
  }

  // Подписываемся на уведомление
  subscribe(event, fn) {
    this.listeners[event] = this.listeners[event] || []
    this.listeners[event].push(fn)
    return () => {
      this.listeners[event] =
        this.listeners[event].filter(listener => listener !== fn)
    }
  }
}

