/** 一行数据 */
type Row = Record<string, string>;

/** 配置横向排列表单控制设置为 true 或者使用 [labelCol, controlCol] 指定分别占用的列数 */
type ControlHorizontal = boolean | [number, number];

/** 将值变成对象，每个属性指定不同的控件 */
interface ObjectControl {
  component: "ObjectControl",
  props: {
    /** 把值变换成对象 */
    unpack: (value: string) => Record<string, string>,
    /** 把对象变成值 */
    pack: (obj: Record<string, string>) => string,
    /** 属性名称和使用的控件列表 */
    itemControl: Array<{ field: string, control: Control }>
    /** 显示标题 */
    label?: string,
    /** 是否不分行显示 @default false */
    inline?: boolean,
    /** 是否横向显示每个属性的标签 @default false */
    horizontal?: ControlHorizontal
  }
}

/** 将值变成列表，所有成员使用指定的控件，同时可以添加和删除成员 */
interface ListControl {
  component: "ListControl",
  props: {
    /** 把值变换成列表 */
    unpack: (value: string) => string[],
    /** 把列表变成值 */
    pack: (list: string[]) => string,
    /** 成员使用的控件列表 */
    itemControl: Control,
    /** 显示标题 */
    label?: string,
    /** 是否不分行显示 @default false */
    inline?: boolean,
    /** 是否横向显示每个属性的标签 @default false */
    horizontal?: ControlHorizontal
  }
}

/** 文本输入控件 */
interface TextInputControl {
  component: "TextInputControl",
  props: {
    /** 横向显示标签 @default false */
    horizontal?: ControlHorizontal,
    /** 显示控件标签 */
    label?: string,
    /** 在控件后显示单位 */
    after?: string,
    /** 在控件前显示单位 */
    before?: string,
    /** 将值转换成可编辑的值 */
    pack?: (value: string) => string,
    /** 将编辑结果转换成值 */
    unpack?: (prevValue: string, updated: string) => string,
  }
}

interface AutoCompleteControl {
  component: "AutoCompleteControl",
  props: {
    options: AutoCompleteOption[],
    /** 设置宽度，比如 200px，用于 inline 时调整 */
    width?: string,
    /** 支持多选用来把值转成列表 */
    unpack?: (value: string) => string[],
    /** 支持多选用来把多个标签组合成一个字符串 */
    pack?: (labels: string[]) => string
  }
}

interface ReferenceControl {
  component: "ReferenceControl",
  props: {
    /** 引用表名 */
    belongsTo: string,
    /** 设置宽度，比如 200px，用于 inline 时调整 */
    width?: string,
    /** 支持多选用来把值转成列表 */
    unpack?: (value: string) => string[],
    /** 支持多选用来把多个标签组合成一个字符串 */
    pack?: (labels: string[]) => string
  }
}

/** FormEditor 控件配置 */
type Control = ObjectControl | ListControl | TextInputControl | ReferenceControl | AutoCompleteControl;

/** 自动补全选项 */
type AutoCompleteOption = {
  /** 选中后得到的值 */
  value: string,
  /** 列表显示名称 */
  label?: string
};

/** 自动补全下拉列表编辑器 */
interface AutoCompleteEditor {
  component: "AutoCompleteEditor",
  props: {
    options: AutoCompleteOption[]
    /** 支持多选用来把值转成列表 */
    unpack?: (value: string) => string[],
    /** 支持多选用来把多个标签组合成一个字符串 */
    pack?: (labels: string[]) => string
    /** 如果需要同步当前行其它字段，根据选中的选项返回要更新的字段 */
    saveAs?: (option: AutoCompleteOption) => Row | undefined
  }
}

/** 下拉列表选项 */
type DropDownOption = string | {
  /** 唯一标识符，只在 UI 中区分不同的选项 */
  id: string,
  /** 选项对应的值 */
  value: string,
  /** 鼠标悬停显示的提示 */
  title?: string,
  /** 选项显示名称，缺省使用 value */
  text?: string
}

/** 浏览器原生下拉列表编辑器 */
interface DropDownEditor {
  component: "DropDownEditor",
  props: {
    options: DropDownOption[]
  }
}

/** 文本输入控件 */
interface TextEditor {
  component: "TextEditor",
  props?: {
    /** 在控件后显示单位 */
    after?: string,
    /** 在控件前显示单位 */
    before?: string,
    /** 将值转换成可编辑的值 */
    unpack?: (value: string) => string
    /** 将编辑结果转换成值 */
    pack?: (prevValue: string, updated: string) => string,
  }
}

/** 显示成选择框 */
interface CheckboxEditor {
  component: "CheckboxEditor",
  props?: object
}

/** 自动补全另一张表的 ID */
interface ReferenceEditor {
  component: "ReferenceEditor",
  props: {
    /** 引用的表名 */
    belongsTo: string,
    /** 如果需要同步当前行其它字段，根据选中的选项返回要更新的字段 */
    saveAs?: (option: AutoCompleteOption) => Row | undefined
    /** 支持多选用来把值转成列表 */
    unpack?: (value: string) => string[],
    /** 支持多选用来把多个标签组合成一个字符串 */
    pack?: (labels: string[]) => string,
    /** 根据当前行过滤可选项 */
    preFilterOptions?: (row: Row, options: Record<string, string>[]) => Record<string, string>[]
  }
}

/** 表单编辑器，弹出对话框显示表单进行复杂单元格的编辑 */
interface FormEditor {
  component: "FormEditor",
  props: {
    control: Control
  }
}

/** 单元格编辑器配置 */
type Editor = AutoCompleteEditor | DropDownEditor | TextEditor | CheckboxEditor | ReferenceEditor | FormEditor;

/** 将 ID 显示成引用表对应的标签 */
interface ReferenceFormatter {
  component: "ReferenceFormatter",
  props: {
    /** 引用表名 */
    belongsTo: string
    /** 支持多选用来把值转成列表 */
    unpack?: (value: string) => string[],
    /** 支持多选用来把多个标签组合成一个字符串 */
    pack?: (labels: string[]) => string
  }
}

/** 将值显示成对应的下拉列表选项的显示名 */
interface DropDownFormatter {
  component: "DropDownFormatter",
  props: {
    options: DropDownOption[]
  }
}

/** 将值显示成对应的自动补全编辑器对应的标签 */
interface AutoCompleteFormatter {
  component: "AutoCompleteFormatter",
  props: {
    options: AutoCompleteOption[],
    /** 支持多选用来把值转成列表 */
    unpack?: (value: string) => string[],
    /** 支持多选用来把多个标签组合成一个字符串 */
    pack?: (labels: string[]) => string
  }
}

/** 单元格格式化配置 */
type Formatter = ReferenceFormatter | DropDownFormatter | AutoCompleteFormatter;

interface ColumnStyle {
  /** name: 修改列标题 */
  name?: string,
  /** 列的初始宽度（拖动标题行分隔可以调整宽度的）@default 200 */
  width?: number,
  /** 是否可编辑，如果关闭，新行也没办法填写的，只能在 Excel 里修改其后刷新编辑器 @default true */
  editable?: boolean,
  /** 是否冻结，滚动始终显示在最左，冻结的列会显示在最左边 @default false */
  locked?: boolean,
  /** 不显示该列，比如只是用来 Excel 里参考，可以通过其它列联动修改的 @default false */
  hidden?: boolean
}

interface ColumnConfig {
  style?: ColumnStyle,
  editor?: Editor,
  formatter?: Formatter
}

/** Excel 文件配置 */
interface FileConfig {
  /** 将行转成可以用来自动补全的选项 */
  toAutoCompleteOption?: (row: Row) => AutoCompleteOption,

  /** 联动配置，prev 是更新前的行，updated 包含本次更新的内容，通过改写 updated 来修改需要同步更新的列 */
  onUpdated?: (prev: Readonly<Row>, updated: Row) => any

  /** 列配置 */
  columns?: Record<string, ColumnConfig>
}

/** Excel 文件名和对应的配置 */
type Config = Record<string, FileConfig>;
