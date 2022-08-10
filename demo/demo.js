const bel = require('bel')
const csjs = require('csjs-inject')
const protocol_maker = require('protocol-maker')
const { setMonth, getYear, getDaysInMonth } = require('date-fns')
// widgets
const calendarMonth = require('datdot-ui-month-selector')
const calendarDays = require('..')

var id = 0

module.exports = demo

function demo () {
	
  const contacts = protocol_maker('demo', listen)
  function listen (msg) {
    const { head, refs, type, data, meta } = msg // receive msg
    const [from] = head
    const name = contacts.by_address[from].name
		if (type === 'click') handle_click(name, data)
    if (type === 'clear') {}
	}

  // elements	
	const current_state = { pos: 1, value: null	}
	const month_name = `month-selector`
	const days_name = `day-selector`

  const date = setMonth(new Date(), current_state.pos)
  current_state.days = getDaysInMonth(date)
  current_state.year = getYear(date)

  const cal_month = calendarMonth({ pos: current_state.pos }, contacts.add(month_name))
  let cal_days = calendarDays({
    name: days_name, 
    year: current_state.year,
    month: current_state.pos, 
    days: current_state.days,
    start_cal: true 
  }, contacts.add(days_name))
  
	const weekList= ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const container = bel`<div class=${css['calendar-container']}></div>`

	const cal = bel`<div class=${css.calendar}>${cal_month}${makeWeekDays()}${cal_days}</div>`
  container.append(cal)

  const demo = bel`<div class=${css.datepicker}> <div class=${css["calendar-header"]}></div> ${container} </div>`
  demo.onclick = (e) => handle_demo_onclick(e)
  
  return demo

  function makeWeekDays () {
    const el = bel`<section class=${css['calendar-weekday']} role="weekday"></section>`
    weekList.map( w => {
      let div = bel`<div class=${css['calendar-week']} role="week">${w.slice(0 ,1)}</div>`
      el.append(div)
    })
    return el
  }

  function handle_click (name, data) {
    if (name === month_name) {
      const target = data.name
      if (current_state.value) return
      if (target === 'prev') current_state.pos = current_state.pos - 1
      else if (target === 'next') current_state.pos = current_state.pos + 1
      const $cal_month = contacts.by_name[name]
      const $cal_days = contacts.by_name['day-selector']
      $cal_month.notify($cal_month.make({ to: $cal_month.address, type: 'update', data : { pos: current_state.pos } }))
      $cal_days.notify($cal_days.make({ to: $cal_days.address, type: 'update', data: { pos: current_state.pos } }))
    } 
    else if (name === days_name) {
      console.log('Click', { data })
    }
  }

  function handle_demo_onclick (event) {
    const target = event.target.tagName
    if (target === 'DAY-SELECTOR-SINGLE' || target === 'CALENDAR-MONTH') return
    clear()
  } 
  
  function clear () {
    const $name = contacts.by_name['day-selector']
    $name.notify($name.make({ to: $name.address, type: 'clear' }))
  }

}

const css = csjs`
html {
	height: 100%;
}
body {
	margin: 0;
	padding: 0;
	font-family: Arial, Helvetica, sans-serif;
	background-color: #F2F2F2;
	height: 100%;
}
.datepicker {
    position: relative;
    background-color: white;
    height: 100%;
}
.datepicker-body {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: repeat(2, 210px);
    grid-gap: 35px;
}
.btn {
    background: none;
    border: none;
    border-radius: 50px;
    width: 30px;
    height: 30px;
    padding: 0;
    transition: background-color 0.3s ease-in-out;
    cursor: pointer;
}
.btn:active, .btn:hover {
    background-color: #C9C9C9;
}
.prev {}
.next {}
.icon svg path {
    transition: stroke 0.25s ease-in-out;
}
.icon-prev {}
.icon-next {}
.calendar-header {
    position: absolute;
    z-index: 9;
    display: flex;
    justify-content: space-between;
    width: 100%;
}
.calendar-container {
    display: flex;
}
.calendar-weekday {
    display: grid;
    grid-template-rows: 30px;
    grid-template-columns: repeat(7, minmax(30px, auto));
    justify-items: center;
    font-size: 12px;
}
.calendar-week {
    
}
.calendar {
    margin-left: 30px;
}
.title {
    font-size: 18px;
    text-align: center;
}
`

document.body.append(demo())