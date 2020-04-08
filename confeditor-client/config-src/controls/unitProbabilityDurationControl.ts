/** 编辑 单位=概率=出现时间 */
const unitProbabilityDurationControl: ObjectControl = {
  component: "ObjectControl",
  props: {
    unpack: function (str) {
      var parts = str.split("=", 3);
      return {
        unit: parts[0] || "",
        probability: parts[1] || "",
        duration: parts[2] || ""
      };
    },
    pack: function (val) {
      return [val.unit, val.probability, val.duration].join("=");
    },
    inline: true,
    itemControl: [
      {
        field: "unit",
        control: {
          component: "ReferenceControl",
          props: { belongsTo: "角色表", width: "200px" }
        }
      },
      {
        field: "probability",
        control: {
          component: "TextInputControl",
          props: { after: "\u2030" }
        }
      },
      {
        field: "duration",
        control: {
          component: "TextInputControl",
          props: { after: "秒" }
        }
      }
    ]
  }
};

export default unitProbabilityDurationControl;
