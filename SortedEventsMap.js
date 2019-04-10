export class SortedEventsMap extends Map {
	setAndReturnMap (data) {
		return new this.constructor(
			Object.entries(Object.assign(this._mapToObj(), this._aggregateEvents(data)))
			.sort()
		)
	}

	getEventsListWithIntervalsByDate (date) {

		// TODO: add intevals check

		const events = this.get(date);
		for (var i = events.length - 1; i >= 0; i--) {
			if (events[i].columnIndex + 1 !== events[i].columns) { continue; }
			if (i === 0) { break; }

			const startDate = events[i-1].endDate; // start of interval is an end of the previous event
			const endDate = events[i].startDate;
			const diffMinutes = (endDate - startDate) * 1000 * 60; // interval duration in minutes

			if (diffMinutes === 0) { continue; } // interval equals to 0, non relevant

			events.splice(i-1, 0, { // mutates the saved array
				startDate,
				endDate,
				off_time: 'interval'
			})
		}
	}

	_aggregateEvents (data) {
		const aggregatedEventsObj  = data.reduce((agg, a) => {
			a.startDate = new Date(a.start);
			a.endDate = new Date(a.end);

			const aggDate = a.start.substr(0, 10);
			if (!agg[aggDate]) { agg[aggDate] = [a]; }
			else { agg[aggDate].push(a) }
			return agg;
		}, {});

		// sort events by start fields
		for (const key in aggregatedEventsObj) {
			aggregatedEventsObj[key].sort((a, b) => a.start > b.start ? 1 : -1)
			this._markOverlappingEvents(aggregatedEventsObj[key]);
		}
		return aggregatedEventsObj;
	}

	_markOverlappingEvents (events) {
		const intervals = []
		for (let event_i = 0; event_i < events.length; event_i++) {
			if (!intervals.length) {
				intervals.push(this._createInterval(events[event_i]))
				continue;
			}

			const lastInterval = intervals[intervals.length-1];
			if (events[event_i].startDate >= lastInterval.startDate && events[event_i].startDate <  lastInterval.endDate) { // current appointment starts within the lastInterval
				lastInterval.endDate = new Date(Math.max(lastInterval.endDate, events[event_i].endDate)); // lastInterval is extended to most late endDate
				lastInterval.apps.push(events[event_i])
			} else {
				intervals.push(this._createInterval(events[event_i]))
			}
		}

		for (let interval_i = 0; interval_i < intervals.length; interval_i++) {
			for (let event_i = 0; event_i < intervals[interval_i].apps.length; event_i++) {
				intervals[interval_i].apps[event_i].columns = intervals[interval_i].apps.length;
				intervals[interval_i].apps[event_i].columnIndex = event_i;
			}
		}
	}

	_createInterval (event) {
		return {
			startDate: event.startDate,
			endDate: event.endDate,
			apps: [event]
		}
	}

	_mapToObj () {
		const obj = {}
		for (let [k, v] of this) {
			obj[k] = v; // pointers to inner arrays persist
		}
		return obj;
	}
}