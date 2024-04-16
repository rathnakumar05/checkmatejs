const non_static_checkers = {
  number: function (v) {
    return Number(v);
  },

  float: function (v) {
    return parseFloat(v);
  },

  int: function (v) {
    return parseInt(v);
  },

  string: function (v) {
    return String(v);
  },

  bool: function (v) {
    return Boolean(v);
  },

  cu_check: function (v, func) {
    if (
      this.current_value !== null &&
      this.current_value.hasOwnProperty("cu_check")
    ) {
      var cu_check = this.current_value["cu_check"];
      if (
        cu_check[func] !== undefined &&
        typeof cu_check[func] === "function"
      ) {
        return cu_check[func]({ current_value: v, data: this.data });
      }
    }
    throw new Error(
      `Rule cu_check:${func} is not found or invalid for the field ${this.current_key}`
    );
  },

  regex_pattern: function (v, pattern) {
    if (
      this.current_value !== null &&
      this.current_value.hasOwnProperty("regex_patterns")
    ) {
      var regex_patterns = this.current_value["regex_patterns"];
      if (
        regex_patterns[pattern] !== undefined &&
        regex_patterns[pattern] instanceof RegExp
      ) {
        return regex_patterns[pattern].test(v);
      }
    }
    throw new Error(
      `Rule regex_pattern:${pattern} is not found or invalid for the field ${this.current_key}`
    );
  },
};

const static_checkers = {
  is_required: function (v) {
    if (v === undefined || v === null) {
      return false;
    }
    return v !== "";
  },

  is_min: function (v, l = null) {
    if (l === undefined || l === null || isNaN(Number(l)))
      throw new Error(
        `${this.current_key} min rule limit is missing or invalid`
      );

    l = Number(l);
    if (v.length === undefined) {
      return v >= l;
    }

    return v.length >= l;
  },

  is_max: function (v, l = null) {
    if (l === undefined || l === null || isNaN(Number(l)))
      throw new Error(
        `${this.current_key} max rule limit is missing or invalid`
      );

    l = Number(l);
    if (v.length === undefined) {
      return v <= l;
    }

    return v.length <= l;
  },

  is_true: function (v) {
    if (v === 1) {
      v = true;
    }

    return v === true;
  },

  is_false: function (v) {
    if (v === 0) {
      v = false;
    }

    return v === false;
  },

  is_alpha: function (v) {
    var pattern = /^[a-zA-Z]+$/;
    return pattern.test(v);
  },

  is_num: function (v) {
    var pattern = /^[0-9]+$/;
    return pattern.test(v);
  },

  is_alpha_num: function (v) {
    var pattern = /^[a-zA-Z0-9]+$/;
    return pattern.test(v);
  },

  is_alpha_num_free: function (v) {
    var pattern = /^[a-zA-Z0-9 ?'"!-+@%#_*()]+$/;
    return pattern.test(v);
  },

  is_email: function (v) {
    var pattern =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return pattern.test(v);
  },

  is_url: function (v) {
    var pattern =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    return pattern.test(v);
  },

  is_phone: function (v) {
    var pattern =
      /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
    return pattern.test(v);
  },

  is_regex: function (v, l = null) {
    var regex = l;
    var mode_pattern = /[g|i|m]{1,3}$/;
    var mode = l.match(mode_pattern);
    mode = mode ? mode[0] : "";

    l = l.replace(mode_pattern, "").slice(1, -1);
    try {
      regex = new RegExp(l, mode);
    } catch (error) {
      throw new Error(`${this.current_key} regex is invalid: ${error}`);
    }

    return regex.test(v);
  },
};

exports.non_static_checkers = non_static_checkers;
exports.static_checkers = static_checkers;
