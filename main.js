import { SortedEventsMap } from './SortedEventsMap';

const events = getEvents();

const map = new SortedEventsMap();


function getEvents () {

}

function generateEvent () {
	const year = new Date().getFullYear();
	const month = (Math.trunc(Math.random()*12)).toString().padStart(2, '0');
	const day = (Math.trunc(Math.random()*28)).toString().padStart(2, '0');
	const hour = (Math.trunc(Math.random()*6) + 10);
	const startHour = hour.toString().padStart(2, '0');
	const endHour = Math.min(hour + Math.trunc(Math.random()*6), 20).toString().padStart(2, '0');
	const minutes = (Math.trunc(Math.random()*4) * 15);
	const startMinutes = (Math.min(minutes + Math.trunc(Math.random()*2)*15, 60)).toString().padStart(2, '0');
	const seconds = '00';

	return {
		id: Math.round(Math.random()*100),
		start: `${year}-${month}-${day} ${startHour}:${minutes}:${seconds}`,
		end: `${year}-${month}-${day} ${endHour}:${minutes}:${seconds}`,
	}
}