export type Action = any;

export type ExcelRow = {
  row: number,
  columns: { [string]: string }
};

export type ExcelFile = {
  name: string,
  firstRowNum: number,
  nextRowNum: number,
  rows: Array<ExcelRow>,
  columnsPosition: { [string]: number },
  columnsTitle: { [string]: string }
};

export type ExcelFileChanges = {
  rows: Array<ExcelRow>
};

export type ActionError = {
  uuid: string,
  message: string,
  action: ?Action
};
