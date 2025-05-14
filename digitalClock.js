const clock = document.getElementById('clock');

function digitalClock() {
  const now = new Date();
  let Hours= now.getHours()
  const meridium = Hours >= 12 ? 'PM' : 'AM';
  Hours = Hours % 12 || 12;
  Hours = Hours.toString().padStart(2, '0');
  const Minutes= now.getMinutes().toString().padStart(2, '0');
  const Seconds= now.getSeconds().toString().padStart(2, '0');
  const Time = `${Hours}:${Minutes}:${Seconds} ${meridium} `;
  clock.textContent= Time;

}

digitalClock();
setInterval(digitalClock, 1000);