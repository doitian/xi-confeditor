/** 编辑 单位=概率=出现时间 */
const probabilityDurationControl: ObjectControl = {
  component: "ObjectControl",
  props: {
    unpack: function (str) {
      var parts = str.split("=", 2);
      return {
        probability: parts[0] || "",
        duration: parts[1] || ""
      };
    },
    pack: function (val) {
      return [val.probability, val.duration].join("=");
    },
    inline: true,
    itemControl: [
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

export default probabilityDurationControl;
