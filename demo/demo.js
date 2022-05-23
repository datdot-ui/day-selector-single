const timelineDays = require('..')
const csjs = require('csjs-inject')
const bel = require('bel')
const protocol_maker = require('protocol-maker')

var id = 0

function demo () {
// ------------------------------------
    const contacts = protocol_maker('demo', listen)
    function listen (msg) {
        console.log('New message', { msg })
        const { head, refs, type, data, meta } = msg // receive msg
        const [from] = head
    }
// ------------------------------------
  const data = {
    count: 9,
    month:8,
    year: 2022,
    days: 31
  }
  const timelinedays = timelineDays( {data, style: `${css['timeline-days']}` }, contacts.add('calendar-days') )
  const el = bel`<div class=${css.days}>
    <h2 class=${css.title}>Timline days</h2>
    <div class=${css['calendar-timeline-days']}>${timelinedays}</div>
  </div>`

  return el
    
}

const css = csjs`
body {
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #F2F2F2;
  height: 100%;
}
button:active, button:focus {
  outline: dotted 1px #c9c9c9;
}
.wrap {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 75vh 25vh;
  min-width: 520px
}
.terminal {
  background-color: #212121;
  color: #f2f2f2;
  font-size: 13px;
  padding: 0 20px;
  overflow-y: auto;
}
.terminal div {
  margin: 10px 0;
}
.terminal div:last-child {
  color: #FFF500;
  font-weight: bold;
}
.ui-widgets {
  padding: 20px;
  overflow-y: auto;
}
.ui-widgets > div {
  margin-bottom: 30px;
  padding: 10px 20px 20px 20px;
  background-color: #fff;
}
.ui-tab {
}
.ui-tab > nav {
  margin-bottom: 20px;
}
.title {
  color: #008dff;
}
.ui-calendar-header {
}
.custom-header {
  background-color: #f2f2f2;
  max-width: 25%;
  min-width: 225px;
  border-radius: 50px;
}
.custom-header > [class^="calendar-header"] {
  grid-template-rows: 30px;
}
.custom-header > [class^="calendar-header"] h3 {
  font-size: 16px;
}
.calendar-header-fullsize {
}
.days {
}
.calendar-timeline-days {
}
.timeline-days {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: repeat(auto-fit, minmax(30px, auto));
  justify-content: left;
  align-items: center;
}
.calendar-section {
  margin-top: 30px;
  font-size: 12px;
}
.calendar-table-days {
  max-width: 210px;
}
.calendar-days {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: repeat(7, minmax(30px, auto));
  justify-items: center;
}
.calendar-weekday {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: repeat(7, 30px);
  justify-items: center;
}
.calendar-week {
}
.ui-datepicker {
}
`

document.body.append(demo())