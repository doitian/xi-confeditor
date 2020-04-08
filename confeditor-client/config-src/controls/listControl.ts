/**
 * 方便生成 ListControl 配置
 * @param separator 分隔符
 * @param itemControl 成员控件
 * @param label 整个 ListControl 的标题
 */
export default function listControl(separator: string, itemControl: Control, label?: string) : ListControl {
  return {
    component: "ListControl",
    props: {
      unpack: function (str) {
        return str.split(separator);
      },
      pack: function (val) {
        return val.join(separator);
      },
      label: label,
      itemControl: itemControl
    }
  };
}
