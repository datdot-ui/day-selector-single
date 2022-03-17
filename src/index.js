const bel = require('bel')
const message_maker = require('message-maker')
const csjs = require('csjs-inject')
const { format, getDate, getMonth, getYear, getDaysInMonth, isToday } = require('date-fns')

var id = 0

module.exports = datdot_ui_timeline_days

function datdot_ui_timeline_days({from = 'Default', data = null, style}, parent_protocol) {

// -----------------------------------
  const myaddress = `${__filename}-${id++}`
  const inbox = {}
  const outbox = {}
  const recipients = {}
  const names = {}
  const message_id = to => (outbox[to] = 1 + (outbox[to]||0))

  const {notify, address} = parent_protocol(myaddress, listen)
  names[address] = recipients['parent'] = { name: 'parent', notify, address, make: message_maker(myaddress) }
  notify(recipients['parent'].make({ to: address, type: 'ready', refs: {} }))

  function make_protocol (name) {
      return function protocol (address, notify) {
          console.log('PROTOCOL INIT', { name, address })
          names[address] = recipients[name] = { name, address, notify, make: message_maker(myaddress) }
          return { notify: listen, address: myaddress }
      }
  }

  function listen (msg) {
      const { head, refs, type, data, meta } = msg // receive msg
      inbox[head.join('/')] = msg                  // store msg
      const [from] = head
      console.log('TIMELINE DAYS', { type, from, name: names[from].name, msg, data })
      // handlers

  }
// -----------------------------------

  const { make } = recipients['parent']
  const date = new Date()
  const today = getDate(date)

  if ( data === null ) {
      // if no data
      var count = getMonth(date) // initial month
      var month = format(date, 'MMMM') // get capitalization month
      var year = getYear(date) // initial year
      var days = getDaysInMonth(date) // initial days
  } else {
      // if data is loaded
      var { from, count, month, year, days } = data
  }

  const is_today = (d) => isToday(new Date(year, count, d)) 
  const el = bel`<section role="timeline-days" class=${style}></section>`

  for (let d = 1; d <= days; d++ ) {
      let date = format(new Date(year, count, d), 'd MMMM  yyyy, EEEE')
      let setDate = format(new Date(year, count, d), 'yyyy-M-d')
      
      if (d < today && count <= new Date().getMonth() && year <= new Date().getFullYear() ) {
          var day = bel`<div role="button" class="${css['timeline-day']} ${css['disabled-date']}" tabindex="-1" aria-today=${is_today(d)} aria-label="${date}" data-date="${setDate}">${d}</div>`
      } else if ( count < new Date().getMonth() && year <= new Date().getFullYear() ) {
          var day = bel`<div role="button" class="${css['timeline-day']} ${css['disabled-date']}" tabindex="-1" aria-today=${is_today(d)} aria-label="${date}" data-date="${setDate}">${d}</div>`
      } else if ( year < new Date().getFullYear()) {
          var day = bel`<div role="button" class="${css['timeline-day']} ${css['disabled-date']}" tabindex="-1" aria-today=${is_today(d)} aria-label="${date}" data-date="${setDate}">${d}</div>`
      }
        else {
          var day = bel`<div role="button" class="${css['timeline-day']} ${is_today(d) ? `${css.today} ${css['date-selected']}` : ''}" tabindex="-1" aria-today=${is_today(d)} aria-label="${date}" aria-selected="${is_today(d)}" data-date="${setDate}" onclick=${(el) => onclick( el.target, setDate )}>${d}</div>`
      }
      el.append(day)
  }

  return el

  function onclick(target, date) {
    const children = [...el.children]
    children.forEach( btn => {
        btn.classList.remove(css['date-selected'])
        btn.removeAttribute('aira-selected')
    })

    target.classList.add(css['date-selected'])
    target.setAttribute('aria-selected', true)
    return notify(make({ to: address, type: 'click', data: { body: date, count, month, year, days }}))
  }
}

const css = csjs`
.timeline-day {
    text-align: center;
    padding: 8px;
    cursor: pointer;
    transition: color 0.25s, background-color 0.25s ease-in-out;
}
.timeline-day:hover {
    color: #fff;
    background-color: #212121;
}
.timeline-day:focus, .timeline-day:active {
    outline: dotted 1px #c9c9c9;
}
.today {
    background-color: #f2f2f2;
}
.date-selected {
    color: #fff;
    background-color: #000;
}
.disabled-date {
    color: #BBBBBB;
    cursor: default;
}
.disabled-date:hover {
    color: #BBBBBB;
    background: none; 
}
`