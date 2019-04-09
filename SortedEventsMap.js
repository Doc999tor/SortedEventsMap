export class SortedEventsMap extends Map {
	setAndReturnMap (data) {
		return new this.constructor(
			(
				[...this]
				.concat(
					Object.entries(this.aggregateEvents(data))
				)
			).sort()
		)
	}

	aggregateEvents (data) {
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
			this.markOverlappingEvents(aggregatedEventsObj[key]);
		}
		return aggregatedEventsObj;
	}

	markOverlappingEvents (events) {
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
}