/*! checkmatejs v1.4.2 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CheckMate = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
      return v > l;
    }

    return v.length > l;
  },

  is_max: function (v, l = null) {
    if (l === undefined || l === null || isNaN(Number(l)))
      throw new Error(
        `${this.current_key} max rule limit is missing or invalid`
      );

    l = Number(l);
    if (v.length === undefined) {
      return v < l;
    }

    return v.length < l;
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

},{}],2:[function(require,module,exports){
const { non_static_checkers, static_checkers } = require("./checker.js");
const default_messages = require("./messages.js");

var CheckMate = function (schema, data, require_with = false) {
  if (!(typeof schema === "object" && schema !== null)) {
    throw new Error("Schema should be a proper object");
  }

  if (!(typeof data === "object" && data !== null)) {
    throw new Error("Data should be a proper object");
  }

  this.schema = schema;
  this.data = data;
  this.require_with = require_with;
  this.current_key = null;
  this.current_value = null;
  this.error = false;
  this.error_messages = [];
};

CheckMate.prototype = {
  VALUE_ARRAY: ["number", "float", "int", "string", "bool"],

  default_messages: default_messages,

  constructor: CheckMate,

  get_message: function (rule, param, value, label) {
    var message =
      this.default_messages[rule] !== undefined
        ? this.default_messages[rule]
        : `no default messages for ${rule}${
            param !== undefined ? ":" + param : ""
          }`;

    if (rule === "min" || rule === "max") {
      if (value.length === undefined) {
        message = message[`${rule}_val`];
      } else {
        message = message[`${rule}_len`];
      }
      message = message.replace("{min}", param);
      message = message.replace("{max}", param);
    }
    message = message.replace("{label}", label);
    message = message.replace("{regex}", param);

    return message;
  },

  check: function () {
    const data = this.data;
    for (const [key, value] of Object.entries(this.schema)) {
      if (!value.hasOwnProperty("rules")) {
        throw new Error(`Rules are not defined for ${key}`);
      }
      if (!value.rules instanceof Array) {
        throw new Error(`Rules are must be in array for ${key}`);
      }

      value.rules = [...new Set(value.rules)];

      var v = data.hasOwnProperty(key) ? data[key] : null;
      var current_error = this.execute(v, key, value);
      if (value.hasOwnProperty("require_with")) {
        if (current_error === true && value.async === false) {
          continue;
        }
        var check = new CheckMate(value.require_with, data, true);
        var res = check.check();

        if (res.error === true) {
          this.error = true;
          this.error_messages = this.error_messages.concat(res.messages);
        }
      }
    }
    return { error: this.error, messages: this.error_messages };
  },

  execute: function (data, key, value) {
    this.current_key = key;
    this.current_value = value;
    var rules = value.rules;
    var label = key;
    if (value.label !== undefined) {
      label = value.label;
    }

    if (this.require_with === true && rules.includes("required") === false) {
      rules.push("required");
    }

    var errors = [];
    for (const rule of rules) {
      var error_flag = 0;

      if (rule.indexOf(":") !== -1) {
        var method = rule.substring(0, rule.indexOf(":"));
        var param = rule.substring(rule.indexOf(":") + 1);
      } else {
        var method = rule;
        var param = null;
      }

      if (method === "allow_empty") {
        continue;
      }

      var method_func = null;
      if (typeof this[method] === "function") {
        method_func = this[method].bind(this);
      } else if (typeof CheckMate[`is_${method}`] === "function") {
        method_func = CheckMate[`is_${method}`];
      }
      if (method_func !== null) {
        if (data !== null) {
          var response =
            param !== null ? method_func(data, param) : method_func(data);
          if (this.VALUE_ARRAY.includes(method)) {
            data = response;
          } else if (response === false) {
            error_flag = 1;
          }
        } else if (method === "required") {
          error_flag = 1;
        }

        if (error_flag == 1) {
          var m_flag = 0;
          if (value.hasOwnProperty("messages")) {
            if (value.messages.hasOwnProperty(method)) {
              errors.push(value.messages[method]);
              m_flag = 1;
            } else if (value.messages.hasOwnProperty(`${method}:${param}`)) {
              errors.push(value.messages[`${method}:${param}`]);
              m_flag = 1;
            }
          }
          if (m_flag === 0) {
            var default_message = this.get_message(method, param, data, label);
            errors.push(default_message);
          }

          if (value.async === false) {
            break;
          }
        }
      } else {
        throw new Error(`Rule ${method} is not found for the field ${key}`);
      }
    }

    if (
      rules.includes("allow_empty") === true &&
      (data === "" || data === null)
    ) {
      errors = [];
    }

    if (errors.length > 0) {
      var props = {
        messages: errors,
        key: key,
        data: this.data,
      };
      if (value.hasOwnProperty("props")) {
        Object.assign(props, value.props);
      }

      if (
        value.hasOwnProperty("errorHandler") &&
        typeof value.errorHandler === "function"
      ) {
        value.errorHandler(props);
      }

      this.error_messages.push({
        [key]: errors,
      });
      this.error = true;
    } else {
      var props = {
        key: key,
        data: this.data,
      };

      if (value.hasOwnProperty("props")) {
        Object.assign(props, value.props);
      }

      if (
        value.hasOwnProperty("successHandler") &&
        typeof value.successHandler === "function"
      ) {
        value.successHandler(props);
      }
    }

    this.current_key = null;
    this.current_value = null;

    return errors.length > 0;
  },
};

Object.assign(CheckMate.prototype, non_static_checkers);
Object.assign(CheckMate, static_checkers);

module.exports = CheckMate;

},{"./checker.js":1,"./messages.js":3}],3:[function(require,module,exports){
const messages = {
  required: "{label} is required.",
  min: {
    min_len: "Minimum length required is {min} characters.",
    min_val: "Minimum value required is {min}.",
  },
  max: {
    max_len: "Maximum length required is {max} characters.",
    max_val: "Maximum value required is {max}.",
  },
  true: "{label} must be true or 1",
  false: "{label} must be false or 0",
  alpha: "{label} must be alphabets only",
  num: "{label} must be numbers only",
  alpha_num: "{label} must be alphabets and numbers only",
  alpha_num_free:
    "{label} allowed characters are alphabets, numbers and ?'\"!-+@%#_*()",
  url: "{label} must be valid url",
  phone: "{label} must be valid phone number",
  email: "{label} must be valid email",
  regex: "{label} must match this regex pattern {regex}",
  regex_pattern: "{label} must match this regex pattern {regex}",
};

module.exports = messages;

},{}]},{},[2])(2)
});
