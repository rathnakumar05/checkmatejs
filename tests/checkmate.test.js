const CheckMate = require("../src/index");

test("regex_pattern", () => {
  var data = {
    name: "yova",
  };

  var schema = {
    name: {
      rules: ["string", "regex_pattern:name_pattern"],
      regex_patterns: {
        name_pattern: /^[a-zA-Z0-9]+$/,
      },
      label: "Name",
    },
  };

  var checkmate = new CheckMate(schema, data);
  var { error, messages } = checkmate.check();
  expect(error).toBe(false);
});

test("regex_pattern2", () => {
  var data = {
    d_o_b: "yova",
  };

  var schema = {
    d_o_b: {
      rules: ["string", "regex_pattern:name_pattern"],
      regex_patterns: {
        name_pattern: /^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
      },
      messages: {
        "regex_pattern:name_pattern": "d_o_b is not a valid date",
      },
      label: "d_o_b",
    },
  };

  var checkmate = new CheckMate(schema, data);
  var { error, messages } = checkmate.check();
  expect(error).toBe(true);
});

test("cu_check", () => {
  var data = {
    d_o_b: "yova",
  };

  var schema = {
    d_o_b: {
      rules: ["string", "cu_check:name_pattern", "email"],
      props: {
        selector: "id",
      },
      cu_check: {
        name_pattern: function (props) {
          var current_value = props.current_value;
          return /^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(
            current_value
          );
        },
      },
      messages: {
        "cu_check:name_pattern": "d_o_b is not a valid date",
      },
      label: "d_o_b",
      errorHandler: function (props) {
        var messages = props.messages;
        // messages.forEach((el) => {
        //   $(`#${props.selector}`).append(`<p class="text-danger">${el}</p>`);
        // });
      },
      successHandler: function (props) {
        // $(`#${props.selector}`).html('');
      },
    },
  };

  var checkmate = new CheckMate(schema, data);
  var { error, messages } = checkmate.check();
  expect(error).toBe(true);
});

test("require_with", () => {
  var data = {
    name: "luva",
    phone: "+1798345",
  };

  var schema = {
    name: {
      rules: ["string", "required", "alpha_num_free"],
      label: "Name",
      messages: {
        required: "Name is required",
        alpha_num_free: "Name must not contains special characters",
      },
      props: {
        selector: "name",
      },
      errorHandler: function (props) {},
      async: false,
      require_with: {
        phone: {
          rules: ["string", "phone", "min:10", "max:16"],
          async: false,
        },
      },
    },
  };

  var checkmate = new CheckMate(schema, data);
  var { error, messages } = checkmate.check();
  expect(error).toBe(true);
});
