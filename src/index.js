const { non_static_checkers, static_checkers } = require("./checker.js");
const default_messages = require("./messages.js");

var CheckMate = function (schema, data, require_with = false) {
    if (!(typeof schema === 'object' && schema !== null)) { 
        throw new Error("Schema should be a proper object");
    }

    if (!(typeof data === 'object' && data !== null)) { 
        throw new Error("Data should be a proper object");
    }

    this.schema = schema;
    this.data = data;
    this.require_with = require_with;
    this.current_key = null;
    this.current_value = null;
    this.error = false;
    this.error_messages = [];
}

CheckMate.prototype = {
    
    VALUE_ARRAY: ["number", "float", "int", "string", "bool"],
    
    default_messages: default_messages,

    constructor: CheckMate,

    get_message: function (rule, param, value, label) {
        var message = this.default_messages[rule]!==undefined ? this.default_messages[rule] : `no default messages for ${rule}${param!==undefined ? ":"+param : ""}`;

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
            if (!value.hasOwnProperty("rules")){
                throw new Error(`Rules are not defined for ${key}`);
            }
            if (!value.rules instanceof Array) {
                throw new Error(`Rules are must be in array for ${key}`);
            }

            value.rules = [...new Set(value.rules)]
            
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

        if (this.require_with === true && rules.includes("required")===false) {
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
            if (typeof this[method] === 'function') {
                method_func = this[method].bind(this);
            } else if (typeof CheckMate[`is_${method}`] === 'function') {
                method_func = CheckMate[`is_${method}`];
            }
            if (method_func !== null) { 
                if (data !== null) {
                    var response = param !== null ? method_func(data, param) : method_func(data);
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
                        } else if (method === "cu_check") {
                            if (value.messages.hasOwnProperty(`${method}:${param}`)) {
                                errors.push(value.messages[`${method}:${param}`]); 
                                m_flag = 1;
                            }
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
        
        if (rules.includes("allow_empty")===true && (data==="" || data===null)) {
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

            if (value.hasOwnProperty("errorHandler") && typeof value.errorHandler === "function") {
                value.errorHandler(props);
            }
            
            this.error_messages.push({
                [key]: errors
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

            if (value.hasOwnProperty("successHandler") && typeof value.successHandler === "function") {
                value.successHandler(props);
            }
        }
        
        this.current_key = null;
        this.current_value = null;
    
        return errors.length > 0;

    }

}

Object.assign(CheckMate.prototype, non_static_checkers);
Object.assign(CheckMate, static_checkers);


module.exports = CheckMate;