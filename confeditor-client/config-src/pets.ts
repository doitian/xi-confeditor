import formEditor from "./editors/formEditor"
import probabilityDurationControl from "./controls/probabilityDurationControl"
import unitProbabilityDurationControl from "./controls/unitProbabilityDurationControl"
import listControl from "./controls/listControl"
import referenceFormatter from "./formatters/referenceFormatter"
import referenceEditor from "./editors/referenceEditor"
import { zeroPadding, truncate } from "./utils/stringUtils"
import multiAutoCompleteColumn from "./column/multiAutoCompleteColumn"

const probabilityDurationListEditor = formEditor(
  listControl(";", probabilityDurationControl, "出现概率 ∙ 持续时间")
);

const pets: Config = {}

pets["角色表"] = {
  toAutoCompleteOption: function (row) {
    const name = row.name
    const specie = row._A
    const label = (specie !== undefined && specie !== "") ? `${name} (${specie})` : name;
    return { value: row.id, label, name, specie };
  }
};

pets["角色台词表"] = {
  toAutoCompleteOption: function (row) {
    var label = `${row.unitName}: ${truncate(row.word, 10)}`;
    return {
      value: row.id,
      title: row.word,
      label,
      unitId: row.unitId,
      activate: row.activate
    };
  }
}

pets["角色校园行踪表"] = {
  columns: {
    id: {
      formatter: referenceFormatter({ belongsTo: "角色表" }),
      editor: referenceEditor({ belongsTo: "角色表", saveAs: ({ label }) => ({ _L: label }) })
    },
    // 宿舍
    "1": { editor: probabilityDurationListEditor },
    "2": { editor: probabilityDurationListEditor },
    "3": { editor: probabilityDurationListEditor },
    "4": { editor: probabilityDurationListEditor },
    "5": { editor: probabilityDurationListEditor },
    "6": { editor: probabilityDurationListEditor },
    "7": { editor: probabilityDurationListEditor },
    "8": { editor: probabilityDurationListEditor },
    cp: {
      style: { width: 400 },
      editor: formEditor(
        listControl(
          ";",
          unitProbabilityDurationControl,
          "CP角色 ∙ 出现概率 ∙ 持续时间"
        )
      )
    },
    _A: { style: { hidden: true } },
    _L: { style: { locked: true, editable: false } }
  }
};

const patrolExpressionOptions: AutoCompleteOption[] = [
  { value: "1", label: "音符" },
  { value: "2", label: "爱心" },
  { value: "3", label: "毛绒团" },
  { value: "4", label: "心裂开" },
  { value: "5", label: "感叹号（对话）" },
  { value: "6", label: "问好" },
  { value: "7", label: "省略号" },
  { value: "8", label: "霹雳" }
];

const patrolClickOptions: AutoCompleteOption[] = [
  { value: "1", label: "初始" },
  { value: "2", label: "连续" },
  { value: "3", label: "常规" },
  { value: "4", label: "对话" }
];

const patrolEventOptions: AutoCompleteOption[] = [
  { value: "1", label: "cp" },
  { value: "2", label: "地点" },
  { value: "3", label: "值日" }
]

const patrolBuildingOptions: AutoCompleteOption[] = [
  { value: "1", label: "宿舍" },
  { value: "2", label: "医院" },
  { value: "3", label: "教学楼" },
  { value: "4", label: "食堂" },
  { value: "5", label: "炼金室" },
  { value: "6", label: "图书馆" },
  { value: "7", label: "校门" },
  { value: "8", label: "喷泉" }
]

const patrolTimeOptions: AutoCompleteOption[] = [
  { value: "1", label: "白天" },
  { value: "2", label: "黑夜" }
]

const patrolSpecialOptions: AutoCompleteOption[] = [
  { value: "0", label: "默认值" },
  { value: "1", label: "许愿池许愿" }
]

pets["角色校园巡逻"] = {
  onUpdated: function (prev, updated) {
    var prevId;
    if (updated.roleId) {
      prevId = updated.id || prev.id;
      updated.id = updated.roleId + prevId.substr(-2, 2);
    }
  },
  columns: {
    id: {
      style: { locked: true, width: 100 },
      editor: {
        component: "TextEditor",
        props: {
          // 只编辑后两位序列号
          unpack: (str) => str.substr(-2, 2),
          pack: (prevValue, updated) => {
            return prevValue.substr(0, prevValue.length - 2) +
              zeroPadding(updated.substr(0, 2), 2);
          }
        }
      }
    },
    roleId: {
      formatter: referenceFormatter({ belongsTo: "角色表" }),
      editor: referenceEditor({ belongsTo: "角色表", saveAs: ({ label }) => ({ _A: label }) })
    },
    expression: {
      formatter: { component: "AutoCompleteFormatter", props: { options: patrolExpressionOptions } },
      editor: { component: "AutoCompleteEditor", props: { options: patrolExpressionOptions } }
    },
    textId: {
      formatter: referenceFormatter({
        belongsTo: "角色台词表"
      }),
      editor: referenceEditor({
        belongsTo: "角色台词表",
        preFilterOptions: function (row, options) {
          // 801 是巡逻台词
          return options.filter(o => o.activate === "801" && o.unitId === row.roleId);
        }
      })
    },
    clickType: { ...multiAutoCompleteColumn(";", patrolClickOptions) },
    eventType: { ...multiAutoCompleteColumn(";", patrolEventOptions) },
    buildingId: {
      style: { width: 350 },
      formatter: {
        component: "AutoCompleteFormatter",
        props: {
          options: patrolBuildingOptions,
          unpack: (value) => value.split(";"),
          pack: (list) => list.join(";")
        }
      },
      editor: formEditor({
        component: "AutoCompleteControl",
        props: {
          options: patrolBuildingOptions,
          unpack: (value) => value.split(";"),
          pack: (list) => list.join(";")
        }
      })
    },
    timeType: { ...multiAutoCompleteColumn(";", patrolTimeOptions) },
    specialType: { ...multiAutoCompleteColumn(";", patrolSpecialOptions) },
    cpRoleId: {
      style: { width: 400 },
      formatter: {
        component: "ReferenceFormatter",
        props: {
          belongsTo: "角色表",
          unpack: (value) => value.split(";"),
          pack: (list) => list.join(";")
        }
      },
      editor: formEditor({
        component: "ReferenceControl",
        props: {
          belongsTo: "角色表",
          unpack: (value) => value.split(";"),
          pack: (list) => list.sort().join(";")
        }
      })
    },
    _A: { style: { editable: false, locked: true } },
    _N: { style: { hidden: false } }
  }
};

export default pets;
