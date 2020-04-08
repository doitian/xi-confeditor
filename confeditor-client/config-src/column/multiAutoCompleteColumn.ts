export default function (seperator: string, options: AutoCompleteOption[]): { formatter: Formatter, editor: Editor } {
  const unpack = (value) => value.split(seperator);
  const pack = (list) => list.join(seperator);
  const props = { options, pack, unpack };

  return {
    formatter: { component: "AutoCompleteFormatter", props },
    editor: { component: "AutoCompleteEditor", props }
  };
}
