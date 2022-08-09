const protocol_maker = require('protocol-maker')
const { isToday, format, isPast, getDay, setMonth, getDate, getMonth, getYear, getDaysInMonth } = require('date-fns')
const button = require('datdot-ui-button')

var id = 0
var count = 0
const sheet = new CSSStyleSheet()
const default_opts = {
	name: 'day-selector-single',
	month: init_date().month,
	days: init_date().days,
	year: init_date().year,
	selected: false,
	value: null,
	start_cal: true,
	theme: get_theme()
}
sheet.replaceSync(default_opts.theme)

module.exports = calendar_days

calendar_days.help = () => { return { opts: default_opts } }


function calendar_days (opts, parent_wire) {
	const { 
		name = default_opts.name,
		month = default_opts.month,
		days = default_opts.days,
		year = default_opts.year,
		selected = default_opts.selected,
		value = default_opts.value,
		start_cal = default_opts.start_cal,
		theme = '' } = opts

	const current_state =  { opts: { name, month, days, year, selected, value, start_cal, sheets: [default_opts.theme, theme] } }
  
  // protocol
  const initial_contacts = { 'parent': parent_wire }
  const contacts = protocol_maker('data-selector-single', listen, initial_contacts)
  
  function listen (msg) {
		const { head, refs, type, data, meta } = msg // receive msg
		const [from, to] = head
		const name = contacts.by_address[from].name
		// handlers
		if (type === 'click') onclick(contacts.by_name[name].pos)
		if (type === 'clear') return clear()
		if (type === 'update') return update_cal(data)
  }

	const $parent = contacts.by_name['parent']

  // calendar days
	const el = document.createElement('day-selector-single')
	const shadow = el.attachShadow({mode: 'closed'})

	const { calendar, buttons } = make_calendar()
	adjust_cal_to_month()

	const custom_theme = new CSSStyleSheet()
	custom_theme.replaceSync(theme)
	shadow.adoptedStyleSheets = [sheet, custom_theme]

	shadow.append(calendar)
	return el
	
// event handlers

function onclick (pos) {
	const btn = buttons[pos]
	if (!pos || btn.classList.value.includes('disabled-day') || btn.classList.value.includes('date-selected') ) return
	clear ()
	current_state.opts.selected = !current_state.opts.selected
	$parent.notify($parent.make({ to: $parent.address, type: 'selected', data: { body: [current_state.opts.year, current_state.opts.month+1, current_state.opts.value] } }))
	if (current_state.opts.selected) btn.classList.add('date-selected')
}
	// helpers
	function clear () {
		current_state.opts.selected = false
		current_state.opts.value = void 0
		const len = Object.keys(buttons).length
		for (var i = 1; i < len + 1; i++) {
			buttons[i].classList.remove('date-selected')
		}		
	}

	function update_cal(data) {
		const { pos } = data
		let date = setMonth(new Date(), pos)
		current_state.opts.year = getYear(date)
		current_state.opts.days = getDaysInMonth(date)
		current_state.opts.month = getMonth(date)
		adjust_cal_to_month()
	}

	function adjust_cal_to_month () {
		for (let i = 1; i < Object.keys(buttons).length + 1; i++) {
			const btn = buttons[i]
			const attributes = [...btn.attributes]
			attributes.forEach(attr => {
				if (attr.name === 'tabIndex' || attr.name === 'data-num') return
				btn.removeAttribute(attr.name)
			})
			const { year, month } = current_state.opts
			let formatDate = format(new Date(year, month, i), 'd MMMM yyyy, EEEE')
			btn.setAttribute('aria-label', formatDate)
			btn.classList.add('day')
			if (i > current_state.opts.days) {
				btn.style.visibility = "hidden"
				continue
			}
			if (btn.style.visibility === "hidden") btn.style.visibility = 'visible'
			if (isToday(new Date(year, month, i)) ) {
				btn.classList.add('today')
				btn.setAttribute('aria-today', true)
			} else { 
				if (isPast(new Date(year, month, i))) btn.classList.add('disabled-day')
				btn.setAttribute('aria-today', false)
			}
		}
	}

	function make_calendar () {
		const days = 31
		const calendar = document.createElement('section')
		calendar.classList.add('day-selector-single')
		getSpaceInPrevMonth(calendar)
		const buttons = {}
		const { year, month } = current_state.opts
		for (let i = 1; i < days + 1; i++) {
			let formatDate = format(new Date(year, month, i), 'd MMMM yyyy, EEEE')
			const btn_name = `button-${id++}`
			let btn = button({ name: 'buton', text: i}, contacts.add(btn_name))
			btn.setAttribute('tabIndex', '-1')
			btn.setAttribute('aria-label', formatDate)
			btn.setAttribute('data-num', `${i}`)
			buttons[i] = btn
			contacts.by_name[btn_name].pos = i
			calendar.append(btn)
		}
		return { calendar, buttons }
	}

	function getSpaceInPrevMonth (el) {
		const { year, month } = current_state.opts
		let daysInPrevMonth = getDaysInMonth(new Date(year, month-1))
		// get day in prev month which means to add how many spans
		let dayInPrevMonth = getDay(new Date(year, month-1, daysInPrevMonth))
		for (let s = dayInPrevMonth; s > 0; s--) {
				let span = document.createElement('div')
				span.classList.add('day-prev')
				el.append((span))
		}
	}
}

function init_date () {
	const date = new Date()
	let year = getYear(date)
	let month = getMonth(date)
	let days = getDaysInMonth(date)
	return { year, month, days }
}

function get_theme () {
	return `
	.day-selector-single {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: repeat(7, minmax(30px, auto));
    justify-items: center;
}
button {
    background: none;
    border: none;
    cursor: pointer;
}
.day {
    display: grid;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    cursor: pointer;
    transition: color 0.25s, background-color 0.25s ease-in-out;
}
.day:hover {
    color: #fff;
    background-color: #000;
}
.today {
    background-color: #f2f2f2;
}
.date-selected, .date-selected:hover {
    color: #fff;
    background-color: #000;
}
.day-prev {}
.disabled-day, .disabled-day:hover {
    color: #BBBBBB;
    background: none;
    cursor: default;
}
.date-in-range {
    color: #000;
    background-color: #EAEAEA;
}
`
}