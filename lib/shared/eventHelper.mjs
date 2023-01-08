import { isPlainObject, asArray, isText } from './node-functions.mjs'
import { digestPromise, disclosedPromise } from './node-promise.mjs'

// on emit 스타일 이벤트 헬퍼
export class StandardEvent {
  listeners = {}
  traceDebug = false

  constructor(events) {
    if (isPlainObject(events)) {
      for (const key in events) {
        this.on(key, events[key])
      }
    }
  }
  clone() {
    return new StandardEvent(this.listeners)
  }
  on(key, eventFns) {
    const { listeners } = this
    const addTargets = asArray(eventFns)

    if (!listeners[key]) listeners[key] = []

    addTargets.forEach((fn) => {
      if (typeof fn === 'function') {
        listeners[key] = [...listeners[key], fn]
      } else {
        throw new Error('Event listener는 반드시 function 이여야 합니다.', key, eventFns)
      }
    })

    return this
  }
  off(key, eventFns) {
    const { listeners } = this
    const removeTargets = asArray(eventFns)

    removeTargets.forEach((fn) => {
      if (typeof fn === 'function') {
        if (listeners[key]) {
          listeners[key] = listeners[key].filter((event) => event !== fn)
        }

      } else {
        throw new Error('Event listener는 반드시 function 이여야 합니다.', key, eventFns)
      }
    })
    return this
  }
  once(key, eventFns) {
    const self = this
    const wrapFns = asArray(eventFns)
      .map((fn) => {
        if (typeof fn !== 'function') {
          return undefined
        }
        return function wrapFn() {
          fn()
          self.off(key, fn)
        }
      })
      .filter(Boolean)
    self.on(key, wrapFns)
    return self
  }
  watch(key, eventFns) {
    const self = this
    const targetFns = asArray(eventFns)
    targetFns.forEach((eventFn) => {
      self.on(eventFn)
    })
    return function unwatch() {
      targetFns.forEach((eventFn) => {
        self.off(key, eventFn)
      })
      return targetFns
    }
  }
  // watches([[]])
  watches(eventEntries) {
    const self = this
    const targetEntries = eventEntries
      .map((entry) => {
        if (!Array.isArray(entry)) {
          return null
        }
        if (typeof entry[0] !== 'string' || typeof entry[1] !== 'function') {
          return null
        }
        return [entry[0], entry[1]]
      })
      .filter(Boolean)

    targetEntries.forEach(([key, eventFn]) => self.on(key, eventFn))

    return function unwatch() {
      targetEntries.forEach(([key, eventFn]) => self.off(key, eventFn))
      return targetEntries
    }
  }
  emit(key, ...values) {
    const { listeners } = this
    const targets = asArray(listeners[key])
    const result = targets.map((fn) => fn(...values))
    return result
  }
  trigger(key, values) {
    const { listeners } = this
    const targets = asArray(listeners[key])
    const parameters = asArray(values)
    const result = targets.map((fn) => fn(...parameters))
    return result
  }
  getListeners(key) {
    if (!isText(key)) {
      return []
    }
    return asArray(this.listeners[key]).slice(0)
  }
  offEvents(key) {
    const { listeners } = this

    if (typeof key === 'string' && listeners[key]) {
      listeners[key] = []
    }
  }
  offAll() {
    const { listeners } = this
    const cleanedListeners = {}
    for (const key in listeners) {
      this.offEvents(key)
    }
    this.listeners = cleanedListeners
    return this
  }
  destroy() {
    this.listeners = null
    return null
  }
}

export class TopicEvent {

  event = null

  constructor(options) {
    const setup = options === 'function' ? options : options?.setup
    const evnet = new StandardEventClass()

    if (typeof setup === 'function') {
      const destroyHandler = setup(this)
      if (typeof destroyHandler === 'function') {
        event.once('destroy', () => destroyHandler)
      }
    }

    this.event = evnet
  }
  addListener(handler) {
    this.event.on('subject', handler)
  }
  removeListener(handler) {
    this.event.off('subject', handler)
  }
  emit(value) {
    return this.event.emit('subject', value)
  }
  destroy() {
    this.event.emit('destroy')
    this.event.cleanListeners()
  }
}

export class PipeEvent {
  pipes = {}

  constructor() {}

  readyTaskProps (name){
    if(!this.pipes[name]){
      const waiter = [] 
      const master = digestPromise((resolve)=>{
        if(waiter.every(({ fullfill })=>(fullfill === true)) === true){
          resolve(waiter)
        }
      })
      this.pipes[name] = { master, waiter }
    }
    return this.pipes[name]
  }
  waitTaskAsync (name){
    return this.readyTaskProps(name).master.promise
  }
  task (name, fn, dependencies) {
    const currentTask = this.readyTaskProps(name)
    const dependentPromiseList = asArray(dependencies).filter((value)=>(typeof value === "string")).map((name)=>{
      return this.waitTaskAsync(name)
    })
    const newWaiter = disclosedPromise(
      async (...args)=>{
        await Promise.all(dependentPromiseList)
        fn(...args)
      }, 
      ()=>{
        currentTask.master.digest()
      },
      ()=>{
        currentTask.master.digest()
      },
    )
    currentTask.waiter.push(newWaiter)
    return newWaiter.promise
  }
  watch (fn){

  }
}

export function standardEvent (...params){ return new StandardEvent(...params) }
export function topicEvent (...params){ return new TopicEvent(...params) }
export function pipeEvent (...params){ return new PipeEvent(...params) } 
export default standardEvent

