export default function getValue(valueOrEvent) {
  return valueOrEvent && valueOrEvent.target
    ? valueOrEvent.target.value
    : valueOrEvent;
}
